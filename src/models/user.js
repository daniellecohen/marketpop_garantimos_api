const mongoose = require("../database");
const bcrypt = require("bcryptjs");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    company_name: {
      type: String,
      default: "Barraca do(a) Fulano(a)"
    },
    telephone: {
      type: Number,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    message: {
      type: String
    },
    reward: {
      type: String
    },
    rewardCount: {
      type: Number,
      default: 10
    },
    clients: [
      {
        type: Schema.Types.ObjectId,
        ref: "Client"
      }
    ]
  },
  {
    timestamps: true
  }
);

userSchema.pre("save", async function(next) {
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;

  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
