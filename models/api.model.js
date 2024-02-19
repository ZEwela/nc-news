const fs = require("fs/promises");

function readEnpointsFile() {
  const filePath = `${__dirname}/../endpoints.json`;

  return fs.readFile(filePath, "utf-8").then((response) => {
    return response;
  });
}

module.exports = { readEnpointsFile };
