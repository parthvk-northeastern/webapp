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
#download it
sudo wget https://s3.us-east-1.amazonaws.com/amazoncloudwatch-agent-us-east-1/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
#install it
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -c file:/home/ubuntu/webapp/statsd/config.json \
    -s
# sudo mysql <<EOF
# CREATE DATABASE nodemysql;
# CREATE USER 'newuser'@'localhost' IDENTIFIED BY 'newpassword';
# GRANT ALL PRIVILEGES ON nodemysql.* TO 'newuser'@'localhost' WITH GRANT OPTION;
# FLUSH PRIVILEGES;
# EOF
# echo "Starting mysql server"
# sudo service mysql start

cd ~/webapp
#!/usr/bin/env bash
cd ~
sudo cp /tmp/webapp.service /lib/systemd/system/webapp.service
echo "Service File successfully copied"
sudo systemctl daemon-reload
sudo systemctl start webapp
sudo systemctl status webapp
sudo systemctl enable webapp
# sudo npm i pm2
# sudo npm i -g pm2
# pm2 start server.js
# pm2 save
# pm2 startup systemd
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
# pm2 restart all --update-env

