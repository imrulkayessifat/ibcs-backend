const mongoose = require("mongoose");
const employeeSchema = new mongoose.Schema({
  uniqueId: {
    type: Number,
  },
  name: {
    required: true,
    type: String,
  },
  rank: {
    required: true,
    type: String,
  },
  address: {
    required: true,
    type: String,
  },
  mobile: {
    required: true,
    type: String,
  },
  account: {
    required: true,
    type: String,
  },
});

module.exports = mongoose.model("Data", employeeSchema);
