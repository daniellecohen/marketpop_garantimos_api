const mongoose = require("../database");

const Schema = mongoose.Schema;

const couponSchema = new Schema(
  {
    createdBy: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: true
    },
    usedBy: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

const Coupon = mongoose.model("Coupon", couponSchema);
module.exports = Coupon;
