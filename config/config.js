require("dotenv").config();

// {
//   "development": {
//     "username": "newuser",
//     "password": "newpassword",
//     "database": "nodemysql",
//     "host": process.env.RDS,
//     "dialect": "mysql",
//     "timezone": "-04:00"
//   }
// }

module.exports = {
  // HOST: "localhost",
  // USER: "root",
  // DB: "test_db",
  host: process.env.host,
  username: process.env.user,
  password: process.env.password,
  database: process.env.database,
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
  },
};
