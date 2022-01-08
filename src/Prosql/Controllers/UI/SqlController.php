<?php
namespace Prosql\Controllers\UI;
use \Monolog\Logger;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use \Prosql\Controllers\BaseController;

class SqlController extends BaseController {
    public function handlePost(Request $req, Response $res, array $args): Mixed {
        switch ($args['action']) {
        case 'prettify':
            $query = $req->getParsedBody()['q'];
            $query = \SqlFormatter::format($query, false);
            return $query;

        case 'split':
            $query = $req->getParsedBody()['q'];
            $queries = \SqlFormatter::splitQuery($query, false);
            return $queries;

        default:
            throw new \Exception('invalid-operation');
        }
    }
}
