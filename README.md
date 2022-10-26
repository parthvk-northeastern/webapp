# webapp


### Git Command Workflow for adding origin
- git remote -v
- git remote add parth repo_name  
- git remote remove origin
- git remote add upstream org_name

### Git Workflow
- git checkout -b a1-01
- git add.
- git commit -m ""
- git push parth a1-01
- Go to github and get pull request in organization
- git checkout main
- git pull upstream main
- git push parth main
- git checkout -b a1-02

### To install dependencies and run project
- Install node
- Run npm init --yes
- Run npm i express
- Run npm i --save body-parser

- Create a new file named index.js

- To install nodemon
- Run npm i -g nodemon

- Use set command to add environment variable
- set PORT=3000
- Run node index.js to run the project
- Test using postman
- Run Get http://localhost:3000/healthz in postman to get status code 200

### To install mysql 
- Run npm install --save mysql2

### To install bycrpt
- Run npm i bcryptjs

### To install basic auth
- Run npm install express-basic-auth

### To Install jest
- npm i --save-dev jest 
- npm i chai
- npm i mocha
- npm i chai-http

### To Install sequalize
- npm install sequelize sequelize-cli
- sequelize init
- npm install fs path

### To install packer
- Downloaded the binary, pasted it in c drive and set the path of packer in env variables.

### To run packer
- export AWS_ACCESS_KEY_ID="<YOUR_AWS_ACCESS_KEY_ID>"
- export AWS_SECRET_ACCESS_KEY="<YOUR_AWS_SECRET_ACCESS_KEY>"
- export PACKER_LOG=1
- packer build ami.pkr.hcl

### To create keypair and add it to aws account
- cd .ssh
- ssh-keygen

### To ssh into vm
- ssh username@public ip -i ~/.ssh/aws -v

### Assignment 1
- Develop a web application with RESTful API without any UI

### Assignment 2
- Develop API's and use git branch protection and git actions

### Assignment 4
- Using ORM such as sequalize
- Installing packer
- Packer format - packer fmt ami.pkr.hcl
