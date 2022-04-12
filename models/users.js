var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    id: {
      type: "string",
      // required: true,
    },
    name: { type: "string" },
    phone: { type: "string" },
    email: {
      type: "string",
      match:
        /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
    },
    gender: { type: "string" },
    age: { type: "string" },
    address: { type: "string" },
    linkAvt: { type: "string" },
    account: {
      type: "object",
    },
    wishlist: { type: "array" },
    cart: { type: "array" },
    ordered: { type: "array" },
  },
  { collection: "Users" }
);
const User = mongoose.model("Users", UserSchema);
module.exports = User;
