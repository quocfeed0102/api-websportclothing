var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const CategorySchema = new Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    id: {
      type: "number",
      required: true,
      unique: true,
    },
    name: { type: "string", required: true, unique: true },
    image: { type: "string", required: true, unique: true },
  },
  { collection: "Categories" }
);
const Category = mongoose.model("Categories", CategorySchema);
module.exports = Category;
