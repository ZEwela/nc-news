function handlePSQLErrors(err, req, res, next) {
  if (err.code === "22P02" || err.code === "23502") {
    res.status(400).send({ msg: "Bad request." });
  } else if (err.code === "23503") {
    res.status(404).send({ msg: "Not found." });
  } else if (err.code === "23505") {
    res.status(409).send({ msg: "Already exists." });
  } else {
    next(err);
  }
}

function handleCustomErrors(err, req, res, next) {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
}

function handleServerError(err, req, res, next) {
  console.log("Error: ", err);
  res.status(500).send({ msg: "Internal Server Error." });
}

module.exports = { handleCustomErrors, handlePSQLErrors, handleServerError };
