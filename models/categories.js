var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const CategorySchema = new Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    id: {
      type: "number",
      // required: true,
    },
    id: { type: "string" },
    name: { type: "string" },
    image: { type: "string" },
  },
  { collection: "Categories" }
);
const Category = mongoose.model("Categories", CategorySchema);
module.exports = Category;
