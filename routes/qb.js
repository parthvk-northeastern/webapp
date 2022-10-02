const express = require("express");
const mysqlConnection = require("../utils/database");

const Router = express.Router();

Router.get("/", (req, res) => {
  mysqlConnection.query("SELECT * FROM account", (err, results, fields) => {
    if (!err) {
      res.send(results);
    } else {
      console.log(err);
    }
  });
});

Router.post("/", (req, res) => {
  let qb = req.body;
  const sql =
    "SET @id = ?;SET @first_name = ?;SET @last_name = ?;SET @password = ?;SET @username = ?;SET @account_created = ?;SET @account_updated = ?; 	INSERT INTO account(id, first_name, last_name, password, username, account_created, account_updated) VALUES (@id, @first_name, @last_name, @password, @username, @account_created, @account_updated ); SELECT * FROM account;";
  mysqlConnection.query(
    sql,
    [
      qb.id,
      qb.first_name,
      qb.last_name,
      qb.password,
      qb.username,
      qb.account_created,
      qb.account_updated,
    ],
    (err, results, fields) => {
      if (!err) {
        results.forEach((element) => {
          if (element.constructor == Array) res.send(element);
        });
      } else {
        console.log(err);
      }
    }
  );
});

Router.put("/", (req, res) => {
  let qb = req.body;
  const sql =
    "SET @id = ?;SET @first_name = ?;SET @last_name = ?;SET @password = ?;SET @username = ?;SET @account_created = ?;SET @account_updated = ?; 	UPDATE account SET id=@id, first_name = @first_name, last_name = @last_name,  password = @password, username = @username, account_created = @account_created, account_updated = @account_updated WHERE ID = @ID; SELECT * FROM account;";
  mysqlConnection.query(
    sql,
    [
      qb.id,
      qb.first_name,
      qb.last_name,
      qb.password,
      qb.username,
      qb.account_created,
      qb.account_updated,
    ],
    (err, results, fields) => {
      if (!err) {
        res.send("The data for the selected id has been successfully updated.");
      } else {
        console.log(err);
      }
    }
  );
});

Router.delete("/:id", (req, res) => {
  mysqlConnection.query(
    "DELETE FROM account WHERE id= ? ",
    [req.params.id],
    (err, results, fields) => {
      if (!err) {
        res.send("The selected id has been successfully deleted.");
      } else {
        console.log(err);
      }
    }
  );
});

module.exports = Router;
