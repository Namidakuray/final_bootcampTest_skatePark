const { Router } = require("express");
const router = Router();
const PoolSingleton = require("../database/poolDB");
let pool = PoolSingleton.getInstance();
const skaterCtl = require("../database/skaterCtl");
const tools = require('../middleware/tools');


router.post("/signup", async (req, res) => {
  let { img } = req.files;
  let newSkater = req.body;
  if (!newSkater){
    return res.status(500).json({ ok: false, message: "No se ha proporcionado la información necesaria." });
  }else{
    try {
      let hash = tools.createHash(newSkater.password_01);
      let imgId= tools.creatUuid();
      let imgExt= img.mimetype.split("/")[1];
      if ((imgExt=="png" || imgExt=="jpeg")!=true){
        throw `Tipo de archivo no admitido`;
      };
      let imgTag=`${imgId}.${imgExt}`;
      let resp=await skaterCtl.insertSkater(pool,newSkater.email,newSkater.fname,newSkater.lname,hash,newSkater.experience,newSkater.speciality,0,imgTag,false);  
      if (resp.status!=true){
        let a=resp.data.split("\n")[0];
        throw a;
      }else{
          await img.mv(`${__dirname}/../public/img/${imgTag}`, (err)=>{
            if (err) {
              return res.status(500).json({ ok: false, err });
          }
            console.log("Img cargada exitosamente.");
          });
      };
      res.status(301).redirect("/");
    } catch (error) {
      res.status(500).json({ message: "No se ha podido concretar el registro", data: error});
    };
  }
});
router.get("/editAccount/skater/:id", async (req, res) => {
  let {id} = req.params;
  let resp = await skaterCtl.getSkater(pool,id);
  console.log(resp);
  res.render("Datos", {resp, skater: true, registered: true});
});

router.put("/editAccount/skater/:id", async (req, res)=>{
  let {id} = req.params;
  let body = req.body;
  let resp = await skaterCtl.getSkater(pool,id);
  console.log(body);
  console.log(id)
  //let matchPass= await tools.compareHash(body.password, resp.password)
  //console.log(matchPass);
})

module.exports = router;
