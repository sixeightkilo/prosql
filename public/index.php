<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;

require __DIR__ . '/../vendor/autoload.php';

$app = AppFactory::create();

$app->get('/', function (Request $request, Response $response, $args) {
    $pug = new Pug;
    $response->getBody()->write($pug->renderFile(__DIR__ . "/index.pug"));
    return $response;
});

$app->run();
