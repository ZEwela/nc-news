const db = require("../db/connection");

function selectArticleById(articleId) {
  return db
    .query(
      `SELECT 
      articles.article_id, 
      articles.title, 
      articles.topic, 
      articles.author, 
      articles.body,
      articles.created_at, 
      articles.votes, 
      articles.article_img_url, 
      COUNT(comments.comment_id) AS comment_count
      FROM articles
      LEFT JOIN comments
      ON articles.article_id = comments.article_id
     WHERE articles.article_id = $1
     GROUP BY articles.article_id;`,
      [articleId]
    )
    .then((response) => {
      const article = response.rows[0];
      if (!article) {
        return Promise.reject({ status: 404, msg: "Not found." });
      }
      return article;
    });
}

function selectAllArticles(topic) {
  const queryValues = [];
  let queryString = `SELECT 
    articles.article_id, 
    articles.title, 
    articles.topic, 
    articles.author, 
    articles.created_at, 
    articles.votes, 
    articles.article_img_url, 
    COUNT(comments.comment_id) AS comment_count
    FROM articles
    LEFT JOIN comments
    ON articles.article_id = comments.article_id
    `;

  if (topic) {
    queryString += ` WHERE articles.topic = $1`;
    queryValues.push(topic);
  }

  queryString += ` GROUP BY
  articles.article_id
   ORDER BY articles.created_at DESC
    ;`;
  return db.query(queryString, queryValues).then((response) => {
    const articles = response.rows;
    return articles;
  });
}

function updateArticleById(articleId, inc_votes) {
  return db
    .query(
      `UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *;`,
      [inc_votes, articleId]
    )
    .then((response) => {
      const article = response.rows[0];
      return article;
    });
}

module.exports = {
  selectArticleById,
  selectAllArticles,
  updateArticleById,
};
