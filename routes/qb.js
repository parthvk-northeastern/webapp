//Package Imports
const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
const Router = express.Router();

//Using sequelize
const { Accounts } = require("../models");
Accounts.sequelize.sync().then(console.log("success"));

const basicAuth = require("express-basic-auth");
app.use(basicAuth);

//Basic Auth
function authentication(req, res, next) {
  var authheader = req.headers.authorization || null;
  if (!authheader) {
    console.log("test");
    return authheader;
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

Router.get("/v1/account/:id", async (req, res) => {
  try {
    auth = authentication(req, res);
    var user = auth[0];
    var pass = auth[1];
    const acc = await Accounts.findOne({
      where: {
        username: user,
      },
    });
    if (acc) {
      const validPass = bcrypt.compareSync(pass, acc.password);
      if (validPass) {
        if (req.params.id === acc.id) {
          acc.password = undefined;
          return res.status(200).send(acc);
        } else {
          return res.status(403).send("Forbidden");
        }
      } else {
        return res.status(401).send("Unauthorized");
      }
    } else {
      return res.status(401).send("Unauthorized");
    }
  } catch (e) {
    console.log(e);
    return res.status(400).send("Bad Request");
  }
});

Router.post("/v1/account", async (req, res) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 10);
    const Acc = await Accounts.create({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      username: req.body.username,
      password: hash,
    });
    Acc.password = undefined;
    return res.status(201).send(Acc);
  } catch (e) {
    return res.status(400).send("Bad Request");
  }
});

Router.put("/v1/account/:id", async (req, res) => {
  try {
    const fields = req.body;
    for (let key in fields) {
      if (
        key != "first_name" &&
        key != "last_name" &&
        key != "password" &&
        key != "username"
      ) {
        return res.status(400).send("Bad Request");
      }
    }
    auth = authentication(req, res);
    var user = auth[0];
    var pass = auth[1];

    const Acc = await Accounts.findOne({
      where: {
        username: user,
      },
    });

    if (Acc) {
      const validPass = bcrypt.compareSync(pass, Acc.password);
      if (validPass) {
        if (req.params.id === Acc.id) {
          const Hpassword = req.body.password || pass;
          const first = req.body.first_name || Acc.first_name;
          const last = req.body.last_name || Acc.last_name;
          const hash = bcrypt.hashSync(Hpassword, 10);
          const Accu = await Accounts.update(
            {
              first_name: first,
              last_name: last,
              password: hash,
            },
            {
              where: {
                username: user,
              },
            }
          );
          return res.status(204).send("");
        } else {
          return res.status(403).send("Forbidden");
        }
      } else {
        return res.status(401).send("Unauthorized");
      }
    } else {
      return res.status(401).send("Unauthorized");
    }
  } catch (e) {
    console.log(e);
    return res.status(400).send("Bad Request");
  }
});

module.exports = Router;
