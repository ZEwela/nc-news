const {
  getArticleById,
  patchArticleById,
  getAllArticles,
} = require("../controllers/articles.controller");
const commentsRouter = require("./comments-router");

const artcilesRouter = require("express").Router();

artcilesRouter
  .route("/:article_id")
  .get(getArticleById)
  .patch(patchArticleById);

artcilesRouter.get("/", getAllArticles);

artcilesRouter.use("/:article_id/comments", commentsRouter);

module.exports = artcilesRouter;
