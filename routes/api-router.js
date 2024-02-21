const { getEndpointsDescription } = require("../controllers/api.controller");
const artcilesRouter = require("./articles-router");

const apiRouter = require("express").Router();

apiRouter.use("/articles", artcilesRouter);

apiRouter.get("/", getEndpointsDescription);

module.exports = apiRouter;
