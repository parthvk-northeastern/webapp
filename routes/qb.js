//Package Imports
require("dotenv").config();
const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
const Router = express.Router();

//Using sequelize
const { Accounts } = require("../models");
const { Document } = require("../models");
Accounts.sequelize.sync().then(console.log("success"));
Document.sequelize.sync().then(console.log("success"));

//Using sdk and multer
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

aws.config.update({
  region: process.env.REGION,
});

const BUCKET = process.env.BUCKET;
const s3 = new aws.S3();

const upload = multer({
  storage: multerS3({
    s3: s3,
    ACL: "public-read",
    bucket: BUCKET,
    key: function (req, file, cb) {
      console.log(file);
      cb(null, Date.now().toString() + file.originalname);
    },
  }),
});

const fle = upload.single("file");

//Basic Auth

const basicAuth = require("express-basic-auth");
app.use(basicAuth);

function authentication(req, res, next) {
  var authheader = req.headers.authorization || null;
  if (!authheader) {
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

//Account endpoints
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
    console.log(e);
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

//Documents endpoint

Router.get("/v1/documents/:doc_id", async (req, res) => {
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
        const doc = await Document.findOne({
          where: {
            user_id: acc.id,
            doc_id: req.params.doc_id,
          },
        });
        if (doc) {
          res.status(200).send(doc);
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

Router.get("/v1/documents", async (req, res) => {
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
        const doc = await Document.findAll({
          where: {
            user_id: acc.id,
          },
        });
        if (doc) {
          res.status(200).send(doc);
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

Router.post("/v1/documents", async (req, res) => {
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
        fle(req, res, async (err) => {
          if (err) {
            res.status(400).send("Bad Request");
          }
          try {
            const doc = await Document.create({
              user_id: acc.id,
              name: req.file.key,
              s3_bucket_path: req.file.location,
            });
            res.status(201).send(doc);
          } catch (e) {
            console.log(e);
            return res.status(400).send("Bad Request");
          }
        });
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

Router.delete("/v1/documents/:doc_id", async (req, res) => {
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
        const doc = await Document.findOne({
          where: {
            user_id: acc.id,
            doc_id: req.params.doc_id,
          },
        });
        if (doc) {
          await s3.deleteObject({ Bucket: BUCKET, Key: doc.name }).promise();
          const del = await Document.destroy({
            where: {
              user_id: acc.id,
              doc_id: req.params.doc_id,
            },
          });
          res.sendStatus(204);
        } else {
          return res.status(404).send("Not Found");
        }
      } else {
        return res.status(401).send("Unauthorized");
      }
    } else {
      return res.status(401).send("Unauthorized");
    }
  } catch (e) {
    console.log(e);
    return res.status(404).send("Not Found");
  }
});

module.exports = Router;
