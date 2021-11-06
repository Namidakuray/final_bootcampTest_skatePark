const { Router } = require("express");
const router = Router();
const PoolSingleton = require("../database/poolDB");
let pool = PoolSingleton.getInstance();
const skaterCtl = require("../database/skaterCtl");
const tools = require('../middleware/tools');


router.use("/signup/skater", async (req, res, next) => {
  let { img } = req.files;
  let newSkater = req.body;
  if (!newSkater){
    res.status(500).json({ ok: false, message: "No se ha proporcionado la información necesaria." });
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
      req.body.password=req.body.password_01;
      let user={
        id:resp.dbResponse.id,
        email:resp.dbResponse.email,
        password:resp.dbResponse.password,
      };
      //console.log("RouteUser: ",user)
      let acces = await tools.createTokenAcces(req,res,user,"skater")
      if(acces){next()
      }else{res.status(401).render("Info",{dataError:{
        error: "401 Unauthorized",
        message:"Lo sentimos, ha ocurrido un error."}}
        )}
    } catch (error) {
      res.status(500).render("Info",{dataError:{
        error: "401 Unauthorized",
        message:"No se ha podido concretar el registro.",
        default_error: error,
        }}
      );
    };
  }
});
router.post("/signup/skater", async (req, res) => {
  let token=req.token;
  console.log("Route.req: ",token)
  res.status(301).redirect(`/?token=${token}`);
})

router.use("/login/skater",async(req,res,next)=>{
  let {email}=req.body;
  try {
    let resp = await skaterCtl.getSkater(pool,email,"email");
    if (resp.error){res.render("info",{dataError:resp})};
    let acces= await tools.createTokenAcces(req,res,resp,"skater");
    if(acces){next()
    }else{res.status(500).render("Info",{dataError:{
      error: "401 Unauthorized",
      message:"Lo sentimos, ha ocurrido un error."}}
      )
    }
  } catch (error) {
    console.log(error)
  }
})
router.post("/login/skater",async(req, res)=>{
  let token = req.token;
  res.redirect(`/?token=${token}`);
})

router.get("/editAccount/skater/:id/:token", async (req, res) => {
  let {id,token} = req.params;
  //console.log(token)
  let response = await tools.verifyToken(res,token)
  if(response){
    let resp = await skaterCtl.getSkater(pool,id);
    let skater = resp;
    res.render("Datos", {skater, token, id:id});
  }else{res.status(401).render("Info",{dataError:{
    error: "401 Unauthorized",
    message: "No ha sido posible verificar su token, ingrese nuevamente.",
  }})}
});

router.put("/editAccount/skater/:id", async (req, res)=>{
  let {id} = req.params;
  let body = req.body;
  let token = body.token;
  let dataResponse;
  let response = await tools.verifyToken(res,token)
  if(response){
  try {
    let getResp = await skaterCtl.getSkater(pool,id);
    if(!body.pass_probe){
      let {fname,lname,last_password,experience,speciality} = body;
      let putResp = await skaterCtl.editSkater(pool,id,fname,lname,last_password,Number(experience),speciality,getResp.puntaje,getResp.foto,getResp.estado)
      if (putResp.status){ dataResponse={
        title: `Estimado ${fname}`,
        message: putResp.message,
      };
      }else{throw putResp};
    }else{
      let {fname,lname,pass_probe,password_01,experience,speciality} = body;
      let matchPass= await tools.compareHash(pass_probe, getResp.password)
      if(matchPass){
        let newHash = tools.createHash(password_01)
        let putResp = await skaterCtl.editSkater(pool,id,fname,lname,newHash,Number(experience),speciality,getResp.puntaje,getResp.foto,getResp.estado)
        if (putResp.status){ dataResponse={
          title: `Estimado ${fname}`,
          message: putResp.message,
        };
        }else{throw putResp};
      }else{res.status(401).render("Info",{dataError:{
        error: "401 Unauthorized",
        message: "La password ingresada no coincide con nuestros registros.",
      }})}
    };
  } catch (error) {
    res.status(500).render("Info",{dataError:{
      error: "500 Internal server error",
      message: "Ah ocurrido un problema al intentar actualizar la información.",
      default_error: error,
    }})};
    res.status(200).json(dataResponse);
  };
})

router.delete("/delete/skater/:id", async (req,res)=>{
  let {id} = req.params;
  let {token,dbPass,pass_probe} = req.body.source;
  let img=[];
  let response = await tools.verifyToken(res,token);
  if(response){
  let matchPass= await tools.compareHash(pass_probe, dbPass)
  try {
    if(matchPass){
      let response=await skaterCtl.deleteAcc(pool,id);
      if(response.dbResponse[9]){
        img.push(response.dbResponse[9])
        tools.arrfilesDelete(img)
      };
      res.status(200).send(response);
    }else{
      res.json({dataError:{
        error: "401 Unauthorized",
        message: "La password ingresada no coincide con nuestros registros.",
      }});
    };
  } catch (error) {
    res.status(500).json({dataError:{
      error: "500 Internal server error",
      message: "Ah ocurrido un problema al intentar eliminar la cuenta.",
      default_error: error,
    }});
  }
}})

module.exports = router;
