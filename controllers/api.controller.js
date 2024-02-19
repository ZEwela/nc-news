const { readEnpointsFile } = require("../models/api.model");

function getEndpointsDescription(req, res, next) {
  readEnpointsFile()
    .then((apiEnpointsDescription) => {
      const parsedEndpointsDescription = JSON.parse(apiEnpointsDescription);
      res
        .status(200)
        .send({ apiEndpointsDescription: parsedEndpointsDescription });
    })
    .catch((err) => next(err));
}

module.exports = { getEndpointsDescription };
