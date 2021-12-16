<?php
namespace Prosql;
use \Monolog\Logger;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Gregwar\Captcha\CaptchaBuilder;
use \Prosql\Interfaces\EmailerInterface;
use \Prosql\Utils\Validator as V;

class LoginController extends BaseController {
    private string $path = "";
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

        case 'get-otp':
            return $this->getOtp($req);

        default:
            throw new \Exception('invalid-operation');
        }
    }

    private function getOtp(Request $req): void {
        $params = $req->getQueryParams();
        //$id = $params['captcha-id'];
        //$value = $params['captcha-value'];
        //$this->verifyCaptcha($id, $value);

        V::validate([
            ['field' => $params['first-name'], 'alias' => 'First name', 'rules' => [V::NOT_EMPTY]],
            ['field' => $params['last-name'], 'alias' => 'Last name', 'rules' => [V::NOT_EMPTY]],
            ['field' => $params['email'], 'alias' => 'email', 'rules' => [V::IS_EMAIL]],
        ]);
    }

    private function getCaptcha(): array {
        $url = 'http://localhost:8777/api/getCaptcha';
        $ch = curl_init($url);
        # Setup request to send json via POST.
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
        # Setup request to send json via POST.
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
