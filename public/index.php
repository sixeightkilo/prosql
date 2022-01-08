<?php
use DI\Container;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Slim\Factory\AppFactory;
use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Prosql\Renderer;
use Prosql\SessionManager;

//all the database timestamps and time related
//logic will operate on UTC
date_default_timezone_set('UTC');

require __DIR__ . '/../vendor/autoload.php';

//create dependency container
require(__DIR__ . "/../src/dependencies.php");

//app
AppFactory::setContainer($container);
$app = AppFactory::create();

$app->post('/worker-api/devices/{action}', 'WorkerDevicesController:handle');
$app->post('/browser-api/devices/{action}', 'UIDevicesController:handle');
$app->post('/browser-api/sql/{action}', 'SqlController:handle')
    ->add('SessionAuthMiddleware:handle');
$app->map(['GET', 'POST'], '/browser-api/login/{action}', 'LoginController:handle');

$app->get('[/{params:.*}]','Renderer:handle')
    ->add('SessionAuthMiddleware:handle');

// Add Error Middleware
$logger = $container->get('lp')->getLogger("ErrorHandler");
require __DIR__ . '/../src/error-handler.php';
$errorMiddleware = $app->addErrorMiddleware(true, true, true, $logger);

$app->run();
