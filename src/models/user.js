const mongoose = require("../database");
const bcrypt = require("bcryptjs");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    company_name: {
      type: String
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
      required: true
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
    ],
    admin: {
      type: Boolean,
      default: false
    }
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
