const db = require("../db/connection");

function selectAllUsers() {
  return db
    .query(`SELECT username, name, avatar_url FROM users;`)
    .then((response) => {
      const users = response.rows;
      return users;
    });
}

module.exports = { selectAllUsers };
