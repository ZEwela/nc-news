const {
  removeCommentById,
  getCommentsByArticleId,
  postCommentByArticleId,
  patchCommentById,
} = require("../controllers/comments.controller");

const commentsRouter = require("express").Router({ mergeParams: true });

commentsRouter
  .route("/")
  .get(getCommentsByArticleId)
  .post(postCommentByArticleId);

commentsRouter
  .route("/:comment_id")
  .delete(removeCommentById)
  .patch(patchCommentById);

module.exports = commentsRouter;
