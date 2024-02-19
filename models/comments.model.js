const db = require("../db/connection");

function selectCommentsByArticleId(articleId) {
  return db
    .query(`SELECT * FROM comments WHERE article_id = $1;`, [articleId])
    .then((response) => {
      return response.rows;
    });
}

module.exports = { selectCommentsByArticleId };
