#!/bin/bash

sleep 30

sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install nginx -y
sudo mkdir webapp
# sudo mv routes config README.md models package-lock.json server.js packer test.js package.json ~/webapp/
# sudo cp -r routes config README.md models package-lock.json server.js packer test.js package.json ~/webapp/
cd webapp && sudo curl -sL https://deb.nodesource.com/setup_16.x -o nodesource_setup.sh
# cd webapp
# sudo curl -sL https://deb.nodesource.com/setup_16.x -o nodesource_setup.sh
sudo bash nodesource_setup.sh
sudo apt-get install nodejs -y
sudo apt-get install npm -y
sudo apt install unzip
cd ..
sudo unzip webapp.zip -d ~/webapp
cd ~/webapp && sudo npm i

echo "Installing mysql server"
sudo apt-get install mysql-server -y
# sudo mysql <<EOF
# CREATE DATABASE nodemysql;
# CREATE USER 'newuser'@'localhost' IDENTIFIED BY 'newpassword';
# GRANT ALL PRIVILEGES ON nodemysql.* TO 'newuser'@'localhost' WITH GRANT OPTION;
# FLUSH PRIVILEGES;
# EOF
# echo "Starting mysql server"
# sudo service mysql start

cd ~/webapp
sudo npm i pm2
sudo npm i -g pm2
pm2 start server.js
pm2 save
pm2 startup systemd
pm2 restart all --update-env

