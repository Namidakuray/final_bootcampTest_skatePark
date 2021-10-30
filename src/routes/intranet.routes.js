const { Router } = require("express");
const router = Router();
const PoolSingleton = require("../database/poolDB");
let pool = PoolSingleton.getInstance();
const ddbbCtl = require("../database/ddbbCtl");

router.get("/intranet/admin", (req, res) => {
	res.render("Admin");
});
router.get("/admin/createTables", async (req, res) => {
	await ddbbCtl.createTables(pool);
});
router.get("/admin/deleteTables", async (req, res) => {
	await ddbbCtl.deleteTables(pool);
});
router.get("/intranet", (req, res) => {
	res.render("Intranet");
});

module.exports = router;
