<?php
namespace Prosql;
use Prosql\Interfaces\SessionManagerInterface;

class SessionManager implements SessionManagerInterface {
    private $mLogger;
    public function __construct(\Monolog\Logger $logger) {
        $this->logger = $logger;
        $this->logger->debug('constructor');
        session_start();
    }
    
    public function setVersion(string $version) {
        $_SESSION['version'] = $version;
    }

    public function getVersion(): string {
        return $_SESSION['version'];
    }

    public function restartSession(array $sessionParams) {
        $this->kill();
        session_start();

        $this->setVersion('');
        $this->write();
    }

    public function reset() {
        $this->setVersion('');
    }

    public function kill() {
        $this->reset();
        $this->write();
    }

    public function write() {
        session_write_close();
    }
}
