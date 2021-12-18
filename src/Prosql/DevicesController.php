<?php
namespace Prosql;
use \Monolog\Logger;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use \Prosql\Models\Device;

class DevicesController extends BaseController {
    const MAX_GUEST_DAYS = 15;//force users to signup after MAX_GUEST_DAYS

    public function setDevice(Device $d): void {
        $this->device = $d;
    }

    public function handlePost(Request $req, Response $res, array $args): Mixed {
        $deviceId = $req->getParsedBody()['device-id'];
        $this->device->save([
            'device_id' => $deviceId
        ]);

        $registeredAt = $this->device->get(['created_at'], [
            ['device_id', '=', $deviceId]
        ])[0]['created_at'];

        $registeredAt = \DateTime::createFromFormat(Device::TIMESTAMP_FORMAT, $registeredAt);
        $now = new \DateTime;
        $days = $now->diff($registeredAt)->format("%a");
        $this->logger->debug("days: $days");

        return [
            //'signup-required' => ($days > self::MAX_GUEST_DAYS) ? true : false,
            'signup-required' => true,
            'session-id' => $this->sm->getSessionId(),
            'user' => $this->sm->getUser()
        ];
    }
}
