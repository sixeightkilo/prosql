<?php
namespace Prosql;
use \Monolog\Logger;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Gregwar\Captcha\CaptchaBuilder;
use \Prosql\Interfaces\EmailerInterface;

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
        case 'captcha':
            $bytes = openssl_random_pseudo_bytes(8);
            $hex = bin2hex($bytes);
            $image = "$path/$hex.jpg";

            $builder = new CaptchaBuilder;
            $builder->build()
                ->save($image);
            $this->logger("Writing to $image");

            return ["image" => $image];

        case 'get-otp':
            $toAddr = $req->getQueryParams()['email'];
            $this->logger->debug("to: $to");
            $response = $this->emailer->send($toAddr, [], "Here is your OTP", "OTP");
            return null;

        default:
            throw new \Exception('invalid-operation');
        }
    }
}
