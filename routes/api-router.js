const { getEndpointsDescription } = require("../controllers/api.controller");
const artcilesRouter = require("./articles-router");
const topicsRouter = require("./topics-router");
const usersRouter = require("./users-router");

const apiRouter = require("express").Router();

apiRouter.use("/topics", topicsRouter);

apiRouter.use("/articles", artcilesRouter);

apiRouter.use("/users", usersRouter);

apiRouter.get("/", getEndpointsDescription);

module.exports = apiRouter;
