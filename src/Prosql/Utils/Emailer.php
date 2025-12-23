<?php
namespace Prosql\Utils;

use Prosql\Interfaces\EmailerInterface;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

class Emailer implements EmailerInterface {

    private $logger;
    private $apiKey;

    // Hardcoded ZeptoMail SMTP Configuration
    const SMTP_HOST = 'smtp.zeptomail.in';
    const SMTP_PORT = 587;
    const SMTP_USER = 'emailapikey'; // ZeptoMail usually requires this specific username
    const FROM_EMAIL = 'tech@letsnotate.com'; // Must be a verified sender
    const FROM_NAME  = 'Prosql';

    /**
     * @param \Monolog\Logger $logger
     * @param string $key - This corresponds to env.ZEPTOMAIL_API_KEY in your Node code
     */
    function __construct(\Monolog\Logger $logger, string $key) {
        $this->logger = $logger;
        $this->apiKey = $key;

        // Logging constructor init as per your Node reference
        $this->logger->info('Emailer', ['msg' => 'constructor', 'u' => self::SMTP_USER]);
        // Security Warning: Logging the API key is risky, but included to match your reference
        $this->logger->info('Emailer', ['msg' => 'constructor', 'p' => $this->apiKey]); 
        $this->logger->info('Emailer', ['msg' => 'constructor', 'status' => 'ZeptoMail SMTP config loaded']);
    }

    public function send(string $toAddr, array $cc, string $subject, string $msg) {
        $mail = new PHPMailer(true);

        try {
            // 1. Server Settings
            // $mail->SMTPDebug = SMTP::DEBUG_SERVER; // Enable for verbose debug output
            $mail->isSMTP();
            $mail->Host       = self::SMTP_HOST;
            $mail->SMTPAuth   = true;
            $mail->Username   = self::SMTP_USER;
            $mail->Password   = $this->apiKey; // The "Send Mail Token" goes here
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = self::SMTP_PORT;

            // 2. Recipients
            $mail->setFrom(self::FROM_EMAIL, self::FROM_NAME);
            $mail->addAddress($toAddr);

            // Handle CCs
            foreach ($cc as $ccEmail) {
                if (!empty($ccEmail)) {
                    $mail->addCC($ccEmail);
                }
            }

            // 3. Content
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = $msg;
            $mail->AltBody = strip_tags($msg); // Plain text version for non-HTML clients

            // 4. Send
            $this->logger->info('Emailer', ['action' => 'send', 'to' => $toAddr, 'subject' => $subject]);
            $mail->send();

            $this->logger->info('Emailer', ['action' => 'send', 'status' => 'Email sent successfully']);

        } catch (Exception $e) {
            $this->logger->critical("Message could not be sent. Mailer Error: {$mail->ErrorInfo}");
            throw new \Exception('Unable to send email');
        }
    }
}
