server {
        listen 443;
        server_name dev.prosql.io;
        error_log /var/www/dev-prosql/logs/error.log;
        access_log /var/www/dev-prosql/logs/access.log;
	root /var/www/dev-prosql/public-html/prosql-web/public;

### SSL Stuff ###
        ssl_certificate /etc/letsencrypt/live/prosql.io/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/prosql.io/privkey.pem;

        #enables all versions of TLS, but not SSLv2 or 3 which are weak and now deprecated.
        ssl_protocols TLSv1 TLSv1.1 TLSv1.2;

        #Disables all weak ciphers
        ssl_ciphers "ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA:ECDHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-RSA-AES128-SHA256:DHE-RSA-AES256-SHA:DHE-RSA-AES128-SHA:ECDHE-RSA-DES-CBC3-SHA:EDH-RSA-DES-CBC3-SHA:AES256-GCM-SHA384:AES128-GCM-SHA256:AES256-SHA256:AES128-SHA256:AES256-SHA:AES128-SHA:DES-CBC3-SHA:HIGH:!aNULL:!eNULL:!EXPORT:!DES:!MD5:!PSK:!RC4";

        ssl_prefer_server_ciphers on;
################
	index index.php index.html index.htm;
	try_files $uri /index.php?$args;

	location = /favicon.ico {
		return 204;
		access_log     off;
		log_not_found  off;
	}

	location /browser-api/sqlite {
		proxy_pass http://127.0.0.1:23891;
	}

	location ~ \.php$ {
		root /var/www/dev-prosql/public-html/prosql-web/public;
		fastcgi_split_path_info ^(.+\.php)(/.+)$;
		fastcgi_pass unix:/var/run/php/php8.0-fpm.sock;
                fastcgi_index index.php;
                fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
                include fastcgi_params;
                fastcgi_read_timeout 6000;
        }
}
