var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var orderedModel = require("../models/ordereds");
var userModel = require("../models/users");
var productModel = require("../models/products");
var multer = require("multer");
var random = (length = 8) => {
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
router.get("/:email", function (req, res, next) {
  console.log("get ordered by email: " + req.params.email);
  // orderedModel.aggregate({ id: req.params.id }, function (err, data) {
  //   res.json(data);
  // });
  orderedModel
    .aggregate([
      {
        $unwind: "$products",
      },
      {
        $match: {
          recipient_email: req.params.email,
        },
      },
      {
        $lookup: {
          from: "Products",
          localField: "products.id",
          foreignField: "id",
          as: "product",
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ])
    .exec()
    .then((data) => {
      res.status(200).json(data);
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
    status: "shipping",
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
//update status ordered
router.patch("/:id", multer().none(), function (req, res, next) {
  var id = req.params.id;
  var status = req.body.status;
  console.log("status: " + status);
  orderedModel
    .find({ id: id })
    .exec()
    .then((ordered) => {
      if (ordered.length < 1) {
        return res.status(401).json({
          message: "Ordered not found",
        });
      } else {
        orderedModel
          .updateOne(
            { id: id },
            {
              $set: {
                status: status,
              },
            }
          )
          .exec()
          .then((result) => {
            result.message = "Update status ordered successfully";
            res.status(200).json(result);
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({
              error: err,
            });
          });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});
//get product sale
router.get("/filter/:email", function (req, res, next) {
  console.log("get list ordered by email");
  var email = req.params.email;
  console.log("email: " + email);

  orderedModel
    .find({ recipient_email: email })
    .exec()
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
