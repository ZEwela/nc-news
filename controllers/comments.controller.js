const { selectArticleById } = require("../models/articles.model");
const {
  selectCommentsByArticleId,
  insertCommentByArticleId,
  deleteCommentById,
  updateCommentById,
} = require("../models/comments.model");
const { selectUserByUsername } = require("../models/users.model");

function getCommentsByArticleId(req, res, next) {
  const articleId = req.params.article_id;
  const { limit, p } = req.query;

  const promises = [
    selectArticleById(articleId),
    selectCommentsByArticleId(articleId, limit, p),
  ];

  Promise.all(promises)
    .then((promisesResolution) => {
      res.status(200).send({ comments: promisesResolution[1] });
    })
    .catch((err) => next(err));
}

function postCommentByArticleId(req, res, next) {
  const articleId = req.params.article_id;
  const { username, body } = req.body;

  const promises = [
    selectArticleById(articleId),
    insertCommentByArticleId(articleId, username, body),
    selectUserByUsername(username),
  ];

  Promise.all(promises)
    .then((promisesResolution) => {
      res.status(201).send({ comment: promisesResolution[1] });
    })
    .catch((err) => next(err));
}

function removeCommentById(req, res, next) {
  const commentId = req.params.comment_id;

  deleteCommentById(commentId)
    .then(() => {
      res.sendStatus(204);
    })
    .catch((err) => {
      next(err);
    });
}

function patchCommentById(req, res, next) {
  const commentId = req.params.comment_id;
  const { inc_votes } = req.body;

  updateCommentById(commentId, inc_votes)
    .then((comment) => {
      res.status(200).send({ comment });
    })
    .catch((err) => next(err));
}
module.exports = {
  getCommentsByArticleId,
  postCommentByArticleId,
  removeCommentById,
  patchCommentById,
};
