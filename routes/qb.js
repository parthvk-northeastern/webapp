//Package Imports
const express = require("express");
const mysqlConnection = require("../utils/database");
const bcrypt = require("bcryptjs");
const Router = express.Router();

//Endpoints for health status check
Router.get("/", (req, res) => {
  res.status(200).send();
});

//Health check
Router.get("/healthz", (req, res) => {
  res.status(200).send();
});

Router.get("/v1/account/:id", (req, res) => {
  const { username, password } = req.body;
  mysqlConnection.query(
    "SELECT first_name, last_name, password, username, account_created, account_updated FROM account WHERE id= ? and username= ?",
    [req.params.id, username],
    (err, results, fields) => {
      if (results[0]) {
        const p = results[0].password || null;
        const validPass = bcrypt.compareSync(password, p);
        if (validPass) {
          mysqlConnection.query(
            "SELECT id, first_name, last_name, username, account_created, account_updated FROM account WHERE id= ? and username= ?",
            [req.params.id, username],
            (err, results, fields) => {
              res.send(results);
            }
          );
        } else {
          res.status(401).send("Unauthorized");
        }
      } else {
        console.log(err);
        res.status(403).send("Forbidden");
      }
    }
  );
});

Router.post("/v1/account", async (req, res) => {
  try {
    let qb = req.body;
    const { password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const sql =
      "SET @id = ?;SET @first_name = ?;SET @last_name = ?;SET @password = ?;SET @username = ?; 	INSERT INTO account(id, first_name, last_name, password, username, account_created, account_updated) VALUES (@id, @first_name, @last_name, @password, @username, now(), now() ); SELECT id, first_name, last_name, username, account_created, account_updated FROM account WHERE ID = @ID;";
    mysqlConnection.query(
      sql,
      [qb.id, qb.first_name, qb.last_name, hash, qb.username],
      (err, results, fields) => {
        if (!err) {
          results.forEach((element) => {
            if (element.constructor == Array)
              res.status(201).send("User Created");
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

// Router.put("/v1/account/:id", (req, res) => {
//   const { username, password } = req.body;
//   let qb = req.body;
//   const sql =
//     "SET @id = ?;SET @first_name = ?;SET @last_name = ?;SET @password = ?;SET @username = ?; 	UPDATE account SET  first_name = @first_name, last_name = @last_name,  password = @password, username = @username,  account_updated = now() WHERE ID = @ID; SELECT * FROM account WHERE ID = @ID;";
//   mysqlConnection.query(
//     sql,
//     [req.params.id, qb.first_name, qb.last_name, qb.password, qb.username],
//     (err, results, fields) => {
//       if (!err) {
//         res.send("The data for the selected id has been successfully updated.");
//       } else {
//         console.log(err);
//       }
//     }
//   );
// });

Router.put("/v1/account/:id", async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  let qb = req.body;
  const sql =
    "SET @id = ?;SET @first_name = ?;SET @last_name = ?;SET @password = ?;SET @username = ?; 	UPDATE account SET  first_name = @first_name, last_name = @last_name,  password = @password, username = @username,  account_updated = now() WHERE ID = @ID; SELECT * FROM account WHERE ID = @ID;";
  mysqlConnection.query(
    "SELECT first_name, last_name, password, username, account_created, account_updated FROM account WHERE id= ? and username= ?",
    [req.params.id, username],
    (err, results, fields) => {
      if (results[0]) {
        const p = results[0].password || null;
        const validPass = bcrypt.compareSync(password, p);
        if (validPass) {
          mysqlConnection.query(
            sql,
            [req.params.id, qb.first_name, qb.last_name, hash, qb.username],
            (err, results, fields) => {
              res.send("Updated");
            }
          );
        } else {
          res.status(401).send("Unauthorized");
        }
      } else {
        console.log(err);
        res.status(403).send("Forbidden");
      }
    }
  );
});

// Router.delete("/:id", (req, res) => {
//   mysqlConnection.query(
//     "DELETE FROM account WHERE id= ? ",
//     [req.params.id],
//     (err, results, fields) => {
//       if (!err) {
//         res.send("The selected id has been successfully deleted.");
//       } else {
//         console.log(err);
//       }
//     }
//   );
// });

module.exports = Router;
