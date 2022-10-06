//Package Imports
const express = require("express");
const app = express();
const mysqlConnection = require("../utils/database");
const bcrypt = require("bcryptjs");
const Router = express.Router();

const basicAuth = require("express-basic-auth");
app.use(basicAuth);

//Basic Auth
function authentication(req, res, next) {
  var authheader = req.headers.authorization || null;
  if (!authheader) {
    return res.status(400);
  }
  var auth = new Buffer.from(authheader.split(" ")[1], "base64")
    .toString()
    .split(":");
  return auth;
}

//Endpoints for health status check
Router.get("/", (req, res) => {
  res.status(200).send();
});

//Health check
Router.get("/healthz", (req, res) => {
  res.status(200).send();
});

Router.get("/v1/account/:id", (req, res) => {
  auth = authentication(req, res);
  var user = auth[0];
  var pass = auth[1];
  mysqlConnection.query(
    "SELECT first_name, last_name, password, username, account_created, account_updated FROM account WHERE username= ?",
    [user],
    (err, results, fields) => {
      if (results[0]) {
        const p = results[0].password || null;
        const validPass = bcrypt.compareSync(pass, p);
        if (validPass) {
          mysqlConnection.query(
            "SELECT id, first_name, last_name, username, account_created, account_updated FROM account WHERE id= ? and username= ?",
            [req.params.id, user],
            (err, results, fields) => {
              if (results[0]) {
                res.send(results);
              } else {
                res.status(403).send("Forbidden");
              }
            }
          );
        } else {
          res.status(401).send("Unauthorized");
        }
      } else {
        res.status(401).send("Unauthorized");
      }
    }
  );
});

Router.post("/v1/account", async (req, res) => {
  try {
    let regex = new RegExp("[a-z0-9]+@[a-z]+.[a-z]{2,3}");
    regex.test(req.body.username);
    if (!regex.test(req.body.username)) {
      return res.status(400).send("Bad Request");
    }
    let qb = req.body;
    const { password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const sql =
      "SET @first_name = ?;SET @last_name = ?;SET @password = ?;SET @username = ?; 	INSERT INTO account(id, first_name, last_name, password, username, account_created, account_updated) VALUES (SUBSTR(MD5(RAND()), 1, 8), @first_name, @last_name, @password, @username, now(), now() ); SELECT id, first_name, last_name, username, account_created, account_updated FROM account WHERE username = @username;";
    mysqlConnection.query(
      sql,
      [qb.first_name, qb.last_name, hash, qb.username],
      (err, results, fields) => {
        if (!err) {
          results.forEach((element) => {
            if (element.constructor == Array) res.status(201).send(element);
          });
        } else {
          console.log(err);
          res.status(400).send("Bad Request");
        }
      }
    );
  } catch (e) {
    console.log(e);
    res.status(400).send("Bad Request");
  }
});

Router.put("/v1/account/:id", async (req, res) => {
  try {
    auth = authentication(req);
    var user = auth[0];
    var pass = auth[1];
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    let qb = req.body;
    const sql =
      "SET @id = ?;SET @first_name = ?;SET @last_name = ?;SET @password = ?;SET @username = ?; 	UPDATE account SET  first_name = @first_name, last_name = @last_name,  password = @password, username = @username,  account_updated = now() WHERE ID = @id and username=@username; SELECT * FROM account WHERE ID = @ID and username = @username; SELECT id, first_name, last_name, username, account_created, account_updated FROM account WHERE id= @id and username= @username";
    mysqlConnection.query(
      "SELECT id,first_name, last_name, password, username, account_created, account_updated FROM account WHERE username = ?",
      [user],
      (err, results, fields) => {
        if (results[0]) {
          const p = results[0].password || null;
          const userMatches = basicAuth.safeCompare(
            results[0].id,
            req.params.id
          );
          const validPass = bcrypt.compareSync(pass, p);
          if (validPass) {
            if (!userMatches) {
              return res.status(403).send("Forbidden");
            }
          }
          if (userMatches & validPass) {
            mysqlConnection.query(
              sql,
              [req.params.id, qb.first_name, qb.last_name, hash, user],
              (err, results, fields) => {
                if (results[0]) {
                  res.status(204).send("No Content");
                } else {
                  res.status(403).send("Forbidden");
                }
              }
            );
          } else {
            res.status(401).send("Unauthorized");
          }
        } else {
          res.status(401).send("Unauthorized");
        }
      }
    );
  } catch (e) {
    return res.status(400).send("Bad Request");
  }
});

module.exports = Router;
