var express = require("express");
const Ordered = require("../models/ordereds");
var router = express.Router();
var orderedModel = require("../models/ordereds");
const multer = require("multer");
const random = (length = 8) => {
  // Declare all characters
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  // Pick characers randomly
  let str = "";
  for (let i = 0; i < length; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return str;
};
/* GET ordered listing. */
router.get("/", function (req, res, next) {
  orderedModel.find({}, function (err, data) {
    res.json(data);
  });
});
//get ordered by id
router.get("/:id", function (req, res, next) {
  console.log("get ordered by id ");
  orderedModel.find({ id: req.params.id }, function (err, data) {
    res.json(data);
  });
});

//insert new ordered
router.post("/", multer().none(), (req, res, next) => {
  var recipientName = req.body.rn;
  var recipientPhone = req.body.rp;
  var recipientEmail = req.body.re;
  var recipientAddress = req.body.ra;
  var note = req.body.n;
  //products co format: id,id,id,....
  var listProduct = req.body.products.split(",");
  var sizeProduct = req.body.sl.split(",");
  var quantityList = req.body.qt.split(",");
  var discount = req.body.d;
  var totalPrice = req.body.tp;

  var id = random(30);
  var products = [];
  for (var i = 0; i < sizeProduct.length; i++) {
    products.push({
      id: +listProduct[i],
      size: sizeProduct[i],
      quantity: +quantityList[i],
    });
  }
  const ordered = new orderedModel({
    _id: new mongoose.Types.ObjectId(),
    id: id,
    recipient_name: recipientName,
    recipient_phone: recipientPhone,
    recipient_email: recipientEmail,
    recipient_address: recipientAddress,
    note: note,
    products: products,
    discount: +discount,
    total_price: +totalPrice,
  });
  ordered
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        status: "Ordered created",
        id: id,
      });
    })
    .catch((err) => {
      console.log("error: " + err);
      res.status(500).json({
        error: err,
      });
    });
});

module.exports = router;
