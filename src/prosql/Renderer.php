<?php
namespace Prosql;
use \Pug\Pug as Pug;
use Psr\Http\Message\ResponseInterface;

class Renderer {
    private $path;
    public function __construct(\Monolog\Logger $logger, $cache = null) {
        $this->logger = $logger;
        $pug = new Pug(array(
            'prettyprint' => true,
            'extension' => '.pug',
            'cache' => $cache
        ));
        $this->pug = $pug;
    }

    public function setTemplatePath(string $path) {
        $this->path = $path;
    }

    public function render(ResponseInterface $response, string $file, array $data) {
        $filepath = $this->path . $file;
        $body = $response->getBody();
        $body->write($this->pug->render($filepath, $data));
        return $response;
    }
}
