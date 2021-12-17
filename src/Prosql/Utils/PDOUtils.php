<?php
namespace Prosql\Utils;
use Monolog\Logger;

class PDOUtils implements \Prosql\Interfaces\DBInterface {
	private $connection;
	private $logger;
	private $params;
	private $pdo;
	private $dbName;

	function __construct(\Monolog\Logger $logger) {
		$this->logger = $logger;
	}

	public function openDB(string $dbname): \PDO {
		$this->pdo = new \PDO("sqlite:$dbname");
		return $this->pdo;
	}

	public function select(string $table, array $input): array {
		try {	
			//offsets into criteria array
			$column = 0;
			$operator = 1;
			$value = 2;
			$type = 3;

			$params = array();
			$columns = "";
			$keys = "";
			$format = "";

			if ($input["result"] === "*") {
				$input['result'] = [];

				//first determine column names
				$sql = "show columns from `$table`";
				$stmt = $this->pdo->prepare($sql);
				$stmt->execute();
				while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
					$input['result'][] = $row['Field'];
				}
			}

			//we have got column names here, either from input or from 'show 
			//columns'
			foreach ($input["result"] as $c) {
				$columns .= "`$c`,";
			}

			//replace trailing ","
			$columns = preg_replace("/,$/", "", $columns);

			$params = [];
			//criteria may or may not be set
			if (isset($input["criteria"])) {
				foreach ($input["criteria"] as $c) {
					$placeHolder = preg_replace("/\-/", "_", $c[$column]);
					$keys .= "`{$c[$column]}` {$c[$operator]} :$placeHolder and ";
					$params[$placeHolder] = $c[$value];
				}

				$keys = preg_replace("/ and $/", "", $keys);
			} else {
				$keys = "1";
			}

			$sql = "select $columns from `$table` where $keys";
			$this->logger->debug(__LINE__ . '::' .  $sql);;
			$stmt = $this->pdo->prepare($sql);

			$stmt->execute($params);
			return $stmt->fetchAll(\PDO::FETCH_ASSOC);

		} catch (\Exception $e) {
			$this->logger->critical(__LINE__ . '::' .  $e->getMessage());
			throw new \Exception('DB Error');
		}
	}

	public function delete(string $table, array $input): void {
		try {
			$column = 0;
			$operator = 1;
			$value = 2;
			$type = 3;

			$keys = "";
			$format = "";
			$params = [];

			foreach ($input["criteria"] as $c) {
				$placeHolder = preg_replace("/\-/", "_", $c[$column]);
				$keys .= "`{$c[$column]}` {$c[$operator]} :$placeHolder and ";
				$params[$placeHolder] = $c[$value];
			}

			$keys = preg_replace("/ and $/", "", $keys);
			$sql = "delete from `$table` where $keys";
			$this->logger->debug(__LINE__ . '::' .  $sql);;

			$stmt = $this->pdo->prepare($sql);
			$stmt->execute($params);

		} catch (\Exception $e) {
			$this->logger->critical(__LINE__ . '::' .  $e->getMessage());
			throw new \Exception('DB Error');
		}
	}

	public function insert(string $table, array $input): void {
		try {
			$column = 0;
			$value = 1;
			$type = 2;

			$params = array();
			$keys = "";
			$values = "(";
			$format = "";
			$columns = "(";

			foreach ($input["values"] as $c) {
				$columns .= "`" . $c[$column] . "`,";
			}
			$columns = preg_replace("/,$/", "", $columns);
			$columns .= ")";

			$params = [];
			foreach ($input["values"] as $c) {
				$placeHolder = preg_replace("/\-/", "_", $c[$column]);
				$values .= ":$placeHolder, ";
				$keys .= "`" . $c[$column] . "` = :$placeHolder,";
				$params[$placeHolder] = $c[$value];
			}

			$values = preg_replace("/, $/", "", $values);
			$values .= ")";
			$keys = preg_replace("/,$/", "", $keys);
			$sql = "insert into `$table` $columns values $values";

			$this->logger->debug(__LINE__ . '::' .  $sql);;
			$stmt = $this->pdo->prepare($sql);

			$stmt->execute($params);

		} catch (\Exception $e) {
			$this->logger->critical(__LINE__ . '::' .  $e->getMessage());
			throw new \Exception('DB Error');
		}
	}

	public function update(string $table, array $input): int {
		try {
			$column = 0;
			$value = 1;
			$valueType = 2;
			$operator = 1;
			$criteriaType = 3;
			$criteriaValue = 2;

			$params = array();
			$keys = "";
			$format = "";
			$columns = "";

			$values = [];
			foreach ($input["values"] as $c) {
				$placeHolder = preg_replace("/\-/", "_", $c[$column]);
				$columns .= "`" . $c[$column] . "` = :$placeHolder, ";
				$values[$placeHolder] = $c[$value];
			}

			$columns = preg_replace("/, $/", "", $columns);

			$criteria = [];
			foreach ($input["criteria"] as $c) {
				$placeHolder = preg_replace("/\-/", "_", $c[$column]);
				$keys .= "`" . $c[$column] . "` " . $c[$operator] . " :$placeHolder and ";
				$criteria[$placeHolder] = $c[$criteriaValue];
			}

			$keys = preg_replace("/ and $/", "", $keys);
			$sql = "update `$table` set $columns where $keys";
			$this->logger->debug(__LINE__ . '::' . $sql);
			$stmt = $this->pdo->prepare($sql);

			$params = [];
			foreach ([$values, $criteria] as $arr) {
				foreach ($arr as $k => $v) {
					$params[$k] = $v;
				}
			}

			$stmt->execute($params);
			return $stmt->rowCount();

		} catch (\Exception $e) {
			$this->logger->critical(__LINE__ . '::' . $e->getMessage());
			throw new \Exception('DB Error');
		}
	}

	public function closeDB(): void {
		$this->pdo = null; 
	}

	public function getLastInsertId(): int {
		return $this->pdo->lastInsertId();
	}

	public function getAutoIncrement(string $table): int {
		$query = "
			select `auto_increment`
			from  information_schema.tables
			where table_schema = '{$this->dbName}'
			and table_name   = '$table'";
		$stmt = $this->pdo->prepare($query);
		$stmt->execute();

		return $stmt->fetch(\PDO::FETCH_ASSOC)['auto_increment'];
	}

	public function setAutoIncrement(string $table, int $value): void {
		$query = "alter table `$table` auto_increment = $value";
		$stmt = $this->pdo->prepare($query);
		$stmt->execute();
	}

	public function getPDOConnection(): \PDO {
        return $this->pdo;
    }
}

