const { Router } = require("express");
const router = Router();
const PoolSingleton = require("../database/poolDB");
let pool = PoolSingleton.getInstance();
const skaterCtl = require("../database/skaterCtl");

router.post("/signup", (req, res) => {
  let body = req.body;
  console.log(body)
});

module.exports = router;
