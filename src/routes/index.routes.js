const { Router } = require('express');
const router = Router();
const PoolSingleton = require("../database/poolDB");
let pool = PoolSingleton.getInstance();
const skaterCtl = require("../database/skaterCtl");
const tools = require('../middleware/tools')

let authorise;
router.use("/", async (req, res,next) => {
  let {token} = req.query;
  let skaters = await skaterCtl.getSkaters(pool);
  if(!token){
    authorise={skaters}
    next()
  }else{
    let user = await tools.verifyToken(res,token)
    let skater=user;
    let intranet=user;
    let admin=user;
    switch (user.role){
      case 1:
        authorise={skaters,skater,token}
        break;
      case 2:
        switch (user.userRole){
          case "worker":
            authorise={skaters,intranet,token}
            break;
          case "admin":
            authorise={skaters,admin,token}
            break;
        };
      default:
        authorise={skaters}
        break;
    };
    next();
  };
});
router.get("/",(req,res)=>{
  res.render("Index", authorise);
})
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
