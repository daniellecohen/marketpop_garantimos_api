const mongoose = require("../database");

const Schema = mongoose.Schema;

const clientSchema = new Schema(
  {
    name: {
      type: String
    },
    tel: {
      type: String,
      required: true
    },
    points: {
      type: Number,
      default: 0,
      required: true
    },
    rewarded: {
      type: Number,
      default: 0,
      required: true
    },
    indicated: {
      type: Number,
      default: 0,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Client = mongoose.model("Client", clientSchema);
module.exports = Client;
