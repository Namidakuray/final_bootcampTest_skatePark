const tools = require('../middleware/tools');
const axios = require('axios');
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
				const skaterTable = `CREATE TABLE skater (id SERIAL, email VARCHAR(50), nombre VARCHAR(25) NOT NULL, apellido VARCHAR(25) NOT NULL, password VARCHAR(100) NOT NULL, created_at DATE NOT NULL, anos_experiencia INT NOT NULL, especialidad VARCHAR(50) NOT NULL, puntaje FLOAT, foto VARCHAR(255) NOT NULL, estado BOOLEAN NOT NULL, PRIMARY KEY (email))`;
				await client.query(skaterTable);
				console.log("tabla skater creada con exito");
			}
			//Intranet account probe
			try {
				await client.query(queryTester_02);
				console.log("Ya existe la tabla account");
			} catch (error) {
				const accountTable = `CREATE TABLE account (user_id serial PRIMARY KEY, username VARCHAR ( 50 ) UNIQUE NOT NULL, password VARCHAR ( 100 ) NOT NULL, email VARCHAR ( 255 ) UNIQUE NOT NULL, created_at TIMESTAMP NOT NULL, last_login TIMESTAMP)`;
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
			return true;
		} catch (error) {
			console.log("error al crear las tablas, error : ", error);
			return false;
		}
	} catch (error) {
		console.log("error al conectar con la DDBB, error : ", error);
		return false;
	}
};
const deleteTables = async (pool) => {
	try {
		let client = await pool.connect();
		//Delete all tables
		try {
			await client.query("BEGIN");
			await client.query(`DROP TABLE skater`);
			await client.query(`DROP TABLE account_rol`);
			await client.query(`DROP TABLE rol`);
			await client.query(`DROP TABLE account`);
			await client.query("COMMIT");
			client.release();
			let imgNames=tools.filesList();
			tools.arrfilesDelete(imgNames);		
			console.log("Tablas eliminadas con éxito.");
			return true;
		} catch (error) {
			console.log("error al intentar eliminar la tablas ", error);
			return false;
		}
	} catch (error) {
		console.log("error al conectar con la DDBB, error : ", error);
		return false;
	}
};
const insertSkater = async (pool) => {
	let resp = await axios("https://randomuser.me/api/");
	let data = resp.data.results[0];
	let pictureUrl= data.picture.large;
	let pictureExt=pictureUrl.split("/")[ pictureUrl.split("/").length - 1].split('.')[1];
	let especialidad = ["SLALOM","DOWNHILL","FREESTYLE"];
	let index = (function getRandomInt() {
		return Math.floor(Math.random() * (especialidad.length - 0)) + 0;
	})();
	let imgTag = `${tools.creatUuid()}.${pictureExt}`
	await tools.downloadImgByLink(pictureUrl,`${__dirname}/../public/img/${imgTag}`);
	let pass=data.name.last
	let hash=tools.createHash(pass)
	let newSkater = {
		email: data.email,
		nombre: data.name.first,
		apellido: data.name.last,
		password: hash,
		created_at: data.registered.date.split("T")[0],
		anos_experiencia: data.registered.age,
		especialidad: especialidad[index],
		puntaje: 0,
		foto: imgTag,
		estado: false
	}
	let queryStatement = {
		text: "INSERT INTO skater (email, nombre, apellido, password, created_at, anos_experiencia, especialidad, puntaje, foto, estado) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
		values: [newSkater.email, newSkater.nombre, newSkater.apellido, newSkater.password, newSkater.created_at, newSkater.anos_experiencia, newSkater.especialidad, newSkater.puntaje, newSkater.foto, newSkater.estado],
	};
	try {
		let client = await pool.connect();
		try {
			const res = await client.query(queryStatement);
			client.release();
			return {status:true,message:"Cuenta skater creada satisfactoriamente", response: res.rows[0]};
		} catch (error) {
			return {status:false,message:"error al intentar crear cuenta",response: error.stack};
		}
	} catch (error) {
		return {status:false,message: "error al conectar con la DDBB.",response: error};
	}
}
module.exports = {
	createTables,
	deleteTables,
	insertSkater
};
