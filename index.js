const express = require("express");
const app = express();

//Endpoints for health status check
app.get("/", (req, res) => {
  res.status(200).send("server responds with 200 OK if it is healhty.");
});

app.get("/healthz", (req, res) => {
  res.status(200).send("server responds with 200 OK if it is healhty.");
});

//PORT
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
