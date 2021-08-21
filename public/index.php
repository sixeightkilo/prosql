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
    $renderer->setTemplatePath(__DIR__ . "/templates");

	switch ($params[0]) {
	case '':
        return $renderer->render($res, "index.pug", []);

	case 'read-more':
        return $renderer->render($res, "read-more.pug", []);

	case 'login':
        return $renderer->render($res, "login.pug", []);

	case 'install':
        return $renderer->render($res, "install.pug", []);

	case 'app':
        return $renderer->renderApp($res, $params[1], []);

	case 'prettify':
        $query = $req->getQueryParams()['q'];
        $query = SqlFormatter::format($query, false);

        $res->getBody()->write(json_encode(['status' => 'ok', 'data' => $query]));

        return $res;

    case 'split':
        $query = $req->getQueryParams()['q'];
        $queries = SqlFormatter::splitQuery($query, false);
        $res->getBody()->write(json_encode(['status' => 'ok', 'data' => $queries]));

        return $res;
    }
});

$app->run();
