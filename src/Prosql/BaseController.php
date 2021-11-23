<?php
namespace Prosql;
use \Monolog\Logger;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use \Prosql\Interfaces\SessionManagerInterface;

class BaseController {
    protected ?Logger $logger;
    public function __construct(\Monolog\Logger $logger, SessionManagerInterface $sm) {
        $this->logger = $logger;
        $this->sm = $sm;
    }

    public function handle(Request $req, Response $res, array $args): Response {
        try {
            $method = $req->getMethod();
            $this->logger->debug("Handling $method");

            switch ($method) {
            case 'GET':
                $data = $this->handleGet($req, $res, $args);
                break;

            case 'POST':
                $data = $this->handlePost($req, $res, $args);
                break;

            default:
                throw new \Exception("invalid-operation");
                break;
            }

            $res->getBody()->write(json_encode([
                'status' => 'ok',
                'data' => $data,
            ]));
            return $res->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            $this->logger->critical($e->getFile() . ':' . $e->getLine() . ':' . $e->getMessage());
            $this->logger->critical($e->getTraceAsString());

            $res->getBody()->write(json_encode([
                'status' => 'error',
                'msg' => $e->getMessage(),
            ]));

            return $res->withHeader('Content-Type', 'application/json');
        }
    }
}
