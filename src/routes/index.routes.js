const { Router } = require('express');
const router = Router();
const PoolSingleton = require("../database/poolDB");
let pool = PoolSingleton.getInstance();
const skaterCtl = require("../database/skaterCtl");

router.get("/", async (req, res) => {
  let skaters = await skaterCtl.getSkaters(pool);
  let role = 1;
  let registered = true;
  let authorise;
  switch (role){
    case 1:
      authorise={skaters,skater: true, registered}
      break;
    case 2:
      authorise={skaters,skater: false, registered}
      break;
  }
    res.render("Index", authorise);
  });
router.get("/signup", (req, res) => {
    res.render("Registro");
  });
router.get("/login", (req, res) => {
  res.render("Login");
});

router.get("/intranet", (req, res) => {
  res.render("Login");
});
module.exports= router;
