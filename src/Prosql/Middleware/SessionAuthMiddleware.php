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
        $uri = $request->getUri();
        $path = $uri->getPath();
        $this->logger->debug("Path: $path");
        //$this->logger->debug("debug: $debug");

        if ($path == "/signout") {
            $this->sm->kill();
            $res = new Response();
            return $res->withStatus(302)->withHeader('Location', '/connections');
        }

        if (in_array($path, ['/', '/signin', '/signup', '/read-more', '/install', '/connections'])) {
            $this->sm->write();
            $response = $handler->handle($request);
            return $response;
        }

        $email = $this->sm->getUser()['email'] ?? null;
        $this->logger->debug("email: $email");

        if ($email) {
            //user is logged in, either as guest or registered user
            $this->sm->write();
            $response = $handler->handle($request);
            return $response;
        }

        //force signin
        $res = new Response();
        return $res->withStatus(302)->withHeader('Location', '/signin');
    }
}
