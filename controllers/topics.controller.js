const {
  selectAllTopics,
  selectTopicBySlug,
} = require("../models/topics.model");

function getAllTopics(req, res, next) {
  selectAllTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch((err) => next(err));
}

function getTopicBySlug(req, res, next) {
  const { slug } = req.params;
  selectTopicBySlug(slug)
    .then((topic) => {
      res.status(200).send({ topic });
    })
    .catch((err) => next(err));
}

module.exports = { getAllTopics, getTopicBySlug };
