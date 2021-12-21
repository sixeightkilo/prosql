<?php
namespace Prosql\Middleware;
use \Monolog\Logger;
//use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use \Prosql\Interfaces\SessionManagerInterface;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use \Slim\Psr7\Response;

class SessionAuthMiddleware {
    protected ?Logger $logger;
    public function __construct(\Monolog\Logger $logger, SessionManagerInterface $sm) {
        $this->logger = $logger;
        $this->sm = $sm;
    }

    public function handle(Request $request, RequestHandler $handler): Response {
        $email = $this->sm->getUser()['email'] ?? null;
        if ($email) {
            //user is logged in, either as guest or registered user
            $this->sm->write();
            $response = $handler->handle($request);
            return $response;
        }

        $uri = $request->getUri();
        $path = $uri->getPath();

        $this->logger->debug("Path: $path");

        if (in_array($path, ['/signin', '/signup'])) {
            //don't rediret for these routes
            $this->sm->write();
            $response = $handler->handle($request);
            return $response;
        }

        $res = new Response();
        return $res->withStatus(302)->withHeader('Location', '/signin');
    }
}
