const db = require("../db/connection");

function selectArticleById(articleId) {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [articleId])
    .then((response) => {
      const article = response.rows[0];
      if (!article) {
        return Promise.reject({ status: 400, msg: "Bad request." });
      }
      return article;
    });
}

module.exports = { selectArticleById };
