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

require __DIR__ . '/../vendor/autoload.php';

//create dependency container
require(__DIR__ . "/../src/dependencies.php");

//app
AppFactory::setContainer($container);
$app = AppFactory::create();

$app->post('/browser-api/version', 'VersionController:handle');
$app->get('/browser-api/sql/{action}', 'SqlController:handle');
$app->map(['GET', 'POST'], '/browser-api/login/{action}', 'LoginController:handle');

$app->get('/browser-api/session', function($req, $res, $args) {
    $sm = $this->get('session-manager');
    $res->getBody()->write(json_encode([
        'status' => 'ok',
        'data' => [
            'session-id' => $sm->getSessionId()
        ]
    ]));
    return $res->withHeader('Content-Type', 'application/json');
});

$app->get('[/{params:.*}]','Renderer:handle')
    ->add(function(Request $request, RequestHandler $handler) {
        //no changes exepcted in session when rendering pages so write close it
        $sm = $this->get('session-manager');
        $sm->write();

        $response = $handler->handle($request);
        return $response;
    });

$app->run();
