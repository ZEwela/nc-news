const {
  selectArticleById,
  selectAllArticles,
  updateArticleById,
  insertArticle,
} = require("../models/articles.model");
const { selectTopicBySlug } = require("../models/topics.model");
const { selectUserByUsername } = require("../models/users.model");

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
  const { topic, sort_by, order, limit, p } = req.query;

  const promises = [selectAllArticles(topic, sort_by, order, limit, p)];

  if (topic) {
    promises.push(selectTopicBySlug(topic));
  }

  Promise.all(promises)
    .then((promisesResolution) => {
      res.status(200).send(promisesResolution[0]);
    })
    .catch((err) => {
      next(err);
    });
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

function postArticle(req, res, next) {
  const body = req.body;

  const promises = [
    selectUserByUsername(body.author),
    selectTopicBySlug(body.topic),
    insertArticle(body),
  ];
  Promise.all(promises)
    .then((promisesResolution) => {
      res.status(201).send({ article: promisesResolution[2] });
    })
    .catch((err) => {
      next(err);
    });
}

module.exports = {
  getArticleById,
  getAllArticles,
  patchArticleById,
  postArticle,
};
