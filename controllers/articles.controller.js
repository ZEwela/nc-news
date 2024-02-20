const {
  selectArticleById,
  selectAllArticles,
  updateArticleById,
} = require("../models/articles.model");

function getArticleById(req, res, next) {
  const articleId = req.params.article_id;
  selectArticleById(articleId)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
}

function getAllArticles(req, res, next) {
  const { topic } = req.query;

  selectAllArticles(topic)
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch((err) => next(err));
}

function patchArticleById(req, res, next) {
  const articleId = req.params.article_id;
  const { inc_votes } = req.body;

  const promises = [
    selectArticleById(articleId),
    updateArticleById(articleId, inc_votes),
  ];

  Promise.all(promises)
    .then((promisesResolution) => {
      res.status(200).send({ article: promisesResolution[1] });
    })
    .catch((err) => {
      next(err);
    });
}

module.exports = { getArticleById, getAllArticles, patchArticleById };
