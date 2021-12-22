<?php
namespace Prosql;
use Prosql\Interfaces\SessionManagerInterface;
use \Monolog\Logger;

class SessionManager implements SessionManagerInterface {
    private ?Logger $logger;
    public function __construct(\Monolog\Logger $logger) {
        $this->logger = $logger;
        session_start();
    }

    public function getSessionId(): string {
        return session_id();
    }
    
    public function setVersion(string $version): void {
        $_SESSION['version'] = $version;
    }

    public function getVersion(): string {
        return $_SESSION['version'] ?? '';
    }

    public function setDeviceId(string $id): void {
        $_SESSION['device-id'] = $id;
    }

    public function getDeviceId(): string {
        return $_SESSION['device-id'] ?? '';
    }

    public function setOs(string $os): void {
        $_SESSION['os'] = $os;
    }

    public function getOs(): string {
        return $_SESSION['os'] ?? '';
    }

    public function setOtp(string $otp): void {
        $_SESSION['otp'] = $otp;
    }

    public function getOtp(): string {
        return $_SESSION['otp'] ?? '';
    }

    public function setUser(array $u): void {
        $_SESSION['user'] = $u;
    }

    public function getUser(): array {
        return $_SESSION['user'] ?? [];
    }

    public function setDbName(string $n): void {
        $_SESSION['db-name'] = $n;
    }

    public function getDbName(): string {
        return $_SESSION['db-name'] ?? '';
    }

    public function setTempUser(array $u): void {
        $_SESSION['temp-user'] = $u;
    }

    public function getTempUser(): array {
        return $_SESSION['temp-user'] ?? [];
    }

    public function reset() {
        $this->setVersion('');
        $this->setDeviceId('');
        $this->setOs('');
        $this->setOtp('');
        $this->setUser([]);
        $this->setTempUser([]);
        $this->setDbName('');
    }

    public function kill() {
        $this->reset();
        $this->write();
    }

    public function write() {
        session_write_close();
    }
}
