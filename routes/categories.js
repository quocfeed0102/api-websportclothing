var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
var fs = require("fs");
var categoryModel = require("../models/categories");
var imageUpload = ""; //luu tru image dang upload tam thoi.
var imageToUri = require("image-to-uri");
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
//const condition = [];

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

/* GET  listing. */
router.get("/", function (req, res, next) {
  console.log("get categories");
  categoryModel.find({}, function (err, data) {
    res.json(data);
  });
});
//get  by id
router.get("/:id", function (req, res, next) {
  var id = req.params.id;
  console.log("get category by id " + id);
  categoryModel.find({ id: id }, function (err, data) {
    res.json(data);
  });
});
//post new
router.post("/", upload.single("i"), (req, res, next) => {
  console.log("Post new category");
  var name = req.body.n;
  var image = imageToUri("./public/uploads/" + imageUpload);
  imageUpload = "";

  var id = random(1000000000, 9999999999);
  console.log("typeof " + typeof id);
  const category = new categoryModel({
    _id: new mongoose.Types.ObjectId(),
    id: id,
    name: name,
    image: image,
  });
  category
    .save()
    .then((result) => {
      res.status(201).json({
        result: result,
        status: "Category created",
        id_of_new: +id,
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
  categoryModel
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
//Update
router.patch("/:id", upload.single("i"), (req, res, next) => {
  var id = req.params.id;
  console.log("Put: " + id);
  var name = req.body.n;
  var link_image = imageToUri("./public/uploads/" + imageUpload);
  imageUpload = "";
  categoryModel
    .find({ id: id })
    .exec()
    .then((product) => {
      if (product.length < 1) {
         res.status(401).json({
          message: "Product not found",
        });
      } else {
        categoryModel
          .updateOne(
            { id: id },
            {
              $set: {
                name: name,
                image: link_image,
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
//get image of product
router.get("/:id/image", function (req, res, next) {
  var id = req.params.id;
  categoryModel
    .find({ id: id })
    .exec()
    .then((category) => {
      if (category.length < 1) {
        res.status(200).json({ message: "Category not found" });
      } else {
        res.status(200).json({ image: category[0].image });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});
module.exports = router;
