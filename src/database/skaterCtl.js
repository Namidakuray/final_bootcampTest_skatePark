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
		text: "select email, nombre, apellido, password, created_at, anos_experiencia, especialidad, puntaje, foto, estado FROM skater ORDER BY id;",
	};
	try {
		let client = await pool.connect();
		try {
			const res = await client.query(queryStatement);
			return res.rows;
		} catch (error) {
			return {message: "dbCtl.getSkaters error",data: error.stack};
		} finally {
			client.release();
		}
	} catch (error) {
		return {message: "error al conectar con la DDBB",data: error};
	}
};
// GET /skater
const getSkater = async (pool,target,findBy) => {
	let queryText;
	let queryName;
	switch (findBy){
		case "id":
			queryText="SELECT id, email, nombre, apellido, password, created_at, anos_experiencia, especialidad, puntaje, foto, estado FROM skater WHERE id = $1;";
			queryName="get-skater-by-id"
			break;
		case "email":
			queryText="SELECT id, email, nombre, apellido, password, created_at, anos_experiencia, especialidad, puntaje, foto, estado FROM skater WHERE email = $1;"
			queryName="get-skater-by-email"
			break;
		default:
			queryText="SELECT id, email, nombre, apellido, password, created_at, anos_experiencia, especialidad, puntaje, foto, estado FROM skater WHERE id = $1;";
			queryName="get-skater-by-id"
			break;
		}
	let queryStatement = {
		name: queryName,
		text: queryText,
		values: [target],
	};
	try {
		let client = await pool.connect();
		try {
			const res = await client.query(queryStatement);
			if(res.rowCount==0){
				return {error:"404 email not found", message:"el email ingresado no se encuentra en nuestros registros."}
			}else{
				return res.rows[0];
			}
		} catch (error) {
			return {message: "dbCtl.getSkater error",data: error.stack};
		} finally {
			client.release();
		}
	} catch (error) {
		return {message: "error al conectar con la DDBB, error : ",data: error};
	}
};

// POST /skater
const insertSkater = async (pool, email, nombre, apellido, password, anos_experiencia, especialidad, puntaje, foto, estado) => {
	let created_at = tools.getStringDate();
	let queryStatement = {
		text: "INSERT INTO skater (email, nombre, apellido, password, created_at, anos_experiencia, especialidad, puntaje, foto, estado) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
		values: [email, nombre, apellido, password, created_at, anos_experiencia, especialidad, puntaje, foto, estado],
	};
	try {
		let client = await pool.connect();
		try {
			const res = await client.query(queryStatement);
			client.release();
			return {status:true,message:"Cuenta skater creada satisfactoriamente", dbResponse: res.rows[0]};
		} catch (error) {
			return {status:false,message:"error al intentar crear cuenta",dbResponse: error.stack};
		}
	} catch (error) {
		return {status:false,message: "error al conectar con la DDBB",dbResponse: error};
	}
};
// PUT /skater
const editSkater = async (pool, id, nombre, apellido, password, anos_experiencia, especialidad, puntaje, foto, estado) => {
	let queryStatement = {
		text: "UPDATE skater SET nombre=$2, apellido=$3, password=$4, anos_experiencia=$5, especialidad=$6, puntaje=$7, foto=$8, estado=$9 WHERE id = $1 RETURNING *;",
		values: [id, nombre, apellido, password, anos_experiencia, especialidad, puntaje, foto, estado],
	};
	try {
		let client = await pool.connect();
		try {
			const res = await client.query(queryStatement);
			client.release();
			return { status:true,message:"Cuenta skater editada satisfactoriamente", dbResponse: res.rows[0]};
		} catch (error) {
			return { status:false,message:"error al intentar editar cuenta", dbResponse: error.stack};
		}
	} catch (error) {
		return { status:false,message:"error al conectar con la DDBB", dbResponse: error};
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
				return {message: "Skater eliminado exitosamente",dbResponse: res.rows[0]};
			} else {
				return {message: "el skater no existe"};
			}
		} catch (error) {
			return {message: "error al intentar eliminar la cuenta skater ",dbResponse: error.stack};
		}
	} catch (error) {
		return {message: "error al conectar con la DDBB",dbResponse: error};
	}
};

module.exports = {
	getSkaters,
	getSkater,
	insertSkater,
	editSkater,
	deleteAcc
};
