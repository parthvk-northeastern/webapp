const mysql = require("mysql");

//MySQL connection
//Create connection
const mysqlConnection = mysql.createConnection({
  host: "localhost",
  user: "newuser",
  password: "newpassword",
  database: "nodemysql",
  multipleStatements: true,
});

//Connect
mysqlConnection.connect((err) => {
  if (!err) {
    console.log("Connected");
  } else {
    console.log("Connection Failed");
  }
});

module.exports = mysqlConnection;
