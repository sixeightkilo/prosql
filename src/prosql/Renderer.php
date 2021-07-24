<?php
namespace Prosql;
use \Pug\Pug as Pug;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class Renderer {
    private string $path = "";
    public function __construct(\Monolog\Logger $logger, $cache = null) {
        $this->logger = $logger;
        $pug = new Pug(array(
            'prettyprint' => true,
            'extension' => '.pug',
            'cache' => $cache
        ));
        $this->pug = $pug;
    }

    public function setTemplatePath(string $path): void {
        $this->path = $path;
    }

    public function render(Response $response, string $file, array $data): Response {
        $filepath = $this->path . "/" . $file;
        $body = $response->getBody();
        $body->write($this->pug->render($filepath, $data));
        return $response;
    }

    public function renderApp(Response $res, string $path, array $data) {
        if (!in_array($path, ['content', 'query'])) {
            return $res->withStatus(404);
        }

        $this->logger->debug(print_r($args, true));
        $filepath = $this->path . "/$path.pug";
        $body = $res->getBody();
        $body->write($this->pug->render($filepath, $data));
        return $res;
    }
}
