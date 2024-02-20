const { selectArticleById } = require("../models/articles.model");
const { selectCommentsByArticleId } = require("../models/comments.model");

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

module.exports = { getCommentsByArticleId };
