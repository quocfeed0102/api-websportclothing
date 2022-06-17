var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
var fs = require("fs");
var productModel = require("../models/products");
var imageUpload = ""; //luu tru image dang upload tam thoi.
var imageToUri = require("image-to-uri");
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const condition = [];

const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    imageUpload = uniqueSuffix + "-" + file.originalname;
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

/* GET products listing. */
router.get("/", function (req, res, next) {
  console.log("get products");
  var condition = req.params.condition;
  productModel
    .find({}, function (err, data) {
      res.json(data);
    })
    .sort(req.query);
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
router.post("/", upload.single("i"), (req, res, next) => {
  console.log("Post new product");
  var name = req.body.n;
  var price = req.body.p;
  var discount = req.body.d;
  var category = req.body.c;
  var sizeS = req.body.ss;
  var sizeM = req.body.sm;
  var sizeL = req.body.sl;
  var description = req.body.des;

  var link_image = imageToUri("./public/uploads/" + imageUpload);
  imageUpload = "";
  pathImageUpload = "";

  console.log("name: " + name);

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
        available: +sizeS,
        sold: 0,
      },
      {
        size: "M",
        available: +sizeM,
        sold: 0,
      },
      {
        size: "L",
        available: +sizeL,
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
router.put("/:id", upload.single("i"), (req, res, next) => {
  var id = req.params.id;
  console.log("Put: " + id);
  var name = req.body.n;
  var price = req.body.p;
  var discount = req.body.d;
  var category = req.body.c;
  var sizeS = req.body.ss;
  var sizeM = req.body.sm;
  var sizeL = req.body.sl;
  var description = req.body.des;

  var link_image = imageToUri("./public/uploads/" + imageUpload);
  pathImageUpload = "";
  imageUpload = "";

  console.log("name: " + name);
  productModel
    .find({ id: id })
    .exec()
    .then((product) => {
      if (product.length < 1) {
        res.status(401).json({
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
router.get("/filter/sale/:condition", function (req, res, next) {
  console.log("get product by sale");
  var cond = 0;
  var condition = req.params.condition;
  console.log("condition: " + condition);
  if (condition === "asc") {
    cond = 1;
  } else if (condition === "desc") {
    cond = -1;
  }
  console.log("conditions: " + cond);
  productModel
    .find({ discount: { $gt: 0 } }, function (err, data) {
      res.json(data);
    })
    .sort({ discount: cond });
});

//get product filter price
router.get("/filter/price", function (req, res, next) {
  console.log("get product by price ");
  console.log("value1: " + req.query.value1);
  console.log("value2: " + req.query.value2);
  productModel.find(
    {
      $and: [
        { price: { $gte: +req.query.value1 } },
        { price: { $lte: +req.query.value2 } },
      ],
    },
    function (err, data) {
      res.json(data);
    }
  );
});

//insert review
router.patch("/:idProduct/review", multer().none(), function (req, res, next) {
  var username = req.body.username;
  var idProduct = req.params.idProduct;
  var rate = req.body.rate;
  var feedback = req.body.feedback;
  console.log("username: " + username);
  console.log("feedback: " + feedback);
  console.log("rate: " + rate);
  console.log("idProduct: " + idProduct);
  productModel
    .find({ id: +idProduct, review: { $elemMatch: { username: username } } })
    .exec()
    .then((product) => {
      if (product.length >= 1) {
        console.log("username feedback");
        res.status(200).json({
          message: "username feedback at " + product[0].review[0].created_at,
        });
      } else {
        productModel
          .updateOne(
            { id: idProduct },
            {
              $push: {
                review: {
                  username: username,
                  rate: +rate,
                  feedback: feedback,
                  created_at: new Date().toLocaleDateString("en-US"),
                },
              },
            }
          )
          .exec()
          .then((result) => {
            result.message = "Review user created successfully";
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
//get image of product
router.get("/:id/image", function (req, res, next) {
  var id = req.params.id;
  productModel
    .find({ id: id })
    .exec()
    .then((product) => {
      if (product.length < 1) {
        res.status(200).json({ message: "Product not found" });
      } else {
        res.status(200).json({ image: product[0].link_image });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});
//Update sold product.stock - so luong da ban
router.patch("/stock", multer().none(), function (req, res, next) {
  var listProduct = req.body.products.split(",");
  var sizeProduct = req.body.listSize.split(",");
  var quantityList = req.body.quantityList.split(",");
  console.log("patch update sold");
  for (var i = 0; i < listProduct.length; i++) {
    productModel
      .find({ id: listProduct[i] })
      .exec()
      .then((product) => {
        if (product.length < 1) {
          res.status(401).json({
            message: "Product not found",
          });
        } else {
          if (sizeProduct[i] === "S") {
            product.stock[0].available -= quantityList[i];
            product.stock[0].sold += quantityList[i];
          } else if (sizeProduct[i] === "M") {
            product.stock[1].available -= quantityList[i];
            product.stock[1].sold += quantityList[i];
          } else {
            product.stock[2].available -= quantityList[i];
            product.stock[2].sold += quantityList[i];
          }
          productModel
            .updateOne(
              { id: listProduct[i] },
              {
                $set: product,
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
  }
});
router.get(
  "/:id/available",
  multer().none(),
  function (req, res, next) {
    var id = req.params.id;
    var size = req.body.size;
    var quantity = req.body.quantity;

    console.log("available");
    console.log("id: " + id);
    console.log("size: " + size);
    console.log("quantity: " + quantity);
    productModel
      .find({
        id: +id,
        stock: {
          $elemMatch: { size: "" + size, available: { $gte: +quantity } },
        },
      })
      .exec()
      .then((product) => {
        if (product.length < 1) {
          res.status(401).json({
            message: "Out of stock",
          });
        } else {
          res.status(200).json({
            available: true,
            size: size,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ error: err });
      });
  } //end get available
);

module.exports = router;
