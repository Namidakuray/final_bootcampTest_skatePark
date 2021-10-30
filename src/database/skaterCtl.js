require("dotenv").config();
const tools = require('../middleware/tools');
/* Se capturan los posibles errores que puedan ocurrir a través de bloques catch o
parámetros de funciones callbacks para condicionar las funciones del servidor. */

/* Consultas DML para la
gestión y persistencia de datos. */

// GET /skaters
const getSkaters = async (pool) => {
	let queryStatement = {
		name: "get-skaters",
		text: "select email, nombre, apellido, password, anos_experiencia, especialidad, puntaje, foto, estado, from skater ORDER BY id;",
	};
	try {
		let client = await pool.connect();
		try {
			const res = await client.query(queryStatement);
			return res.rows;
		} catch (error) {
			console.log("dbCtl.getSkaters error: ", error.stack);
		} finally {
			client.release();
		}
	} catch (error) {
		console.log("error al conectar con la DDBB, error : ", error);
	}
};
// POST /skater
const insertSkater = async (pool, email, nombre, apellido, password, anos_experiencia, especialidad, puntaje, foto, estado) => {
	let created_on = tools.getStringDate();
	let queryStatement = {
		text: "INSERT INTO skater (email, nombre, apellido, password, created_on, anos_experiencia, especialidad, puntaje, foto, estado) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
		values: [email, nombre, apellido, password, created_on, anos_experiencia, especialidad, puntaje, foto, estado],
	};
	try {
		let client = await pool.connect();
		try {
			const res = await client.query(queryStatement);
			client.release();
			console.log("Cuenta skater creada satisfactoriamente :", res.rows[0]);
		} catch (error) {
			console.log("error: ", error.stack);
		}
	} catch (error) {
		console.log("error al conectar con la DDBB, error : ", error);
	}
};
// PUT /skater
const editSkater = async (pool, id, email, nombre, apellido, password, anos_experiencia, especialidad, puntaje, foto, estado) => {
	let queryStatement = {
		text: "UPDATE skater SET email=$2, nombre=$3, apellido=$4, password=$5, anos_experiencia=$6, especialidad=$7, puntaje=$8, foto=$9, estado=$10 WHERE id = $1 RETURNING *;",
		values: [id, email, nombre, apellido, password, anos_experiencia, especialidad, puntaje, foto, estado],
	};
	try {
		let client = await pool.connect();
		try {
			const res = await client.query(queryStatement);
			client.release();
			console.log("Cuenta skater editada satisfactoriamente :", res.rows[0]);
		} catch (error) {
			console.log("error: ", error.stack);
		}
	} catch (error) {
		console.log("error al conectar con la DDBB, error : ", error);
	}
};
// DELETE /skater
const deleteAcc = async (pool, id) => {
	let queryStatement = {
		rowMode: "array",
		text: `DELETE FROM skater WHERE id = $1 RETURNING *`,
		values: [id],
	};
	try {
		let client = await pool.connect();
		try {
			const res = await client.query(queryStatement);
			client.release();
			if (res.rows[0]) {
				console.log(res.rows[0]);
			} else {
				console.log("el skater no existe");
			}
		} catch (error) {
			console.log("error al intentar eliminar la cuenta skater ", error.stack);
		}
	} catch (error) {
		console.log("error al conectar con la DDBB, error : ", error);
	}
};

module.exports = {
	getSkaters,
	insertSkater,
	editSkater,
	deleteAcc
};
