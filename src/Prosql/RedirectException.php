<?php
namespace Prosql\RedirectException;

class RedirectException extends \Exception {
    private $url;
    public function __construct($url, $code = 0, Exception $previous = null) {
        $this->url = $url;
        parent::__construct($url, $code, $previous);
    }

    public function getUrl() {
        return $this->url;
    }
}
