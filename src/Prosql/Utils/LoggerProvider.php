<?php
namespace Prosql\Utils;
use \Monolog\Logger;
use \Monolog\Handler\StreamHandler;
use \Monolog\Processor\UidProcessor;

class LoggerProvider {
    private string $path;
    private string $level;
    private UidProcessor $processor;

    public function __construct(string $path, string $level) {
        $this->path = $path;
        $this->level = $level;
        $this->created = false;
    }

    public function getLogger(string $tag): Logger {
        $logger = new Logger($tag);
        $logger->setTimezone(new \DateTimeZone('Asia/Kolkata'));

        if (!$this->created) {
            $this->uidProcessor = new UidProcessor();
            $this->created = true;
        }

        $logger->pushProcessor($this->uidProcessor);

        if ($level = Logger::DEBUG) {
            //log debug only if requested
            $logger->pushHandler(new StreamHandler("{$this->path}/prosql.log", $level));
        }

        //log errors unconditionally
        $date = date('Y-m-d', time());
        $logger->pushHandler(new StreamHandler("{$this->path}/$date/errors.log", Logger::WARNING));

        return $logger;
    }
}
