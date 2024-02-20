const { selectAllUsers } = require("../models/users.model");

function getAllUsers(req, res, next) {
  selectAllUsers()
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch((err) => next(err));
}

module.exports = { getAllUsers };
