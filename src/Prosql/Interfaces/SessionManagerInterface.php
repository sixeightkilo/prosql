<?php
namespace Prosql\Interfaces;

interface SessionManagerInterface {
    public function setVersion(string $string);
    public function getVersion(): string;
    public function reset();
    public function kill();
    public function write();
}
