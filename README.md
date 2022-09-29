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

- Create a new file named index.js

- To install nodemon
- Run npm i -g nodemon

- Use set command to add environment variable
- set PORT=3000
- Run node index.js to run the project
- Test using postman
- Run Get http://localhost:3000/healthz in postman to get status code 200

### Assignment 1
- Develop a web application with RESTful API without any UI
