const express = require("express");
const app = express();
const mysql = require("mysql");
const bodyParser = require("body-parser");
const qbRoutes = require("./routes/qb");
app.use(bodyParser.json());
app.use(qbRoutes);

//Endpoints for health status check
app.get("/", (req, res) => {
  res.status(200).send();
});

//Health check
app.get("/healthz", (req, res) => {
  res.status(200).send();
});

//PORT
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
