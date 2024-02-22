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

function selectAllArticles(
  topic,
  sort_by = "created_at",
  order = "desc",
  limit = 10,
  p = 1
) {
  const offset = (p - 1) * limit;
  const sortLookup = [
    "article_id",
    "title",
    "topic",
    "author",
    "created_at",
    "votes",
    "article_img_url",
    "comment_count",
    "body",
  ];
  const orderLookup = ["asc", "desc"];

  if (!sortLookup.includes(sort_by) || !orderLookup.includes(order)) {
    return Promise.reject({ status: 400, msg: "Bad request." });
  }

  const queryStringBaseValues = [];
  const queryValues = [];

  let queryStringBase = `SELECT 
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
    queryStringBase += ` WHERE articles.topic = $1`;
    queryValues.push(topic);
    queryStringBaseValues.push(topic);
  }

  queryStringBase += ` GROUP BY
  articles.article_id
   ORDER BY articles.${sort_by} ${order}`;

  queryValues.push(limit);
  queryValues.push(offset);

  let queryString =
    queryStringBase +
    ` LIMIT $${queryValues.length - 1} OFFSET $${queryValues.length}
    ;`;

  const totalCountPromise = db.query(
    queryStringBase + ";",
    queryStringBaseValues
  );

  const promises = [db.query(queryString, queryValues), totalCountPromise];

  return Promise.all(promises).then((responses) => {
    return {
      articles: responses[0].rows,
      total_count: responses[1].rowCount,
    };
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

function insertArticle({ author, title, body, topic, article_img_url }) {
  const queryValues = [author, title, body, topic];

  let queryString = `INSERT INTO articles
    (author, title, body, topic`;

  if (article_img_url) {
    queryString += ` , article_img_url`;
    queryValues.push(article_img_url);
  }

  queryString += `) 
  VALUES ($1, $2, $3, $4`;

  if (article_img_url) {
    queryString += ` ,$5`;
  }

  queryString += `) RETURNING *;`;

  return db.query(queryString, queryValues).then((response) => {
    const article = response.rows[0];
    article.comment_count = "0";

    return article;
  });
}

module.exports = {
  selectArticleById,
  selectAllArticles,
  updateArticleById,
  insertArticle,
};
