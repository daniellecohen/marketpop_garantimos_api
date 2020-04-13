const mongoose = require("../database");

const Schema = mongoose.Schema;


//Esse esquema vai ter uma variável sempre só
const generalSchema = new Schema(
  {
    lastCouponUsed: {
      type: String,
    },
    // Vou usar essa variável pra achar esse cupom e atualizar sempre o mesmo. 
    uniqueCouponCode: {
      type: String,
      unique: true
    },
  },
  {
    timestamps: true
  }
);

const General = mongoose.model("General", generalSchema);
module.exports = General;