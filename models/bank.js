const mongoose = require("mongoose");
const Model = require("../models/model");

const bankSchema = new mongoose.Schema({
  basic: {
    type: Number,
  },
  houserent: {
    type: Number,
  },
  medicalallowance: {
    type: Number,
  },
  details: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: Model,
    },
  ],
});

module.exports = mongoose.model("Bank", bankSchema);
