require("dotenv").config();
/* Se capturan los posibles errores que puedan ocurrir a través de bloques catch o
parámetros de funciones callbacks para condicionar las funciones del servidor. */

/* Creación de las tablas a utilizar */
const createTables = async (pool) => {
	try {
		let client = await pool.connect();
		//Tables's probes or creates them
		try {
			let queryTester_01 = { text: `SELECT * FROM skater` };
			let queryTester_02 = { text: `SELECT * FROM account` };
			let queryTester_03 = { text: `SELECT * FROM rol` };
			let queryTester_04 = { text: `SELECT * FROM account_rol` };
			//Skaters Table probe
			try {
				await client.query(queryTester_01);
				console.log("Ya existe la tabla skater");
			} catch (error) {
				const skaterTable = `CREATE TABLE skater (id SERIAL, email VARCHAR(50), nombre VARCHAR(25) NOT NULL, apellido VARCHAR(25) NOT NULL, password VARCHAR(25) NOT NULL, created_on TIMESTAMP NOT NULL, anos_experiencia INT NOT NULL, especialidad VARCHAR(50) NOT NULL, puntaje FLOAT, foto VARCHAR(255) NOT NULL, estado BOOLEAN NOT NULL, PRIMARY KEY (email))`;
				await client.query(skaterTable);
				console.log("tabla skater creada con exito");
			}
			//Intranet account probe
			try {
				await client.query(queryTester_02);
				console.log("Ya existe la tabla account");
			} catch (error) {
				const accountTable = `CREATE TABLE account (user_id serial PRIMARY KEY, username VARCHAR ( 50 ) UNIQUE NOT NULL, password VARCHAR ( 50 ) NOT NULL, email VARCHAR ( 255 ) UNIQUE NOT NULL, created_on TIMESTAMP NOT NULL, last_login TIMESTAMP)`;
				await client.query(accountTable);
				console.log("tabla account creada con exito");
			}
			//Intranet rol probe
			try {
				await client.query(queryTester_03);
				console.log("Ya existe la tabla rol");
			} catch (error) {
				const rolTable = `CREATE TABLE rol (role_id serial PRIMARY KEY, role_name VARCHAR (255) UNIQUE NOT NULL)`;
				await client.query(rolTable);
				console.log("tabla rol creada con exito");
			}
			//Intranet account_rol probe
			try {
				await client.query(queryTester_04);
				console.log("Ya existe la tabla account_rol");
			} catch (error) {
				const accountRolTable = `CREATE TABLE account_rol (user_id INT NOT NULL, role_id INT NOT NULL, grant_date TIMESTAMP, PRIMARY KEY (user_id, role_id), FOREIGN KEY (role_id) REFERENCES rol (role_id), FOREIGN KEY (user_id) REFERENCES account (user_id))`;
				await client.query(accountRolTable);
				console.log("tabla account_rol creada con exito");
			}
			console.log("DDBB lista para ser utilizada");
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
		//Delete all tables
		try {
			await client.query("BEGIN");
			await client.query(`DROP TABLE skater`);
			await client.query(`DROP TABLE account`);
			await client.query(`DROP TABLE rol`);
			await client.query(`DROP TABLE account_rol`);
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

module.exports = {
	createTables,
	deleteTables,
};
