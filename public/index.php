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

$app->post('/browser-api/devices/{action}', 'DevicesController:handle');
$app->post('/browser-api/version', 'VersionController:handle');
$app->get('/browser-api/sql/{action}', 'SqlController:handle');
$app->map(['GET', 'POST'], '/browser-api/login/{action}', 'LoginController:handle');

$app->get('[/{params:.*}]','Renderer:handle')
    ->add('SessionAuthMiddleware:handle');

$app->run();
