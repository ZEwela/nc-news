const express = require("express");
const apiRouter = require("./routes/api-router");
const cors = require('cors');
const {
  handleCustomErrors,
  handlePSQLErrors,
  handleServerError,
} = require("./controllers/errors.controller");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", apiRouter);

app.all("/*", (req, res, next) => {
  res.status(404).send({ msg: "Path not found." });
});

app.use(handleCustomErrors);

app.use(handlePSQLErrors);

app.use(handleServerError);

module.exports = app;
