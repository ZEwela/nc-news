const {
  getArticleById,
  patchArticleById,
  getAllArticles,
  postArticle,
  removeArticleById,
} = require("../controllers/articles.controller");
const {
  getCommentsByArticleId,
  postCommentByArticleId,
} = require("../controllers/comments.controller");

const artcilesRouter = require("express").Router();

artcilesRouter
  .route("/:article_id")
  .get(getArticleById)
  .patch(patchArticleById)
  .delete(removeArticleById);

artcilesRouter.route("/").get(getAllArticles).post(postArticle);

artcilesRouter
  .route("/:article_id/comments")
  .get(getCommentsByArticleId)
  .post(postCommentByArticleId);

module.exports = artcilesRouter;
