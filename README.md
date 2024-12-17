# booklist Webapp
Booklist Web Interface with API for Java Booklist

## Traditional Setup with apache
- clone the repo to your apache folder (e.g. <code>/var/www/bookApp</code> and edit the <code>apache.conf</code> files accordingly
- change the owner to your apache user (e.g. <code>chown www-data:www-data /var/www/bookApp</code>
- Create your own MySQL/MariadB Instance and edit the <code>/var/www/bookApp/config.php</code> file.
- use the <code>/var/www/bookApp/dockerBuild/init.sh</code> script to create the neccessary Tables (change the DB Variables to your setup)
- delete the <code>dockerBuild</code> folder from your apache files
- if you are using a non traditional port, dont forget to edit the ports.conf under <code>/etc/apache2/ports.conf</code>

## Docker Build
- copy dockerBuild Folder to your local Server.
- go into the copied folder <code>cd dockerBuild</code>
- update the <code>docker-compose.yml</code> file with your Information.
- Build the docker Container with <code>docker-compose up -d --build</code>.
- After that you should have 2 Containers running. Check with <code>docker conatiner ls -a</code>

## dependecies
- php (tested with php8.2)
- Database (tested with MariaDB 11.6.0)
- Webserver (tested with Apache 2.4.62)
