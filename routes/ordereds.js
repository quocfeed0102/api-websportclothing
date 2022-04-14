var express = require("express");
var router = express.Router();
var orderedModel = require("../models/ordereds");
router.get("/", function (req, res, next) {
  res.status(200).json({ message: "ordereds" });
});


module.exports = router;