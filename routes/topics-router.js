const {
  getTopicBySlug,
  getAllTopics,
} = require("../controllers/topics.controller");

const topicsRouter = require("express").Router();

topicsRouter.get("/:slug", getTopicBySlug);

topicsRouter.get("/", getAllTopics);

module.exports = topicsRouter;
