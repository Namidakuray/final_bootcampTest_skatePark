const cp = require("child_process");
require("dotenv").config();

/* (4.) Capturar los posibles errores que puedan ocurrir a través de bloques catch o
parámetros de funciones callbacks para condicionar las funciones del servidor. */


/* Creación de las tablas a utilizar */
const initBank = async (pool) => {
	try {
		let client = await pool.connect();
		try {
			let queryTester_01 = {text: `SELECT * FROM usuario`};
			let queryTester_02 = {text: `SELECT * FROM transferencia`};
			try {
				await client.query(queryTester_01);
				console.log("Ya existe la tabla usuario")
			} catch (error) {
				const userTable = `CREATE TABLE usuario (id SERIAL PRIMARY KEY, nombre VARCHAR(50),balance FLOAT CHECK (balance >= 0))`;
				await client.query(userTable);
				console.log("tabla usuario creada con exito")
			}
			try {
				await client.query(queryTester_02);
				console.log("Ya existe la tabla transferencia")
			} catch (error) {
				const transactionTable = `CREATE TABLE transferencia (id SERIAL PRIMARY KEY, emisor INT, receptor INT, monto FLOAT, fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (emisor) REFERENCES usuario(id), FOREIGN KEY (receptor) REFERENCES usuario(id))`;
				await client.query(transactionTable);
				console.log("tabla transferencia creada con exito")
			}
			console.log("DDBB lista para ser utilizada")
				} catch (error) {
			console.log("error al crear las tablas, error : ", error);
		}
	} catch (error) {
		console.log("error al conectar con la DDBB, error : ", error);
	}
};
const deleteTables = async (pool) => {
	try {
		let client = await pool.connect();
		try {
			await client.query("BEGIN");
			await client.query(`DROP TABLE transferencia`);
			await client.query(`DROP TABLE usuario`);
			await client.query("COMMIT");
			client.release();
			console.log("Tablas eliminadas con éxito.");
		} catch (error) {
			console.log("error al intentar eliminar la tablas ", error.code);
		}
	} catch (error) {
		console.log("error al conectar con la DDBB, error : ", error);
	}
};

/* (1.) Realizar consultas DML para la
gestión y persistencia de datos. */
const getAcc = async (pool) => {
	let queryStatement = {
		name: "get-balance",
		text: "select id, nombre, balance from usuario ORDER BY id;",
	};
	try {
		let client = await pool.connect();
		try {
			const res = await client.query(queryStatement);
			return res.rows;
		} catch (error) {
			console.log("dbCtl.getAcc error: ", error.stack);
		} finally {
			client.release();
		}
	} catch (error) {
		console.log("error al conectar con la DDBB, error : ", error);
	}
};
const insertAcc = async (pool, name, balance) => {
	let queryStatement = {
		rowMode: "array",
		text: "INSERT INTO usuario (nombre, balance) VALUES ($1, $2) RETURNING *",
		values: [name, balance],
	};
	try {
		let client = await pool.connect();
		try {
			const res = await client.query(queryStatement);
			client.release();
			console.log("Cuenta creada satisfactoriamente :", res.rows[0]);
		} catch (error) {
			console.log("error: ", error.stack);
		}
	} catch (error) {
		console.log("error al conectar con la DDBB, error : ", error);
	}
};
const editAcc = async (pool, name, balance, id) => {
	let queryStatement = {
		rowMode: "array",
		text: "UPDATE usuario SET nombre = $1, balance = $2 WHERE id = $3 RETURNING *;",
		values: [name, balance, id],
	};
	try {
		let client = await pool.connect();
		try {
			const res = await client.query(queryStatement);
			client.release();
			console.log("Cuenta editada satisfactoriamente :", res.rows[0]);
		} catch (error) {
			console.log("error: ", error.stack);
		}
	} catch (error) {
		console.log("error al conectar con la DDBB, error : ", error);
	}
};
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
			console.log("error al intentar eliminar la cuenta ", error.stack);
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
	let queryAcc = {name: "get-balance"};
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
	initBank,
	deleteTables,

	newTransaction,
	getTransaction,
	insertAcc,
	editAcc,
	getAcc,
	deleteAcc,
};
