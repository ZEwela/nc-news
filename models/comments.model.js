const db = require("../db/connection");

function selectCommentsByArticleId(articleId) {
  return db
    .query(
      `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;`,
      [articleId]
    )
    .then((response) => {
      const comments = response.rows;

      return comments;
    });
}

function insertCommentByArticleId(articleId, body) {
  return db
    .query(
      `INSERT INTO comments (author, article_id, body) VALUES ($1, $2, $3) RETURNING *;`,
      [body.username, articleId, body.body]
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

module.exports = {
  selectCommentsByArticleId,
  insertCommentByArticleId,
  deleteCommentById,
};
