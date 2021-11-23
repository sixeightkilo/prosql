<?php
namespace Prosql;
use \Monolog\Logger;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class VersionController extends BaseController {
    public function handlePost(Request $req, Response $res, array $args): Mixed {
        $version = $req->getParsedBody()['version'];
        $deviceId = $req->getParsedBody()['device-id'];
        $os = $req->getParsedBody()['os'] ?? "unknown";

        $this->sm->setVersion($version);
        $this->sm->setDeviceId($deviceId);
        $this->sm->setOs($os);

        $this->sm->write();

        return null;
    }
}
