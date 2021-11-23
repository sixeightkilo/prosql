<?php
use DI\Container;
use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Monolog\Processor\UidProcessor;
use Prosql\{SessionManager, VersionController, SqlController};

require __DIR__ . '/../vendor/autoload.php';

//dependencies
$container = new Container();
$container->set('logger', function() {
    $logger = new Logger('MyProsql');
    $logger->pushHandler(new StreamHandler(__DIR__ . '/../logs/prosql.log', Logger::DEBUG));
    $logger->pushProcessor(new UidProcessor());
	return $logger;
});

$container->set('config', function() {
    $config = require(__DIR__ . "/../config.php");
    return $config;
});

$container->set('session-manager', function() use ($container) {
    $logger = $container->get('logger');
    return new SessionManager($logger);
});

$container->set('VersionController', function() use ($container) {
    $logger = $container->get('logger');
    $sm = $container->get('session-manager');
    return new VersionController($logger, $sm);
});

$container->set('SqlController', function() use ($container) {
    $logger = $container->get('logger');
    $sm = $container->get('session-manager');
    return new SqlController($logger, $sm);
});
