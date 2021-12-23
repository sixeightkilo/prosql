<?php
namespace Prosql\Controllers\UI;
use \Monolog\Logger;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use \Prosql\Models\{Device, User};
use \Prosql\RedirectException;
use \Prosql\Controllers\BaseController;

class DevicesController extends BaseController {
    use \Prosql\Traits\SigninTrait;

    public function setDevice(Device $d): void {
        $this->device = $d;
    }

    public function handlePost(Request $req, Response $res, array $args) {
        $deviceId = $req->getParsedBody()['device-id'];
        $version = $req->getParsedBody()['version'];
        $os = $req->getParsedBody()['os'] ?? "unknown";

        //todo: we are doing an update every time. Not necessary
        //upsert
        $id = $this->device->save([
            'device_id' => $deviceId,
            'version' => $version,
            'os' => $os,
        ]);

        $device = $this->device->get(['user_id', 'created_at'], [
            ['id', '=', $id]
        ])[0];

        $signinRequired = $this->signinRequired($device);
        //debug
        $signinRequired = true;

        if ($signinRequired) {
            //kill sessions if any
            $this->sm->kill();
            throw new RedirectException("/signin");
        }


        //continue as guest
        $this->sm->setUser([
            'first-name' => User::GUEST_FIRST_NAME,
            'last-name' => User::GUEST_LAST_NAME,
            'email' => User::GUEST_EMAIL
        ]);
    }
}
