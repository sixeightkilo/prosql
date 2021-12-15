<?php
namespace Prosql;

class Emailer implements Interfaces\EmailerInterface {
    private $logger;
    private $sendGrid;

    function __construct(\Monolog\Logger $logger, string $key ) {
        $this->logger = $logger;
        $this->sendGrid = new \SendGrid($key);
    }

    public function send(string $toAddr, Mixed $cc, string $subject, string $msg) {
        $email = new \SendGrid\Mail\Mail(); 
        $email->setFrom("tech@prosql.io", "Prosql");
        $email->setSubject($subject);
        $email->addTo($toAddr);
        $email->addContent("text/html", $msg);

        try {
            $response = $this->sendGrid->send($email);
            print $response->statusCode() . "\n";
            print_r($response->headers());
            print $response->body() . "\n";
        } catch (Exception $e) {
            echo 'Caught exception: '. $e->getMessage() ."\n";
        }
    }
}
