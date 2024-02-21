const {
  removeCommentById,
  getCommentsByArticleId,
  postCommentByArticleId,
} = require("../controllers/comments.controller");

const commentsRouter = require("express").Router({ mergeParams: true });

commentsRouter
  .route("/")
  .get(getCommentsByArticleId)
  .post(postCommentByArticleId);

commentsRouter.delete("/:comment_id", removeCommentById);

module.exports = commentsRouter;
