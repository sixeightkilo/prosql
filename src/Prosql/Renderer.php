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
        if (!$agentVersion) {
            //the agent version is not known, just use current agent version
            $agentVersion = $config['version'];
        }

        $agentVersion = "0.6.2";

        //strip off minor version
        $parts = explode(".", $agentVersion);
        $root = "build-{$parts[0]}.{$parts[1]}";

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

    public function handle(Request $req, Response $res, array $args): Response {

        $params = explode('/', $req->getAttribute('params'));

        switch ($params[0]) {
        case '':
            return $this->render($res, "index.pug", []);

        case 'connections':
            return $this->renderConnections($res);

        case 'read-more':
        case 'signup':
        case 'signin':
        case 'install':
            return $this->render($res, "{$params[0]}.pug", []);

        case 'app':
            return $this->renderApp($res, $params[1], []);
        }
    }

    private function renderConnections(Response $response): Response {
        $email = $this->sm->getUser()['email'] ?? null;

        if ($email) {
            $filepath = $this->path . "/connections-user.pug";
        } else {
            $filepath = $this->path . "/connections.pug";
        }

        $body = $response->getBody();
        $body->write($this->pug->render($filepath, $this->config));
        return $response;
    }

    private function render(Response $response, string $file, array $data): Response {
        $filepath = $this->path . "/" . $file;
        $body = $response->getBody();
        $body->write($this->pug->render($filepath, $this->config));
        return $response;
    }

    private function renderApp(Response $res, string $path, array $data): Response {
        $email = $this->sm->getUser()['email'] ?? null;
        $this->logger->debug("email: $email");

        if (!in_array($path, ['tables', 'queries', 'help', 'about'])) {
            return $res->withStatus(404);
        }

        $filepath = $this->path . "/$path.pug";
        $body = $res->getBody();
        $body->write($this->pug->render($filepath, $this->config));
        return $res;
    }
}
