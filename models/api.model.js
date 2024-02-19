const endpointsDescription = require("../endpoints.json");

function requiresEnpointsFile() {
  return endpointsDescription;
}

module.exports = { requiresEnpointsFile };
