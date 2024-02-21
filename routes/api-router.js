const { getEndpointsDescription } = require("../controllers/api.controller");

const apiRouter = require("express").Router();

apiRouter.get("/", getEndpointsDescription);

module.exports = apiRouter;
