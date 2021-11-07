const { Router } = require("express");
const router = Router();
const PoolSingleton = require("../database/poolDB");
let pool = PoolSingleton.getInstance();
const tools = require("../middleware/tools");
const ddbbCtl = require("../database/ddbbCtl");
const intranetCtl = require("../database/intranetCtl");

//Init all
(function async() {
	ddbbCtl.createTables(pool);
})();

//Intranet
router.get("/intranet/admin/:token", async (req, res) => {
	let { token } = req.params;
	let response = await tools.verifyToken(res, token);
	//console.log("payload:", response);
	if (response.userRole == "administrador" && response.role == 2) {
		let resp = await intranetCtl.getColabs(pool);
		let admin = resp;
		//console.log(admin)
		res.render("Admin", { admin, token });
	} else {
		res.status(401).render("Info", {
			dataError: {
				error: "401 Unauthorized",
				message: "Está intentando de ingresar a un sítio restringido!",
			},
			token,
		});
	}
});
router.put("/intranet/changeState/:id/:state", async (req, res) => {
	let { id, state } = req.params;
	let { token } = req.body;
	let newState;
	let response = await tools.verifyToken(res, token);
	console.log("payload:", response);
	if (response.userRole == "administrador" && response.role == 2) {
		if (state == "true") {
			newState = false;
		} else {
			newState = true;
		}
		try {
			let response = await intranetCtl.changeState(pool, id, newState);
			//console.log("route.change DB:", response);
			res.send(response.message);
		} catch (error) {
			//console.log("route.change error: ", error);
			res.status(500).send(
				"Lo sentímos, ha ocurrido un error inesperado."
			);
		}
	} else {
		res.status(401).send({
			dataError: {
				error: "401 Unauthorized",
				message: "Está intentando de ingresar a un sítio restringido!",
			},
		});
	}
});
/* Rutas relacionadas a la lógica de automatización del administrador */
router.get("/admin/createTables", async (req, res) => {
	let resp = await ddbbCtl.createTables(pool);
	if (resp == true) {
		res.status(200).send(resp);
	} else {
		res.status(500).send(resp);
	}
});
router.get("/admin/deleteTables", async (req, res) => {
	let resp = await ddbbCtl.deleteTables(pool);
	if (resp == true) {
		res.status(200).send(resp);
	} else {
		res.status(500).send(resp);
	}
});
router.get("/admin/insertSkater", async (req, res) => {
	let resp = await ddbbCtl.insertSkater(pool);
	if (resp.status == true) {
		res.status(201).send(resp);
	} else {
		res.status(500).send(resp);
	}
});

// Intranet login route
router.use("/login/intranet", async (req, res, next) => {
	let { email } = req.body;
	try {
		let resp = await intranetCtl.getColab(pool, email, "email");
		//console.log("ddbb response: ", resp);
		if (resp.error) {
			res.render("info", { dataError: resp });
		}
		let acces = await tools.createTokenAcces(req, res, resp, "intranet");
		if (acces) {
			next();
		} else {
			res.status(500).render("Info", {
				dataError: {
					error: "401 Unauthorized",
					message: "Lo sentimos, ha ocurrido un error.",
				},
			});
		}
	} catch (error) {
		console.log(error);
	}
});
router.post("/login/intranet", async (req, res) => {
	let token = req.token;
	res.redirect(`/?token=${token}`);
});

router.get("/intranet/:token", async (req, res) => {
	let { token } = req.params;
	let response = await tools.verifyToken(res, token);
	let skaters = await intranetCtl.getSkaters(pool);
	if (response.userRole == "colaborador" && response.role == 2) {
		let intranet = response;
		let { estado } = await intranetCtl.getColab(pool, response.id, "id");
		res.status(200).render("Intranet", {
			skaters,
			intranet,
			token,
			estado,
		});
	} else if (response.userRole == "administrador" && response.role == 2) {
		let admin = response;
		res.status(200).render("Intranet", {
			skaters,
			admin,
			token,
			estado: true,
		});
	} else {
		res.status(401).render("Info", {
			dataError: {
				error: "401 Unauthorized",
				message: "Está intentando de ingresar a un sítio restringido!",
			},
			token,
		});
	}
});

router.delete("/intranet/deleteSkater/:id/:token", async (req, res) => {
	let { id, token } = req.params;
	let response = await tools.verifyToken(res, token);
	let img = [];
	if (response.userRole == "colaborador" && response.role == 2) {
		let dbResp = await intranetCtl.deleteSkater(pool, id);
		if (dbResp.dbResponse[9]) {
			img.push(dbResp.dbResponse[9]);
			tools.arrfilesDelete(img);
		}
		res.status(200).send(dbResp);
	} else if (response.userRole == "administrador" && response.role == 2) {
		let dbResp = await intranetCtl.deleteSkater(pool, id);
		if (dbResp.dbResponse[9]) {
			img.push(dbResp.dbResponse[9]);
			tools.arrfilesDelete(img);
		}
		res.status(200).send(dbResp);
	} else {
		res.status(401).send({
			dataError: {
				error: "401 Unauthorized",
				message: "Está intentando de ingresar a un sítio restringido!",
			},
		});
	}
});

/* {[(SE DEBE TERMINAR EL UPDATE)]} */
router.put("/intranet/updateSkater/", async (req, res) => {
	let { id, puntaje, estado, token } = req.body;
	let newState;
	if(estado){newState=true
	}else{newState=true}
	let response = await tools.verifyToken(res, token);
	if (response.userRole == "colaborador" && response.role == 2) {
		let dbResp = await intranetCtl.skaterScore(pool, id, puntaje, newState);
		res.status(200).send(dbResp);
	} else if (response.userRole == "administrador" && response.role == 2) {
		let dbResp = await intranetCtl.skaterScore(pool, id, puntaje, newState);
		res.status(200).send(dbResp);
	} else {
		res.status(401).send({
			dataError: {
				error: "401 Unauthorized",
				message: "Está intentando de ingresar a un sítio restringido!",
			},
		});
	}
});

module.exports = router;
