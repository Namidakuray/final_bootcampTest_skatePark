const { Router } = require("express");
const router = Router();
const PoolSingleton = require("../database/poolDB");
let pool = PoolSingleton.getInstance();
const skaterCtl = require("../database/skaterCtl");

router.post("/signup", async (req, res) => {
  let { img } = req.files;
  let newSkater = req.body;
  await img.mv(`${__dirname}/../public/img/${img.name}`, (err)=>{
    if (err) {
      return res.status(500).json({ ok: false, err });
  }
    console.log("Img cargado exitosamente.")
  })
  res.end();
});

router.post("/newSkater", async (req, res) => {
  let bd = req.body;
  //await skaterCtl.insertSkater(pool,bd.email,bd.nombre,bd.apellido)
  console.log(bd);
  res.redirect("/");
});

module.exports = router;
