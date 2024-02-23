const {
  getArticleById,
  patchArticleById,
  getAllArticles,
  postArticle,
  removeArticleById,
} = require("../controllers/articles.controller");
const commentsRouter = require("./comments-router");

const artcilesRouter = require("express").Router();

artcilesRouter
  .route("/:article_id")
  .get(getArticleById)
  .patch(patchArticleById)
  .delete(removeArticleById);

artcilesRouter.route("/").get(getAllArticles).post(postArticle);

artcilesRouter.use("/:article_id/comments", commentsRouter);

module.exports = artcilesRouter;
