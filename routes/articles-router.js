const {
  getArticleById,
  patchArticleById,
  getAllArticles,
} = require("../controllers/articles.controller");

const artcilesRouter = require("express").Router();

artcilesRouter
  .route("/:article_id")
  .get(getArticleById)
  .patch(patchArticleById);

artcilesRouter.get("/", getAllArticles);

module.exports = artcilesRouter;
