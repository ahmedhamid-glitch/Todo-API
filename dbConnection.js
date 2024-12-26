const { connect } = require("mongoose");

async function connectMongoDB(url) {
  try {
    await connect(url);
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  connectMongoDB,
};
