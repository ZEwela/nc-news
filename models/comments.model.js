const db = require("../db/connection");

function selectCommentsByArticleId(articleId, limit = 10, p = 1) {
  const offset = (p - 1) * limit;
  return db
    .query(
      `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC
      LIMIT $2 OFFSET $3;`,
      [articleId, limit, offset]
    )
    .then((response) => {
      const comments = response.rows;

      return comments;
    });
}

function insertCommentByArticleId(articleId, username, body) {
  return db
    .query(
      `INSERT INTO comments (author, article_id, body) VALUES ($1, $2, $3) RETURNING *;`,
      [username, articleId, body]
    )
    .then((response) => {
      const comment = response.rows[0];

      return comment;
    });
}

function deleteCommentById(commentId) {
  return db
    .query(`DELETE FROM comments WHERE comment_id = $1 RETURNING *;`, [
      commentId,
    ])
    .then((response) => {
      const deletedComment = response.rows[0];
      if (!deletedComment) {
        return Promise.reject({ status: 404, msg: "Not found." });
      }
    });
}

function updateCommentById(commentId, inc_votes) {
  return db
    .query(
      `UPDATE comments 
    SET votes = votes + $1 
    WHERE comment_id = $2 
    RETURNING *;`,
      [inc_votes, commentId]
    )
    .then((response) => {
      const comment = response.rows[0];
      if (!comment) {
        return Promise.reject({ status: 404, msg: "Not found." });
      }
      return comment;
    });
}

module.exports = {
  selectCommentsByArticleId,
  insertCommentByArticleId,
  deleteCommentById,
  updateCommentById,
};
