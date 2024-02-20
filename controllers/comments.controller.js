const { selectArticleById } = require("../models/articles.model");
const {
  selectCommentsByArticleId,
  insertCommentByArticleId,
} = require("../models/comments.model");

function getCommentsByArticleId(req, res, next) {
  const articleId = req.params.article_id;

  const promises = [
    selectArticleById(articleId),
    selectCommentsByArticleId(articleId),
  ];

  Promise.all(promises)
    .then((promisesResolution) => {
      res.status(200).send({ comments: promisesResolution[1] });
    })
    .catch((err) => next(err));
}

function postCommentByArticleId(req, res, next) {
  const articleId = req.params.article_id;
  const body = req.body;

  const promises = [
    selectArticleById(articleId),
    insertCommentByArticleId(articleId, body),
  ];

  Promise.all(promises)
    .then((promisesResolution) => {
      res.status(201).send({ comment: promisesResolution[1] });
    })
    .catch((err) => next(err));
}
module.exports = { getCommentsByArticleId, postCommentByArticleId };
