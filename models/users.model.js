const db = require("../db/connection");

function selectAllUsers() {
  return db
    .query(`SELECT username, name, avatar_url FROM users;`)
    .then((response) => {
      const users = response.rows;
      return users;
    });
}

function selectUserByUsername(username) {
  return db
    .query(`SELECT * FROM users WHERE username = $1;`, [username])
    .then((response) => {
      const user = response.rows[0];
      if (!user) {
        return Promise.reject({ status: 404, msg: "Not found." });
      }
      return user;
    });
}

module.exports = { selectAllUsers, selectUserByUsername };
