var express = require("express");
var router = express.Router();
var fs = require("fs");
var userModel = require("../models/users");
var productModel = require("../models/products");
var multer = require("multer");
// var fs = require('fs');
//
var imageToUri = require("image-to-uri");

var imageUpload = "";
var pathImageUpload = "";
// // function to encode file data to base64 encoded string
// function base64_encode(file) {
//   // read binary data
//   var bitmap = fs.readFileSync(file);
//   // convert binary data to base64 encoded string
//   return new Buffer(bitmap).toString('base64');
// }
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

var fileFilter = (req, file, cb) => {
  // reject a filer
  // if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
  //   cb(null, true);
  // } else {
  //   cb(null, false);
  // }
  cb(null, true);
};

//var upload = multer({ storage: storage });

/* GET users listing. */

router.get("/", function (req, res, next) {
  userModel.find({}, function (err, data) {
    res.json(data);
  });
});
//get user by id
router.get("/:id", function (req, res, next) {
  var id = req.params.id;
  console.log("get user by id " + id);
  userModel.find({ id: id }, function (err, data) {
    res.json(data);
  });
});
//get image by id

//get user by username
router.get("/account/:username", function (req, res, next) {
  var username = req.params.username;
  console.log("get user by username " + username);
  userModel.find({ "account.username": username }, function (err, data) {
    res.json(data);
  });
});
//delete user
router.delete("/:id", (req, res, next) => {
  console.log("Delete: " + req.params.id);
  userModel
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

//update user
router.patch("/:id", upload.single("linkAvt"), (req, res, next) => {
  var id = req.params.id;


  if (imageUpload !== "") {
    req.body.linkAvt = imageToUri("./public/uploads/" + imageUpload);
    pathImageUpload = "";
  }
  userModel
    .updateOne({ id: id }, { $set: req.body })
    .exec()
    .then((result) => {
      result.message = "succeeded";
      res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        result: "failed",
        error: err,
      });
    });
});
//change password
router.patch("/:id/account", multer().none(), (req, res, next) => {
  var password = req.body.p;
  var npassword = req.body.np;
  var renPassword = req.body.rnp;
  userModel
    .find({ id: req.params.id })
    .exec()
    .then((result) => {
      if (result[0].account.password !== password) {
        res.status(200).json({
          message: "password not matched",
        });
      } else if (npassword !== renPassword) {
        res.status(200).json({
          message: "rePassword not matched",
        });
      } else {
        userModel
          .updateOne(
            { id: req.params.id },
            {
              $set: {
                "account.password": npassword,
                "account.created_at": new Date().toLocaleDateString("en-US"),
              },
            }
          )
          .exec()
          .then((result) => {
            result.message = "Password updated successfully";
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
        result: "failed",
        error: err,
      });
    });
});
//insert item cart
router.patch("/:idUser/cart", multer().none(), function (req, res, next) {
  var idUser = req.params.idUser;
  userModel
    .find({ id: idUser })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "User not found",
        });
      } else {
        var idProduct = req.body.idProduct;
        var quantity = req.body.quantity;
        var size = req.body.size;
        console.log("idProduct: " + idProduct);
        console.log("quantity: " + quantity);
        console.log("size: " + size);
        var exists;
        productModel
          .find({
            id: +idProduct,
            stock: {
              $elemMatch: { size: size + "", available: { $gte: +quantity } },
            },
          })
          .exec()
          .then((product) => {
            console.log(JSON.stringify(product));
            for (var i = 0; i < user[0].cart.length; i++) {
              if (
                user[0].cart[i].id == idProduct &&
                user[0].cart[i].size == size
              ) {
                exists = i;
              }
            }
            if (exists !== undefined) {
              user[0].cart[exists].quantity =
                +user[0].cart[exists].quantity + +quantity;
            } else {
              user[0].cart.push({
                id: +idProduct,
                size: size,
                quantity: +quantity,
                name: product[0].name,
                image: product[0].link_image,
                price: product[0].price,
                sale: product[0].sale,
              });
            }
            userModel
              .updateOne(
                { id: idUser },
                {
                  $set: {
                    cart: user[0].cart,
                  },
                }
              )
              .exec()
              .then((result) => {
                result.message = "Cart updated successfully";
                res.status(200).json(result);
              })
              .catch((err) => {
                console.log(err);
                res.status(500).json({
                  error: err,
                });
              });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({ error: err });
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
//Delete item Cart by index array
router.delete("/:idUser/cart/:index", function (req, res, next) {
  var idUser = req.params.idUser;
  userModel
    .find({ id: idUser })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "User not found",
        });
      } else {
        console.log(user[0].cart);
        user[0].cart.splice(req.params.index, 1);
        userModel
          .updateOne(
            { id: idUser },
            {
              $set: {
                cart: user[0].cart,
              },
            }
          )
          .exec()
          .then((result) => {
            result.message = "Delete item cart successfully";
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
//DeleteAll item on Cart
router.delete("/:idUser/cart", function (req, res, next) {
  var idUser = req.params.idUser;
  userModel
    .find({ id: idUser })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "User not found",
        });
      } else {
        userModel
          .updateOne(
            { id: idUser },
            {
              $set: {
                cart: [],
              },
            }
          )
          .exec()
          .then((result) => {
            result.message = "DeleteAll Item On Cart successfully";
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
//Update quantity on cart
router.patch("/:idUser/cart/:index", function (req, res, next) {
  var idUser = req.params.idUser;
  userModel
    .find({ id: idUser })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "User not found",
        });
      } else {
        console.log(user[0].cart);
        user[0].cart[req.params.index].quantity = +req.query.quantity;
        userModel
          .updateOne(
            { id: idUser },
            {
              $set: {
                cart: user[0].cart,
              },
            }
          )
          .exec()
          .then((result) => {
            result.message = "Update quantity on item cart successfully";
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
//insert item wishlist
router.patch("/:idUser/wishlist", function (req, res, next) {
  var idUser = req.params.idUser;
  userModel
    .find({ id: idUser })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "User not found",
        });
      } else {
        var idProduct = req.query.idProduct;
        if (!user[0].wishlist.indexOf(idProduct) === true) {
          res.status(200).json({ message: "Product exists on wishlist" });
        } else {
          productModel
            .find({ id: idProduct })
            .exec()
            .then((product) => {
              userModel
                .updateOne(
                  { id: idUser },
                  {
                    $push: {
                      wishlist: product[0],
                    },
                  }
                )
                .exec()
                .then((result) => {
                  result.message = "Wishlist updated successfully";
                  res.status(200).json(result);
                })
                .catch((err) => {
                  console.log(err);
                  res.status(500).json({
                    error: err,
                  });
                });
            })
            .catch((err) => {
              console.log(err);
              res.status(500).json({
                error: err,
              });
            });
        }
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});
//Delete item wishlist by index array
router.delete("/:idUser/wishlist/:index", function (req, res, next) {
  var idUser = req.params.idUser;
  userModel
    .find({ id: idUser })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "User not found",
        });
      } else {
        console.log(user[0].wishlist);
        user[0].wishlist.splice(req.params.index, 1);
        userModel
          .updateOne(
            { id: idUser },
            {
              $set: {
                wishlist: user[0].wishlist,
              },
            }
          )
          .exec()
          .then((result) => {
            result.message = "Delete item wishlist successfully";
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
//update id ordered
router.patch("/:idUser/ordered", multer().none(), function (req, res, next) {
  var idUser = req.body.idUser;
  console.log("idUser: " + idUser);
  userModel
    .find({ id: idUser })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "User not found",
        });
      } else {
        var idOrdered = req.body.io;
        console.log("idOrdered: " + idOrdered);
        if (!user[0].ordered.indexOf(idOrdered) === true) {
          res.status(200).json({ message: "Ordered exists" });
        } else {
          user[0].ordered.push(idOrdered);
          userModel
            .updateOne(
              { id: idUser },
              {
                $set: {
                  ordered: user[0].ordered,
                },
              }
            )
            .exec()
            .then((result) => {
              result.message = "Ordered updated successfully";
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
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

//get image of users
router.get("/:id/image", function (req, res, next) {
  var id = req.params.id;
  userModel
    .find({ id: id })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        res.status(200).json({ message: "User not found" });
      } else {
        res.status(200).json({ image: user[0].linkAvt });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});
//get cart by id user
router.get("/:id/cart", function (req, res, next) {
  var id = req.params.id;
  console.log("get cart by iduser " + id);
  userModel
    .find(
      { id: id },
      {
        cart: 1,
      }
    )
    .exec()
    .then((result) => {
      result.idUser = id;
      res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});
/* GET product in cart listing. */
// router.get("/:id/cart", function (req, res, next) {
//   console.log("get cart by id user");
//   var id = req.params.id;
//   userModel
//     .find({ id: id })
//     .exec()
//     .then((user) => {
//       if (user.length < 1) {
//         return res.status(401).json({
//           message: "User not found",
//         });
//       } else {
//        // console.log("cart: " +  JSON.stringify(user[0].cart[0]));

//         res.status(200).json(user[0].cart);
//       }
//     })
//     .catch((err) => {
//       console.log(err);
//       res.status(500).json({
//         error: err,
//       });
//     });
// });
module.exports = router;
