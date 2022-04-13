var express = require("express");
var router = express.Router();

var userModel = require("../models/users");
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
router.patch("/:id", (req, res, next) => {
  var id = req.params.id;
  const updateOps = {};
  console.log(req.query);
  // for (let ops in req.query) {
  //   //updateOps[ops.propName] = ops.value;
  //   console.log(ops. + ": " + ops.value);
  // }
  console.log(updateOps);
  userModel
    .updateOne({ id: id }, { $set: req.query })
    .exec()
    .then((result) => {
      // res.status(200).json({
      //   message: "Product updated",
      //   request: {
      //     type: "GET",
      //     url: "http://localhost:3000/users/" + id,
      //   },
      // });
      res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});
//change password
router.patch("/:id/account", (req, res, next) => {
  userModel
    .updateOne(
      { id: req.params.id },
      {
        $set: {
          "account.password": req.query.p,
          "account.created_at": new Date().toLocaleDateString("en-US"),
        },
      }
    )
    .exec()
    .then((result) => {
      // res.status(200).json({
      //   message: "Product updated",
      //   request: {
      //     type: "GET",
      //     url: "http://localhost:3000/users/" + id,
      //   },
      // });
      result.message = "Password updated successfully";
      res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});
//insert item cart
router.patch("/:idUser/cart", function (req, res, next) {
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
        var quantity = req.query.quantity;
        var size = req.query.size;
        var exists;
        for (var i = 0; i < user[0].cart.length; i++) {
          if (user[0].cart[i].id == idProduct && user[0].cart[i].size == size) {
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
          user[0].wishlist.push(+req.query.idProduct);
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
              result.message = "Wishlist updated successfully";
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
module.exports = router;
