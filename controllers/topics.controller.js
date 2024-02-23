const {
  selectAllTopics,
  selectTopicBySlug,
  insertTopic,
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

function postTopic(req, res, next) {
  const body = req.body;
  insertTopic(body)
    .then((topic) => {
      res.status(201).send({ topic });
    })
    .catch((err) => next(err));
}

module.exports = { getAllTopics, getTopicBySlug, postTopic };
