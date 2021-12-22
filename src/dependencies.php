<?php
use DI\Container;
use Monolog\Logger;
use Prosql\{SessionManager, VersionController, DevicesController, SqlController, LoginController, Renderer, Emailer};
use Prosql\Models\{User, Device};
use Prosql\Utils\{PDOUtils, LoggerProvider};
use Prosql\Middleware\{SessionAuthMiddleware};

require __DIR__ . '/../vendor/autoload.php';

//dependencies
$container = new Container();
$container->set('lp', function() {
    $lp = new LoggerProvider(__DIR__ . '/../logs/prosql.log', Logger::DEBUG);
    return $lp;
});

$container->set('config', function() {
    $config = require(__DIR__ . "/../config.php");
    return $config;
});

$container->set('session-manager', function() use ($container) {
    $logger = $container->get('lp')->getLogger('SessionManager');
    return new SessionManager($logger);
});

$container->set('DevicesController', function() use ($container) {
    $sm = $container->get('session-manager');

    $logger = $container->get('lp')->getLogger('Device');
    $device = new Device($logger, $container->get('db'));

    $logger = $container->get('lp')->getLogger('DevicesController');
    $devicesController = new DevicesController($logger, $sm);

    $devicesController->setDevice($device);

    return $devicesController;
});

$container->set('VersionController', function() use ($container) {
    $logger = $container->get('lp')->getLogger('VersionController');
    $sm = $container->get('session-manager');
    return new VersionController($logger, $sm);
});

$container->set('SqlController', function() use ($container) {
    $logger = $container->get('lp')->getLogger('SqlController');
    $sm = $container->get('session-manager');
    return new SqlController($logger, $sm);
});

$container->set('SessionAuthMiddleware', function() use ($container) {
    $logger = $container->get('lp')->getLogger('SessionAuthMiddleware');
    $sm = $container->get('session-manager');
    return new SessionAuthMiddleware($logger, $sm);
});

$container->set('Renderer', function() use ($container) {
    $logger = $container->get('lp')->getLogger('Renderer');
    $sm = $container->get('session-manager');
    $config = $container->get('config');
    return new Renderer($logger, $sm, $config);
});

$container->set('db', function() use ($container) {
    $logger = $container->get('lp')->getLogger('PDOUtils');
    $db = new PDOUtils($logger);
    $db->openDB($container->get('config')['db-path']);
    return $db;
});

$container->set('LoginController', function() use ($container) {
    $logger = $container->get('lp')->getLogger('LoginController');
    $sm = $container->get('session-manager');
    $loginController = new LoginController($logger, $sm);

    $logger = $container->get('lp')->getLogger('Emailer');
    $emailer = new Emailer($logger, $container->get('config')['sendgrid-key']);

    $logger = $container->get('lp')->getLogger('User');
    $user = new User($logger, $container->get('db'));

    $logger = $container->get('lp')->getLogger('Device');
    $device = new Device($logger, $container->get('db'));

    $loginController->setEmailer($emailer)
        ->setDownloadPath($container->get('config')['download-path'])
        ->setUser($user)
        ->setDevice($device);
    return $loginController;
});
