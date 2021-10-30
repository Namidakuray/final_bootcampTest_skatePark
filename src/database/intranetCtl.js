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
		text: `DELETE FROM usuario WHERE id = $1 RETURNING *`,
		values: [id],
	};
	let queryCascade_01 = {
		rowMode: "array",
		text: `DELETE FROM transferencia WHERE emisor = $1 RETURNING *`,
		values: [id],
	};
	let queryCascade_02 = {
		rowMode: "array",
		text: `DELETE FROM transferencia WHERE receptor = $1 RETURNING *`,
		values: [id],
	};
	try {
		let client = await pool.connect();
		try {
			await client.query("BEGIN");
			await client.query(queryCascade_01);
			await client.query(queryCascade_02);
			const res = await client.query(queryStatement);
			await client.query("COMMIT");

			client.release();
			if (res.rows[0]) {
				console.log(
					"el registro del cliente id: " +
						res.rows[0][0] +
						", de saldo: " +
						res.rows[0][1] +
						" ha sido eliminado con éxito"
				);
			} else {
				console.log("el cliente no existe");
			}
		} catch (error) {
			console.log("error al intentar eliminar la cuenta skater ", error.stack);
		}
	} catch (error) {
		console.log("error al conectar con la DDBB, error : ", error);
	}
};

/* (2.) Usar transacciones SQL para realizar el registro de las transferencia. */
const newTransaction = async (pool, accountIn, accountOut, mount) => {
	let queryStatement_Trans = {
		rowMode: "array",
		text: "INSERT INTO transferencia(emisor, receptor, monto) VALUES ($1, $2, $3) RETURNING *",
		values: [accountOut, accountIn, mount],
	};
	let queryStatement_AccIn = {
		rowMode: "array",
		text: "UPDATE usuario SET balance = balance + $1 where id = $2",
		values: [mount, accountIn],
	};
	let queryStatement_AccOut = {
		rowMode: "array",
		text: "UPDATE usuario SET balance = balance - $1 where id = $2",
		values: [mount, accountOut],
	};

	try {
		let client = await pool.connect();
		try {
			await client.query("BEGIN");

			let resTrans = await client.query(queryStatement_Trans);
			let arrTrans = resTrans.rows[0];
			await client.query(queryStatement_AccIn);
			await client.query(queryStatement_AccOut);
			await client.query("COMMIT");
			client.release();
			console.log(
				"Transacción procesada correctamente, información de transacción:"
			);
			console.log(arrTrans);
			return arrTrans;
		} catch (error) {
			await client.query("ROLLBACK");
			client.release();
			console.log("error al intentar generar la transacción, ", error);
		}
	} catch (error) {
		console.log("error al conectar con la DDBB, error : ", error);
	}
};
const getTransaction = async (pool) => {
	let queryAcc = { name: "get-balance" };
	let queryStatement = {
		rowMode: "array",
		name: "get-trans",
		text: "select id, emisor, receptor, monto, fecha from transferencia ORDER BY id;",
	};
	try {
		let client = await pool.connect();
		try {
			let res = await client.query(queryAcc);
			let accList = res.rows;
			const resTrans = await client.query(queryStatement);
			let arrTrans = resTrans.rows;
			accList.forEach((e) => {
				for (i = 0; i < arrTrans.length; i++) {
					if (e.id == arrTrans[i][1]) {
						try {
							arrTrans[i][1] = e.nombre;
						} catch (error) {
							console.log("if01 error: ", error);
						}
					} else if (e.id == arrTrans[i][2]) {
						try {
							arrTrans[i][2] = e.nombre;
						} catch (error) {
							console.log("if02 error: ", error);
						}
					}
				}
			});
			console.log("dbCtl.getTransaction result: ", arrTrans);
			if (arrTrans.length > 0) {
				return arrTrans;
			}
		} catch (error) {
			console.log("dbCtl.getTransaction error: ", error.stack);
		} finally {
			client.release();
		}
	} catch (error) {
		console.log("error al conectar con la DDBB, error : ", error);
	}
};

module.exports = {
	newTransaction,
	getTransaction,
	insertSkater,
	editSkater,
	getSkaters,
	deleteAcc,
};
