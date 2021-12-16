<?php
namespace Prosql\Models;
use \Prosql\Interfaces\DBInterface;

class BaseModel {
    protected static string $table;
    protected DBInterface $db;
    protected \PDO $pdo;
    protected \Monolog\Logger $logger;

    const INPUT_DATE_FORMAT = "d/M/Y";
    const STORAGE_DATE_FORMAT = "Y-m-d";
    const TIMESTAMP_FORMAT = "Y-m-d H:i:s";

    function __construct(\Monolog\Logger $logger, DBInterface $db) {
        $this->db = $db;
        $this->logger = $logger;
        $this->pdo = $this->db->getPDOConnection();
    }

    function startTransaction(): void {
        $this->pdo->beginTransaction();
    }

    function commitTransaction(): void {
        $this->pdo->commit();
    }

    function rollbackTransaction(): void {
        $this->pdo->rollback();
    }

    function getFromTable($table, $result, $where) {
        $mappedWhere = [];
        foreach ($where as $w) {
            array_push($mappedWhere, [
                $w[0], $w[1], $w[2]
            ]);
        }

        $data = $this->db->select($table, [
            'result' => $result,
            'criteria' => $mappedWhere
        ]);

        return $data;
    }

    function get($result, $where) {
        return $this->getFromTable(static::$table, $result, $where);
    }

    function getChild($childTable, $result, $where) {
        return $this->getFromTable($childTable, $result, $where);
    }

    function saveToTable($table, $values) {
        $mappedValues = [];
        $mappedWhere = [];
        foreach ($values as $k => $v) {
            array_push($mappedValues, [
                $k, $v
            ]);
        }

        $this->db->insert($table, [
            'values' => $mappedValues,
        ]);

        return $this->db->getLastInsertId();
    }

    function save(array $values) {
        return $this->saveToTable(static::$table, $values);
    }

    function saveChild($childTable, $values) {
        return $this->saveToTable($childTable, $values);
    }

    function updateTable($table, $values, $where) {
        $mappedValues = [];
        $mappedWhere = array();
        foreach ($values as $k => $v) {
            array_push($mappedValues, [
                $k, $v
            ]);
        }

        foreach ($where as $w) {
            array_push($mappedWhere, [
                $w[0], $w[1], $w[2]
            ]);
        }

        return $this->db->update($table, [
            'values' => $mappedValues,
            'criteria' => $mappedWhere
        ]);
    }

    function update($values, $where) {
        return $this->updateTable(static::$table, $values, $where);
    }

    function updateChild($table, $values, $where) {
        return $this->updateTable($table, $values, $where);
    }

    function delete($where) {
        return $this->deleteFromTable(static::$table, $where);
    }

    function deleteChild($table, $where) {
        return $this->deleteFromTable($table, $where);
    }

    function deleteFromTable($table, $where) {
        $mappedWhere = [];
        foreach ($where as $w) {
            array_push($mappedWhere, [
                $w[0], $w[1], $w[2]
            ]);
        }

        $this->db->delete($table, [
            'criteria' => $mappedWhere
        ]);
    }
}
