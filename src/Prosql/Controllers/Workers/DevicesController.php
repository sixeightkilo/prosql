<?php
namespace Prosql\Controllers\Workers;
use \Monolog\Logger;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use \Prosql\Models\{Device, User};
use \Prosql\RedirectException;
use \Prosql\Controllers\BaseController;

class DevicesController extends BaseController {
    public function setDevice(Device $d): void {
        $this->device = $d;
    }

    public function handlePost(Request $req, Response $res, array $args): Mixed {
        $deviceId = $req->getParsedBody()['device-id'];
        $version = $req->getParsedBody()['version'];
        $os = $req->getParsedBody()['os'] ?? "unknown";

        //save device info if not already saved
        $id = $this->device->get(['id'], [
            ['device_id', '=', $deviceId]
        ])[0]['id'] ?? null;

        if (!$id) {
            $id = $this->device->save([
                'device_id' => $deviceId,
                'version' => $version,
                'os' => $os,
            ]);
        }

        $this->logger->debug("Saved $deviceId to $id");

        //The workers should continue to work even if the user is not signed in (even as guest)
        //This is especially important for connections page. Because user might visit connections
        //page in a different browser, having saved some connections in the current browser.

        //If user is signed in as guest or not signed at all then we use deviceId as the db
        //If user is signed in then we use her email as the db
        $userEmail = $this->sm->getUser()['email'] ?? User::GUEST_EMAIL;

        return [
            'db' => ($userEmail == User::GUEST_EMAIL) ? $deviceId : $userEmail
        ];
    }
}
