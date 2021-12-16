<?php
namespace Prosql;
use \Monolog\Logger;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Gregwar\Captcha\CaptchaBuilder;
use \Prosql\Interfaces\{EmailerInterface, SessionManagerInterface};
use \Prosql\Utils\Validator as V;
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

    public function setDownloadPath(string $path): void {
        $this->path = $path;
    }

    public function setEmailer(EmailerInterface $emailer): void {
        $this->emailer = $emailer;
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
        case 'set-otp':
            return $this->setOtp($req);

        case 'signup':
            return $this->signup($req);

        default:
            throw new \Exception('invalid-operation');
        }
    }

    private function signup(Request $req): void {
        $otp = $req->getParsedBody()['otp'];
        if ($this->sm->getOtp() != $otp) {
            throw new \Exception("Invalid otp");
        }

        $user = $this->sm->getUser();
        $this->logger->debug("Signing up:" . print_r($user, true));
    }

    private function setOtp(Request $req): void {
        $params = $req->getParsedBody();
        //$id = $params['captcha-id'];
        //$value = $params['captcha-value'];
        //$this->verifyCaptcha($id, $value);

        V::validate([
            ['field' => $params['first-name'], 'alias' => 'First name', 'rules' => [V::NOT_EMPTY]],
            ['field' => $params['last-name'], 'alias' => 'Last name', 'rules' => [V::NOT_EMPTY]],
            ['field' => $params['email'], 'alias' => 'email', 'rules' => [V::IS_EMAIL]],
        ]);

        $otp = random_int(self::MIN, self::MAX);

        $this->sm->setOtp($otp);
        $this->sm->setUser([
            'first-name' => $params['first-name'],
            'last-name' => $params['last-name'],
            'email' => $params['email'],
        ]);

        $this->sm->write();

        $msg = $this->pug->render(__DIR__ . "/templates/signup-otp.pug", [
            'name' => $params['first-name'] . ' ' . $params['last-name'],
            'otp' => $otp
        ]);
        $this->emailer->send($params['email'], [], "Your OTP for signing up!", $msg);
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
