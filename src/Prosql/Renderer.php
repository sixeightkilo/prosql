<?php
namespace Prosql;
use \Pug\Pug as Pug;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use \Monolog\Logger;
use Prosql\Interfaces\SessionManagerInterface;

class Renderer {
    private string $path = "";
    private ?Logger $logger = null;
    private ?Pug $pug = null;
    private ?SessionManagerInterface $sm = null;
    private array $config = [];

    public function __construct(Logger $logger, SessionManagerInterface $sm, array $config) {
        $this->logger = $logger;
        $this->sm = $sm;

        $pug = new Pug(array(
            'prettyprint' => true,
            'extension' => '.pug',
            'cache' => null
        ));
        $this->pug = $pug;

        //we render different files for different agent versions
        $agentVersion = $sm->getVersion();
        $root = "build-{$agentVersion}";

        if ($config['env'] == 'dev') {
            $appVersion = rand(1, 10000);//clears cache during dev
        } else {
            $appVersion = $config[$root]['version'];
        }

        $this->config = [
            'root' => $root,
            'version' => $appVersion
        ];

        $this->path = __DIR__ . "/../../public/$root/templates";
    }

    public function render(Response $response, string $file, array $data): Response {
        $filepath = $this->path . "/" . $file;
        $body = $response->getBody();
        $body->write($this->pug->render($filepath, $this->config));
        return $response;
    }

    public function renderApp(Response $res, string $path, array $data): Response {
        if (!in_array($path, ['content', 'query'])) {
            return $res->withStatus(404);
        }

        $filepath = $this->path . "/$path.pug";
        $body = $res->getBody();
        $body->write($this->pug->render($filepath, $this->config));
        return $res;
    }
}
