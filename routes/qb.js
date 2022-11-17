//Package Imports
require("dotenv").config();
const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
const Router = express.Router();
const nanoid = require("nanoid");
//Statsd imports
const logger = require("../config/logger");
const SDC = require("statsd-client");
const sdc = new SDC({ host: "localhost", port: 8125 });
var start = new Date();

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
  sdc.timing("healthz.timeout", start);
  logger.info("/health running fine");
  sdc.increment("endpoint.healthz");
  res.status(200).send();
});

//Account endpoints
Router.get("/v1/account/:id", async (req, res) => {
  sdc.increment("endpoint.getAccount");
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
          logger.info("getAccount Success");
          return res.status(200).send(acc);
        } else {
          logger.error(
            "Username and password correct but not permitted to access the ID specified"
          );
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
    logger.error(e);
    return res.status(400).send("Bad Request");
  }
});

Router.post("/v1/account", async (req, res) => {
  sdc.increment("endpoint.postAccount");
  try {
    const hash = await bcrypt.hash(req.body.password, 10);
    const Acc = await Accounts.create({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      username: req.body.username,
      password: hash,
      verifyuser: false,
    });

    //To send message to Dynamo DB
    var dynamoDatabase = new aws.DynamoDB({
      apiVersion: "2012-08-10",
      region: "us-east-1",
    });
    const elapsedTime = 5 * 60;
    const initialTime = Math.floor(Date.now() / 1000);
    const expiryTime = initialTime + elapsedTime;

    const randomnanoID = nanoid();

    // Create the Service interface for dynamoDB
    var parameter = {
      Item: {
        TokenName: { S: randomnanoID },
        TimeToLive: { N: expiryTime.toString() },
      },
      TableName: "myDynamoTokenTable",
    };
    //saving the token onto the dynamo DB
    await dynamoDatabase.putItem(parameter).promise();
    //To send message onto SNS
    //var sns = new AWS.SNS({apiVersion: '2010-03-31'});
    // Create publish parameters
    // 122596462960
    // 652427370007
    var params = {
      Message: Acc.username,
      Subject: randomnanoID,
      TopicArn: "arn:aws:sns:us-east-1:122596462960:verify_email",
    };
    //var topicARN= 'arn:aws:sns:us-east-1:172869529067:VerifyingEmail';
    var publishTextPromise = new aws.SNS({
      apiVersion: "2010-03-31",
      region: "us-east-1",
    });
    await publishTextPromise.publish(params).promise();

    Acc.password = undefined;
    logger.info("postAccount Success");
    return res.status(201).send(Acc);
  } catch (e) {
    console.log(e);
    logger.error(e);
    return res.status(400).send("Bad Request");
  }
});

Router.put("/v1/account/:id", async (req, res) => {
  sdc.increment("endpoint.updateAccount");
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
      // console.log(Acc.verifyuser);
      if (Acc.verifyuser && validPass) {
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
          logger.info("updateAccount Success");
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
    logger.error(e);
    return res.status(400).send("Bad Request");
  }
});

//Documents endpoint

Router.get("/v1/documents/:doc_id", async (req, res) => {
  sdc.increment("endpoint.getDocument");
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
      if (acc.verifyuser && validPass) {
        const doc = await Document.findOne({
          where: {
            user_id: acc.id,
            doc_id: req.params.doc_id,
          },
        });
        if (doc) {
          logger.info("getDocument Success");
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
    logger.error(e);
    return res.status(400).send("Bad Request");
  }
});

Router.get("/v1/documents", async (req, res) => {
  sdc.increment("endpoint.getAllDocuments");
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
      if (acc.verifyuser && validPass) {
        const doc = await Document.findAll({
          where: {
            user_id: acc.id,
          },
        });
        if (doc) {
          logger.info("getAllDocuments Success");
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
    logger.error(e);
    return res.status(400).send("Bad Request");
  }
});

Router.post("/v1/documents", async (req, res) => {
  sdc.increment("endpoint.postDocument");
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
      if (acc.verifyuser && validPass) {
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
            logger.info("postDocument Success");
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
    logger.error(e);
    return res.status(400).send("Bad Request");
  }
});

Router.delete("/v1/documents/:doc_id", async (req, res) => {
  sdc.increment("endpoint.deleteDocument");
  try {
    auth = authentication(req, res);
    var user = auth[0];
    var pass = auth[1];
    const acc = await Accounts.findOne({
      where: {
        username: user,
      },
    });
    if (acc.verifyuser && validPass) {
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
          logger.info("deleteDocument Success");
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
    logger.error(e);
    return res.status(404).send("Not Found");
  }
});

Router.get("/v1/verifyEmail", async (request, response) => {
  try {
    const emailQuery = request.query.email;
    const tokenQuery = request.query.token;

    aws.config.update({
      region: "us-east-1",
    });
    const dynamoDatabase = new aws.DynamoDB({
      apiVersion: "2012-08-10",
      region: "us-east-1",
    });

    let userName = await Accounts.findAll({ where: { username: emailQuery } });

    if (userName == "" || userName == null) {
      console.log(userName);
      return response.status(401).send("Unauthorized Access");
    }

    const verifyFlag = userName[0].verifyuser;

    if (verifyFlag) {
      return response.status(400).send("Your email is already verified");
    }

    // Create the Service interface for dynamoDB
    var parameter = {
      Key: {
        TokenName: { S: tokenQuery },
      },
      TableName: "myDynamoTokenTable",
      ProjectionExpression: "TimeToLive",
    };

    //getting the token from the dynamo table
    const dynamoResponse = await dynamoDatabase.getItem(parameter).promise();
    console.log("Response from dynamo", dynamoResponse);

    //check current timestamp to check if token is invalid
    const currentTime = Math.floor(Date.now() / 1000);

    console.log("TTL time", dynamoResponse.Item.TimeToLive.N);
    console.log("current time", Math.floor(Date.now() / 1000));

    if (
      currentTime > dynamoResponse.Item.TimeToLive.N ||
      dynamoResponse.Item == undefined
    ) {
      return response.status(400).send("Token has already expired");
    }
    //if the token is successfully verified, the verifyuser flag is updated to true
    await Accounts.update(
      { verifyuser: true },
      { where: { username: emailQuery } }
    );

    return response.status(200).send("Token successfully updated");
  } catch (e) {
    console.log(e);
    return response.status(500).send(e.message);
  }
});

module.exports = Router;
