//Package Imports
const express = require("express");
//App Definition
const app = express();
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const qbRoutes = require("./routes/qb");
//Middleware setup
app.use(bodyParser.json());
app.use(qbRoutes);

//PORT
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));

module.exports = app;
