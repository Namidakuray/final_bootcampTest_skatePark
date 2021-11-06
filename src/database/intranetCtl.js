require("dotenv").config();
const tools = require('../middleware/tools');
/* Se capturan los posibles errores que puedan ocurrir a través de bloques catch o
parámetros de funciones callbacks para condicionar las funciones del servidor. */

/* Consultas DML para la
gestión y persistencia de datos. */

/* Consultas de uso exclusivo del administrador */
// GET /colabs
const getColabs = async (pool) => {
	let queryStatement = {
		name: "get-colabs",
		text: "SELECT account.user_id, account.nombre, account.apellido, account.password, account.email, account.created_at, account.estado FROM account INNER JOIN account_rol ON account.user_id = account_rol.role_id WHERE account_rol.role_id=2 ORDER BY account.user_id;",
	};
	try {
		let client = await pool.connect();
		try {
			const res = await client.query(queryStatement);
			return res.rows;
		} catch (error) {
			return {message: "dbCtl.getColabs error",data: error.stack};
		} finally {
			client.release();
		}
	} catch (error) {
		return {message: "error al conectar con la DDBB",data: error};
	}
};
// PUT /intranet/changeState/${id}
const changeState = async (pool, id, newState) => {
	let queryStatement = {
		text: "UPDATE account SET estado=$2 WHERE user_id = $1 RETURNING *;",
		values: [id,newState],
	};
	try {
		let client = await pool.connect();
		try {
			const res = await client.query(queryStatement);
			client.release();
			if(res.rows[0].estado){
				let message=` ${res.rows[0].nombre} ${res.rows[0].apellido} ha sido habilitado para evaluar skaters`;
				return { status:true,message, dbResponse: res.rows[0]};
			}else{
				let message=` ${res.rows[0].nombre} ${res.rows[0].apellido} ya no puede evaluar skaters`;
				return { status:true,message, dbResponse: res.rows[0]};
			}
		} catch (error) {
			return { status:false,message:"error al intentar editar cuenta", dbResponse: error.stack};
		}
	} catch (error) {
		return { status:false,message:"error al conectar con la DDBB", dbResponse: error};
	}
};

// GET /colab
const getColab = async (pool,target,findBy) => {
	let queryText;
	let queryName;
	switch (findBy){
		case "id":
			queryText="SELECT account.user_id, (SELECT role_name FROM rol WHERE account_rol.role_id = rol.role_id), account.nombre, account.apellido, account.password, account.email, account.estado FROM account INNER JOIN account_rol ON account.user_id = account_rol.user_id WHERE account.user_id=$1;";
			queryName="get-colab-by-id"
			break;
		case "email":
			queryText="SELECT account.user_id, (SELECT role_name FROM rol WHERE account_rol.role_id = rol.role_id), account.nombre, account.apellido, account.password, account.email, account.estado FROM account INNER JOIN account_rol ON account.user_id = account_rol.user_id WHERE account.email=$1;"
			queryName="get-colab-by-email"
			break;
		default:
			queryText="SELECT account.user_id, (SELECT role_name FROM rol WHERE account_rol.role_id = rol.role_id), account.nombre, account.apellido, account.password, account.email, account.estado FROM account INNER JOIN account_rol ON account.user_id = account_rol.user_id WHERE account.user_id=$1;";
			queryName="get-colab-by-id"
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
			return {message: "dbCtl.getColab error",data: error.stack};
		} finally {
			client.release();
		}
	} catch (error) {
		return {message: "error al conectar con la DDBB",data: error};
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

//PUT intranet/skaterScore
const skaterScore = async (pool, id, puntaje, estado) => {
	let queryStatement = {
		text: "UPDATE skater SET puntaje=$2, estado=$3 WHERE id = $1 RETURNING *;",
		values: [id, puntaje, estado],
	};
	try {
		let client = await pool.connect();
		try {
			const res = await client.query(queryStatement);
			client.release();
			return { status:true,message:"Cuenta skater evaluada satisfactoriamente", dbResponse: res.rows[0]};
		} catch (error) {
			return { status:false,message:"error al intentar guardar la evaluación", dbResponse: error.stack};
		}
	} catch (error) {
		return { status:false,message:"error al conectar con la DDBB", dbResponse: error};
	}
};


/* Consultas acuxiliares (preparación de modularización para esquema microservicios) */
// GET /skaters
const getSkaters = async (pool) => {
	let queryStatement = {
		name: "get-intranet-skaters",
		text: "select id, email, nombre, apellido, password, created_at, anos_experiencia, especialidad, puntaje, foto, estado FROM skater ORDER BY id;",
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
// DELETE /skater
const deleteSkater = async (pool, id) => {
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
	getColabs,
	getColab,
	changeState,
	skaterScore,
	getSkaters,
	deleteSkater,
};
