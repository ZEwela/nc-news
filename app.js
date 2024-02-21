const express = require("express");
const {
  getAllTopics,
  getTopicBySlug,
} = require("./controllers/topics.controller");

const {
  getArticleById,
  getAllArticles,
  patchArticleById,
} = require("./controllers/articles.controller");
const {
  getCommentsByArticleId,
  postCommentByArticleId,
  removeCommentById,
} = require("./controllers/comments.controller");
const { getAllUsers } = require("./controllers/users.controller");
const apiRouter = require("./routes/api-router");

const app = express();
app.use(express.json());

app.get("/api/topics/:slug", getTopicBySlug);

app.get("/api/topics", getAllTopics);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.post("/api/articles/:article_id/comments", postCommentByArticleId);

app.delete("/api/comments/:comment_id", removeCommentById);

app.get("/api/users", getAllUsers);

app.use("/api", apiRouter);

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
