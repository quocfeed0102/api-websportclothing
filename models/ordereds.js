var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const OrderSchema = new Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    id: { type: "string" },
    id_user: { type: "string" },
    recipient_name: { type: "string" },
    recipient_phone: { type: "string" },
    recipient_email: { type: "string" },
    recipient_address: { type: "string" },
    note: { type: "string" },
    products: { type: "array" },
    discount: { type: "number" },
    total_price: { type: "number" },
    status: { type: "string" },
  },
  { collection: "Ordereds" }
);
const Ordered = mongoose.model("Ordereds", OrderSchema);
module.exports = Ordered;
