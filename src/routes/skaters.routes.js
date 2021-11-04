const { Router } = require("express");
const router = Router();
const PoolSingleton = require("../database/poolDB");
let pool = PoolSingleton.getInstance();
const skaterCtl = require("../database/skaterCtl");
const tools = require('../middleware/tools');


router.post("/signup/skater", async (req, res) => {
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
      res.status(301).redirect("/?type=skater");
    } catch (error) {
      res.status(500).json({ message: "No se ha podido concretar el registro", data: error});
    };
  }
});
router.use("/login/skater",async(req,res,next)=>{
  let {email}=req.body;
  let resp = await skaterCtl.getSkater(pool,email,"email");
  tools.createTokenAcces(req,res,next,resp,"skater");
})
router.post("/login/skater",async(req, res)=>{
  let token = req.token;
  res.redirect(`/?token=${token}`);
})
router.get("/editAccount/skater/:id/:token", async (req, res) => {
  let {id,token} = req.params;
  //console.log(token)
  let response = await tools.verifyToken(res,token)
  console.log(response)
  if(response){
    let resp = await skaterCtl.getSkater(pool,id);
    let skater = resp;
    res.render("Datos", {skater, token, id:id});
  }else{res.redirect("/loging")}
});
router.put("/editAccount/skater/:id", async (req, res)=>{
  let {id} = req.params;
  let body = req.body;
  try {
    let getResp = await skaterCtl.getSkater(pool,id);
    if(!body.pass_probe){
      let {email,fname,lname,last_password,experience,speciality} = body;
      let putResp = await skaterCtl.editSkater(pool,id,email,fname,lname,last_password,Number(experience),speciality,getResp.puntaje,getResp.foto,getResp.estado)
      if (putResp.status){res.status(200).json(putResp);
      }else{throw putResp};
    }else{
      let {email,fname,lname,pass_probe,password_01,experience,speciality} = body;
      let matchPass= await tools.compareHash(pass_probe, getResp.password)
      if(matchPass){
        let newHash = tools.createHash(password_01)
        let putResp = await skaterCtl.editSkater(pool,id,email,fname,lname,newHash,Number(experience),speciality,getResp.puntaje,getResp.foto,getResp.estado)
        if (putResp.status){res.status(200).json(putResp);
        }else{throw putResp};
      }else{res.json({message:"La password ingresada no coincide con nuestros registros."})}
    };
  } catch (error) {
    console.log(error)
    res.status(500).json(error);
  }
})
router.delete("/delete/skater/", async (req,res)=>{
  let {accId,dbPass,pass_probe} = req.body.source;
  let matchPass= await tools.compareHash(pass_probe, dbPass)
  try {
    if(matchPass){
      let response=await skaterCtl.deleteAcc(pool,accId);
      res.json(response);
    }else{
      res.json({message:"La password ingresada no coincide con nuestros registros."});
    };
  } catch (error) {
    res.status(500).json(error);
  }
})
module.exports = router;
