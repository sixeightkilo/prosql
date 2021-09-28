<?php
namespace Prosql;
use Prosql\Interfaces\SessionManagerInterface;
use \Monolog\Logger;

class SessionManager implements SessionManagerInterface {
    private ?Logger $logger;
    public function __construct(\Monolog\Logger $logger) {
        $this->logger = $logger;
        $this->logger->debug('constructor');
        session_start();
    }
    
    public function setVersion(string $version) {
        $_SESSION['version'] = $version;
    }

    public function getVersion(): string {
        return $_SESSION['version'] ?? '';
    }

    public function setDeviceId(string $id) {
        $_SESSION['device-id'] = $id;
    }

    public function getDeviceId(): string {
        return $_SESSION['device-id'] ?? '';
    }

    public function setOs(string $os) {
        $_SESSION['os'] = $os;
    }

    public function getOs(): string {
        return $_SESSION['os'] ?? '';
    }

    public function reset() {
        $this->setVersion('');
        $this->setDeviceId('');
        $this->setOs('');
    }

    public function kill() {
        $this->reset();
        $this->write();
    }

    public function write() {
        session_write_close();
    }
}
