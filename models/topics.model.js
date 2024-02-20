const db = require("../db/connection");

function selectAllTopics() {
  return db.query(`SELECT * FROM topics;`).then((result) => {
    return result.rows;
  });
}

function selectTopicBySlug(slug) {
  return db
    .query(`SELECT * FROM topics WHERE slug = $1;`, [slug])
    .then((result) => {
      const topic = result.rows[0];
      if (!topic) {
        return Promise.reject({ status: 404, msg: "Not found." });
      }
      return topic;
    });
}

module.exports = { selectAllTopics, selectTopicBySlug };
