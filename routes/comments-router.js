const {
  removeCommentById,
  patchCommentById,
  getAllComments,
} = require("../controllers/comments.controller");

const commentsRouter = require("express").Router();

commentsRouter.route("/").get(getAllComments);

commentsRouter
  .route("/:comment_id")
  .delete(removeCommentById)
  .patch(patchCommentById);

module.exports = commentsRouter;
