const { Router } = require("express");
const router = Router();
const PoolSingleton = require("../database/poolDB");
let pool = PoolSingleton.getInstance();
const ddbbCtl = require("../database/ddbbCtl");

router.get("/intranet/admin", (req, res) => {
	res.render("Admin");
});
router.get("/admin/createTables", async (req, res) => {
	let resp=await ddbbCtl.createTables(pool);
	if(resp==true){
		res.status(200).send(resp);
	}else{res.status(500).send(resp)}
});
router.get("/admin/deleteTables", async (req, res) => {
	let resp=await ddbbCtl.deleteTables(pool);
	if(resp==true){
		res.status(200).send(resp);
	}else{res.status(500).send(resp)}
});
router.get("/admin/insertSkater", async (req, res) => {
	let resp=await ddbbCtl.insertSkater(pool);
	if(resp.status==true){
		res.status(201).send(resp);
	}else{res.status(500).send(resp)}
});
router.get("/intranet", (req, res) => {
	res.render("Intranet");
});

module.exports = router;
