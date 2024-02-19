const { requiresEnpointsFile } = require("../models/api.model");

function getEndpointsDescription(req, res, next) {
  const apiEndpointsDescription = requiresEnpointsFile();

  res.status(200).send({ apiEndpointsDescription });
}

module.exports = { getEndpointsDescription };
