const express = require("express");
const { getAllTopics } = require("./controllers/topics.controller");
const { getEndpointsDescription } = require("./controllers/api.controller");

const app = express();

app.get("/api/topics", getAllTopics);

app.get("/api", getEndpointsDescription);

app.all("/*", (req, res, next) => {
  res.status(404).send({ msg: "Path not found." });
});

app.use((err, req, res, next) => {
  console.log("Error: ", err);
  res.status(500).send({ msg: "Internal Server Error." });
});

module.exports = app;
