<?php
namespace Prosql\Utils;
use \Prosql\Interfaces\EmailerInterface;

class Emailer implements EmailerInterface {
    private $logger;
    private $sendGrid;

    function __construct(\Monolog\Logger $logger, string $key ) {
        $this->logger = $logger;
        $this->sendGrid = new \SendGrid($key);
    }

    public function send(string $toAddr, array $cc, string $subject, string $msg) {
        $email = new \SendGrid\Mail\Mail(); 
        $email->setFrom("tech@prosql.io", "Prosql");
        $email->setSubject($subject);
        $email->addTo($toAddr);
        $email->addContent("text/html", $msg);

        try {
            $response = $this->sendGrid->send($email);
            $this->logger->debug(print_r($response, true));
        } catch (Exception $e) {
            $this->logger->critical($e->getMessage());
            throw new \Exception('Unable to send email');
        }
    }
}
