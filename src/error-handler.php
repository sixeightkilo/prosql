<?php
use \Prosql\Utils\{LoggerProvider};
function errorHandler($errno, $errstr, $errfile, $errline)
{
    throw new Exception("$errfile:$errline:$errstr");
}

//$logger = $container->get('lp')->getLogger("ErrorHandler");
$config = $container->get('config');

if ($config['env'] == 'dev') {
    set_error_handler(function($errno, $errstr, $errfile, $errline) use ($logger) {
        $logger->debug("$errfile:$errline:$errstr");
        errorHandler($errno, $errstr, $errfile, $errline);
    });
} else if ($config['env'] == 'prod') {
    set_error_handler(function($errno, $errstr, $errfile, $errline) use ($logger) {
        $logger->debug("$errfile:$errline:$errstr");
        return false;
    });
}
