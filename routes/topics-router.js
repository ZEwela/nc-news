const {
  getTopicBySlug,
  getAllTopics,
  postTopic,
} = require("../controllers/topics.controller");

const topicsRouter = require("express").Router();

topicsRouter.get("/:slug", getTopicBySlug);

topicsRouter.route("/").get(getAllTopics).post(postTopic);

module.exports = topicsRouter;
