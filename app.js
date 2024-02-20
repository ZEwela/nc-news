const express = require("express");
const { getAllTopics } = require("./controllers/topics.controller");
const { getEndpointsDescription } = require("./controllers/api.controller");
const {
  getArticleById,
  getAllArticles,
} = require("./controllers/articles.controller");
const {
  getCommentsByArticleId,
  postCommentByArticleId,
} = require("./controllers/comments.controller");

const app = express();
app.use(express.json());

app.get("/api/topics", getAllTopics);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.post("/api/articles/:article_id/comments", postCommentByArticleId);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles", getAllArticles);

app.get("/api", getEndpointsDescription);

app.all("/*", (req, res, next) => {
  res.status(404).send({ msg: "Path not found." });
});

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err.code === "22P02" || err.code === "23502") {
    res.status(400).send({ msg: "Bad request." });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.log("Error: ", err);
  res.status(500).send({ msg: "Internal Server Error." });
});

module.exports = app;
