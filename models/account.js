const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
  total_amount: {
    type: Number,
  },
});

module.exports = mongoose.model("Account", accountSchema);
