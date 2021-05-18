<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;

require __DIR__ . '/../vendor/autoload.php';


$app = AppFactory::create();

$app->get('[/{params:.*}]', function($req, $res, $args) {
	$params = explode('/', $req->getAttribute('params'));

    $pug = new Pug;
	switch ($params[0]) {
	case '':
        $res->getBody()->write($pug->renderFile(__DIR__ . "/templates/index.pug"));
        return $res;

	case 'login':
        $res->getBody()->write($pug->renderFile(__DIR__ . "/templates/login.pug"));
        return $res;

	case 'app':
        $res->getBody()->write($pug->renderFile(__DIR__ . "/templates/app.pug"));
        return $res;

	//case 'prettify':
        //$query = "SELECT count(*),`Column1`,`Testing`, `Testing Three` FROM `Table1`
            //WHERE Column1 = 'testing' AND ( (`Column2` = `Column3` OR Column4 >= NOW()) )
            //GROUP BY Column1 ORDER BY Column3 DESC LIMIT 5,10";
//
        //$res->getBody()->write(SqlFormatter::format($query));
//
        //return $res;
    }
});

$app->run();
