const db = require("../db/connection");

function selectCommentsByArticleId(articleId) {
  return db
    .query(
      `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;`,
      [articleId]
    )
    .then((response) => {
      return response.rows;
    });
}

module.exports = { selectCommentsByArticleId };
