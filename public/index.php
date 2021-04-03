<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;

require __DIR__ . '/../vendor/autoload.php';

$app = AppFactory::create();

$app->get('[/{params:.*}]', function($req, $res, $args) {
	$params = explode('/', $req->getAttribute('params'));

    $pug = new Pug;
	switch ($params[0]) {
	case '':
        $res->getBody()->write($pug->renderFile(__DIR__ . "/templates/app.pug"));
        return $res;
    }

});

$app->run();
