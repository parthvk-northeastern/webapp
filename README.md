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
- Run npm install --save mysql

### To install bycrpt
- Run npm i bcryptjs

### To install basic auth
- Run npm install express-basic-auth

### To Install jest
- npm i --save-dev jest 
- npm i chai
- npm i mocha
- npm i chai-http

### Assignment 1
- Develop a web application with RESTful API without any UI
