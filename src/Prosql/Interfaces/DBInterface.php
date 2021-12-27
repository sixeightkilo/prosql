<?php
namespace Prosql\Interfaces;

interface DBInterface {
    public function openDB(string $dbName);
    public function closeDB();
    public function getLastInsertId();
    public function select(string $tableName, array $input);
    public function delete(string $tableName, array $input);
    public function insert(string $tableName, array $input);
    public function update(string $tableName, array $input);
    public function getPDOConnection();
}
