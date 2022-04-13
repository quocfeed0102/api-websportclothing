var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");

var productModel = require("../models/products");

const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const condition = [];
/* GET products listing. */
router.get("/", function (req, res, next) {
  console.log("get products");
  productModel.find({}, function (err, data) {
    res.json(data);
  });
});
//get product by id
router.get("/:id", function (req, res, next) {
  var id = req.params.id;
  console.log("get product by id " + id);
  productModel.find({ id: id }, function (err, data) {
    res.json(data);
  });
});
//post new product
router.post("/", (req, res, next) => {
  console.log("Post new product");
  var name = req.query.n;
  var price = req.query.p;
  var discount = req.query.d;
  var category = req.query.c;
  var sizeS = req.query.ss;
  var sizeM = req.query.sm;
  var sizeL = req.query.sl;
  var description = req.query.des;
  var link_image = req.query.i;

  const product = new productModel({
    _id: new mongoose.Types.ObjectId(),
    id: random(1000000000, 9999999999),
    name: name,
    category: category,
    price: price,
    description: description,
    created_at: new Date().toLocaleDateString("en-US"),
    discount: discount,
    link_image: link_image,
    review: [],
    stock: [
      {
        size: "S",
        available: sizeS,
        sold: 0,
      },
      {
        size: "M",
        available: sizeM,
        sold: 0,
      },
      {
        size: "L",
        available: sizeL,
        sold: 0,
      },
    ],
  });
  product
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        status: "Product created",
      });
    })
    .catch((err) => {
      console.log("error: " + err);
      res.status(500).json({
        error: err,
      });
    });
});
//delete product
router.delete("/:id", (req, res, next) => {
  console.log("Delete: " + req.params.id);
  productModel
    .remove({ id: req.params.id })
    .exec()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});
//Update - PUT method product
router.put("/:id", (req, res, next) => {
  var id = req.params.id;
  console.log("Put: " + id);
  var name = req.query.n;
  var price = req.query.p;
  var discount = req.query.d;
  var category = req.query.c;
  var sizeS = req.query.ss;
  var sizeM = req.query.sm;
  var sizeL = req.query.sl;
  var description = req.query.des;
  var link_image = req.query.i;
  productModel
    .find({ id: id })
    .exec()
    .then((product) => {
      if (product.length < 1) {
        return res.status(401).json({
          message: "Product not found",
        });
      } else {
        productModel
          .updateOne(
            { id: id },
            {
              $set: {
                name: name,
                category: category,
                price: price,
                description: description,
                created_at: new Date().toLocaleDateString("en-US"),
                discount: discount,
                link_image: link_image,
                stock: [
                  {
                    size: "S",
                    available: sizeS,
                    sold: product[0].stock[0].sold,
                  },
                  {
                    size: "M",
                    available: sizeM,
                    sold: product[0].stock[1].sold,
                  },
                  {
                    size: "L",
                    available: sizeL,
                    sold: product[0].stock[2].sold,
                  },
                ],
              },
            }
          )
          .exec()
          .then((result) => {
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
//get product bv id category
router.get("/category/:id", function (req, res, next) {
  var id = req.params.id;
  console.log("get product by id category " + id);
  productModel.find({ category: id }, function (err, data) {
    res.json(data);
  });
});
//get product sale
router.get("/filter/sale", function (req, res, next) {
  console.log("get product by sale ");
  productModel.find({ discount: { $gt: 0 } }, function (err, data) {
    res.json(data);
  });
});
//get product sale
router.get("/filter/sale", function (req, res, next) {
  console.log("get product by sale ");
  productModel.find({ discount: { $gt: 0 } }, function (err, data) {
    res.json(data);
  });
});
//get product filter price
// router.get("/filter/price/:", function (req, res, next) {
//   console.log("get product by sale ");
//   productModel.find({ discount: { $gt: 0 } }, function (err, data) {
//     res.json(data);
//   });
// });

module.exports = router;
