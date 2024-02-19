const db = require("../db/connection");

function selectCommentsByArticleId(articleId) {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [articleId])
    .then((response) => {
      const article = response.rows[0];
      if (!article) {
        return Promise.reject({ status: 400, msg: "Bad request." });
      }
    })
    .then(() => {
      return db.query(
        `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;`,
        [articleId]
      );
    })
    .then((response) => {
      const comments = response.rows;

      return comments;
    });
}

module.exports = { selectCommentsByArticleId };
