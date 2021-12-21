<?php
namespace Prosql;
use \Monolog\Logger;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use \Prosql\Models\Device;
use \Prosql\RedirectException;

class DevicesController extends BaseController {
    const MAX_GUEST_DAYS = 15;//force users to signin after MAX_GUEST_DAYS

    public function setDevice(Device $d): void {
        $this->device = $d;
    }

    public function handlePost(Request $req, Response $res, array $args): Mixed {
        $deviceId = $req->getParsedBody()['device-id'];
        $version = $req->getParsedBody()['version'];
        $os = $req->getParsedBody()['os'] ?? "unknown";

        //upsert
        $id = $this->device->save([
            'device_id' => $deviceId,
            'version' => $version,
            'os' => $os,
        ]);

        $device = $this->device->get(['user_id', 'created_at'], [
            ['id', '=', $id]
        ])[0];

        //the user can continue as guest for MAX_GUEST_DAYS. But if she has signed up 
        //before that she must signin to use the app

        $registeredAt = \DateTime::createFromFormat(Device::TIMESTAMP_FORMAT, $device['created_at']);
        $now = new \DateTime;
        $days = $now->diff($registeredAt)->format("%a");

        $user = $this->sm->getUser()['email'] ?? '';

        $signinRequired = false;
        if ($days > self::MAX_GUEST_DAYS) {
            if (!$user) {
                $signinRequired = true;
            }
        } else {
            //signed in and then got logged out
            //user_id will have a valid only if the user has signed up
            if ($device['user_id'] && !$user) {
                $signinRequired = true;
            }
        }

        $this->logger->debug("user_id: {$device['user_id']} user: $user days: $days signin-required $signinRequired");

        if ($signinRequired) {
            throw new RedirectException("/signin");
        }

        return [
            'session-id' => $this->sm->getSessionId(),
            'db-name' => $this->sm->getDbName(),
        ];
    }
}
