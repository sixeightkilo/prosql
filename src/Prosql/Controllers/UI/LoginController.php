<?php
namespace Prosql\Controllers\UI;
use \Monolog\Logger;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use \Prosql\Interfaces\{EmailerInterface, SessionManagerInterface};
use \Prosql\Utils\Validator as V;
use \Prosql\Models\{User, Device};
use \Prosql\Controllers\BaseController;
use \Pug\Pug as Pug;

class LoginController extends BaseController {
    const MIN = 100000;
    const MAX = 999999;

    private string $path = "";

    public function __construct(Logger $logger, SessionManagerInterface $sm) {
        parent::__construct($logger, $sm);
        $this->pug = new Pug(array(
            'prettyprint' => true,
            'extension' => '.pug',
            'cache' => null
        ));
    }

    public function setDownloadPath(string $path): LoginController {
        $this->path = $path;
        return $this;
    }

    public function setEmailer(EmailerInterface $emailer): LoginController {
        $this->emailer = $emailer;
        return $this;
    }

    public function setUser(User $u): LoginController {
        $this->user = $u;
        return $this;
    }

    public function setDevice(Device $d): LoginController {
        $this->device = $d;
        return $this;
    }

    public function handleGet(Request $req, Response $res, array $args): Mixed {
        switch ($args['action']) {
        case 'get-captcha':
            return $this->getCaptcha();

        default:
            throw new \Exception('invalid-operation');
        }
    }

    public function handlePost(Request $req, Response $res, array $args): Mixed {
        switch ($args['action']) {
        case 'set-signup-otp':
            return $this->setSignupOtp($req);

        case 'set-signin-otp':
            return $this->setSigninOtp($req);

        case 'signup':
            return $this->signup($req);

        case 'signin':
            return $this->signin($req);

        default:
            throw new \Exception('invalid-operation');
        }
    }

    private function signup(Request $req): void {
        $otp = $req->getParsedBody()['otp'];
        if ($this->sm->getOtp() != $otp) {
            throw new \Exception("Invalid otp");
        }

        $user = $this->sm->getTempUser();
        $this->logger->debug("Signing up:" . print_r($user, true));
        $userId = $this->user->save([
            'first_name' => $user['first-name'],
            'last_name' => $user['last-name'],
            'email' => $user['email']
        ]);

        $this->device->setUserId($this->sm->getDeviceId(), $userId);

        $this->sm->setTempUser([]);
        $this->sm->setOtp('');
        $this->sm->setUser($user);
        $this->sm->write();
    }

    private function signin(Request $req): void {
        $otp = $req->getParsedBody()['otp'];
        if ($this->sm->getOtp() != $otp) {
            throw new \Exception("Invalid otp");
        }

        $user = $this->sm->getTempUser();
        $this->logger->debug("Signing in:" . print_r($user, true));
        $user = $this->user->get(['id', 'first_name', 'last_name', 'email'], [
            ['email', '=', $user['email']]
        ])[0];

        $this->device->setUserId($this->sm->getDeviceId(), $user['id']);

        $this->sm->setTempUser([]);
        $this->sm->setOtp('');
        $this->sm->setUser($user);
        $this->sm->write();
    }

    private function setSignupOtp(Request $req): void {
        $params = $req->getParsedBody();
        //$id = $params['captcha-id'];
        //$value = $params['captcha-value'];
        //$this->verifyCaptcha($id, $value);

        V::validate([
            ['field' => $params['first-name'], 'alias' => 'First name', 'rules' => [V::NOT_EMPTY]],
            ['field' => $params['last-name'], 'alias' => 'Last name', 'rules' => [V::NOT_EMPTY]],
            ['field' => $params['email'], 'alias' => 'email', 'rules' => [V::IS_EMAIL]],
        ]);

        //check if user already registered
        $email = $this->user->get(['email'], [
            ['email', '=', $params['email']]
        ])[0]['email'] ?? null;

        $this->logger->debug("email: $email");

        if ($email) {
            throw new \Exception("Already registered. Please sign in");
        }

        $otp = random_int(self::MIN, self::MAX);

        $this->sm->setOtp($otp);
        $this->sm->setTempUser([
            'first-name' => $params['first-name'],
            'last-name' => $params['last-name'],
            'email' => $params['email'],
        ]);

        $this->sm->setDeviceId($params['device-id']);
        $this->sm->setVersion($params['version']);
        $this->sm->setOs($params['os']);

        $this->sm->write();

        $msg = $this->pug->render(__DIR__ . "/templates/signup-otp.pug", [
            'name' => $params['first-name'] . ' ' . $params['last-name'],
            'otp' => $otp
        ]);
        $this->emailer->send($params['email'], [], "Your OTP for signing up!", $msg);
    }

    private function setSigninOtp(Request $req): void {
        $params = $req->getParsedBody();

        //check if user registered
        $user = $this->user->get(['first_name', 'last_name', 'email'], [
            ['email', '=', $params['email']]
        ])[0] ?? [];

        $this->logger->debug("user: " . print_r($user, true));

        if (!$user) {
            throw new \Exception("Unknown user. Please sign up first.");
        }

        $otp = random_int(self::MIN, self::MAX);

        $this->sm->setOtp($otp);
        $this->sm->setTempUser([
            'first-name' => $user['first_name'],
            'last-name' => $user['last_name'],
            'email' => $user['email'],
        ]);

        $this->sm->setDeviceId($params['device-id']);
        $this->sm->setVersion($params['version']);
        $this->sm->setOs($params['os']);

        $this->sm->write();

        $msg = $this->pug->render(__DIR__ . "/templates/signup-otp.pug", [
            'name' => $user['first_name'] . ' ' . $user['last_name'],
            'otp' => $otp
        ]);
        $this->emailer->send($params['email'], [], "Your OTP for signing in!", $msg);
    }

    private function getCaptcha(): array {
        $url = 'http://localhost:8777/api/getCaptcha';
        $ch = curl_init($url);

        $payload = json_encode([
            'CaptchaType' => 'digit',
            'DriverDigit' => [
                'DotCount' => 80,
                'Height' => 80,
                'Length' => 6,
                'MaxSkew' => 0.7,
                'Width' => 240
            ],
        ]);

        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type:application/json']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $result = curl_exec($ch);
        curl_close($ch);
        $result = json_decode($result, true);
        return [
            'captcha-id' => $result['captchaId'],
            'image' => $result['data'],
        ];
    }

    private function verifyCaptcha(string $id, string $value): void {
        $url = 'http://localhost:8777/api/verifyCaptcha';
        $ch = curl_init($url);

        $payload = json_encode([
            'Id' => $id,
            'VerifyValue' => $value
        ]);

        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type:application/json']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $result = curl_exec($ch);
        curl_close($ch);
        $result = json_decode($result, true);

        if ($result['msg'] == 'failed') {
            throw new \Exception('Invalid captcha');
        }
    }
}
