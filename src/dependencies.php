<?php
use DI\Container;
use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Monolog\Processor\UidProcessor;
use Prosql\{SessionManager, VersionController, SqlController, LoginController, Renderer, Emailer};
use Prosql\Models\{User};
use Prosql\Utils\{PDOUtils};

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

$container->set('Renderer', function() use ($container) {
    $logger = $container->get('logger');
    $sm = $container->get('session-manager');
    $config = $container->get('config');
    return new Renderer($logger, $sm, $config);
});

$container->set('db', function() use ($container) {
    $logger = $container->get('logger');
    $db = new PDOUtils($logger);
    $db->openDB($container->get('config')['db-path']);
    return $db;
});

$container->set('LoginController', function() use ($container) {
    $logger = $container->get('logger');
    $sm = $container->get('session-manager');
    $loginController = new LoginController($logger, $sm);
    $loginController->setDownloadPath($container->get('config')['download-path']);

    $emailer = new Emailer($logger, $container->get('config')['sendgrid-key']);
    $user = new User($logger, $container->get('db'));

    $loginController->setEmailer($emailer);
    return $loginController;
});
