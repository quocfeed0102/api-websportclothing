var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
var fs = require("fs");
var productModel = require("../models/products");
var imageUpload = ""; //luu tru image dang upload tam thoi.

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
  var link_image = imageUpload;
  imageUpload = "";

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
  var link_image = imageUpload;
  imageUpload = "";
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

//insert review
router.patch(
  "/:idProduct/review?idUser&rate&feedback",
  function (req, res, next) {
    var idUser = req.params.idUser;
    var idProduct = req.params.idProduct;
    var rate = req.params.rate;
    var feedback = req.params.feedback;
    productModel
      .find({ id: idProduct })
      .exec()
      .then((product) => {
        if (product.length < 1) {
          return res.status(401).json({
            message: "Product not found",
          });
        } else {
          for (i = 0; i < product[0].review.length; i++) {
            if (product[0].review[i].id_user == idUser) {
              return res.status(401).json({
                message: "User feedback EXISTS",
              });
            } else {
              productModel
                .updateOne(
                  { id: idProduct },
                  {
                    $set: {
                      review: product[0].review.push({
                        id_user: idUser,
                        rate: rate,
                        feedback: feedback,
                        created_at: new Date().toLocaleDateString("en-US"),
                      }),
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
          }
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: err,
        });
      });
  }
);
//get image of product
router.get("/:id/image", function (req, res, next) {
  var id = req.params.id;
  console.log("get IMAGE of product by id " + id);
  productModel.find({ id: id }, function (err, data) {
    console.log(data[0].link_image);
    let imageName = "./public/uploads/" + data[0].link_image;
    fs.readFile(imageName, (err, imageData) => {
      if (err) {
        res.json({ result: "failed", error: err });
      }
      res.writeHead(200, { "content-type": "image/jpeg" });
      res.end(imageData);
    });
  });
});
module.exports = router;
