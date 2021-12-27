<?php
namespace Prosql\Utils;

class TransactionHelper {
    private $logger;
    function __construct(\Monolog\Logger $logger) {
        $this->logger = $logger;
    }

    public function perform(\PDO $db, $context, \Closure $callback) {
        try {
            $db->startTransaction();
            $callback->bindTo($context);
            $callback();
            $db->commitTransaction();
        } catch (\Exception $e) {
            $db->rollbackTransaction();

            if ($e instanceof \PDOException) {
                $this->logger->addCritical($e->getMessage());
                $this->logger->addCritical($e->getTraceAsString());
                throw new \Exception("DB Error. Please try again");
            }

            throw $e;
        }
    }
}

