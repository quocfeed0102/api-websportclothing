var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const ProductSchema = new Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    id: {
      type: "number",
      // required: true,
    },
    name: { type: "string" },
    category: { type: "string" },
    price: { type: "number"},
    description: { type: "string" },
    created_at: { type: "string" },
    discount: { type: "number" },
    link_image: { type: "string" },
    review: {
      type: "array",
    },
    stock: { type: "array" },
  },
  { collection: "Products" }
);
const Product = mongoose.model("Products", ProductSchema);
module.exports = Product;
