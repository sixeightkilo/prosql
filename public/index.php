<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;
use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Prosql\Renderer;
require __DIR__ . '/../vendor/autoload.php';

$app = AppFactory::create();

$app->get('[/{params:.*}]', function($req, $res, $args) {
	$params = explode('/', $req->getAttribute('params'));

    $logger = new Logger('login');
    $logger->pushHandler(new StreamHandler(__DIR__ . '/../logs/login.log', Logger::DEBUG));

    $renderer = new Renderer($logger);

	switch ($params[0]) {
	case '':
        return $renderer->render($res, __DIR__ . "/templates/index.pug", []);

	case 'login':
        return $renderer->render($res, __DIR__ . "/templates/login.pug", []);

	case 'install':
        return $renderer->render($res, __DIR__ . "/templates/install.pug", []);

	case 'app':
        return $renderer->render($res, __DIR__ . "/templates/app.pug", []);

	case 'prettify':
        $query = $req->getQueryParams()['q'];
        $query = SqlFormatter::format($query, false);

        $res->getBody()->write(json_encode(['status' => 'ok', 'query' => $query]));

        return $res;
    }
});

$app->run();
