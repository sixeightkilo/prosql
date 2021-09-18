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
$app->post('/api/set-version', function($req, $res, $args) {
    $logger = $this->get('logger');
    $sm = $this->get('session-manager');
    $version = $req->getParsedBody()['version'];
    $deviceId = $req->getParsedBody()['device-id'];
    $logger->debug("post: $version");
    $sm->setVersion($version);
    $sm->setDeviceId($deviceId);
    $sm->write();

    $res->getBody()->write(json_encode(['status' => 'ok', 'data' => null]));
    return $res;
});

$app->get('[/{params:.*}]', function($req, $res, $args) {
	$params = explode('/', $req->getAttribute('params'));

    $sm = $this->get('session-manager');
    $logger = $this->get('logger');

    $renderer = new Renderer($logger, $sm, $this->get('config'));

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
})->add(function(Request $request, RequestHandler $handler) {
    //no changes exepcted in session when rendering pages so write close it
    $sm = $this->get('session-manager');
    $sm->write();

    $response = $handler->handle($request);
    return $response;
});

$app->run();
