const bcrypt = require("bcrypt");
const fs = require("fs");
const axios = require('axios');
const { v4: uuidv4 } = require("uuid");
const saltRounds = Number(process.env.SALT_ROUNDS);
const jwt = require('jsonwebtoken');
const secretKey = uuidv4();

const createTokenAcces = async (req, res, user, userType)=>{
    let { password } = req.body;
	let hash = user.password;
	//console.log("body.password: ",password);
	//console.log("body.hash: ",hash);
	let userData;
	let matchPass= await compareHash(password, hash);
	if(userType=="skater"){
		userData={
			id:user.id,
			email:user.email,
			role:1
		}
	};
	if(userType=="intranet"){
		userData={
			id:user.user_id,
			email:user.email,
			userRole:user.role_name,
			role:2
		}
	};
    if (matchPass) {
		const token = jwt.sign(
			{
			exp: Math.floor(Date.now() / 1000) + 180,
			payload: userData,
			},
			secretKey
		);
		req.token = token;
		//console.log("token: ",token);
		//console.log("userData: ",userData);
		return true;
	} else {
		res.status(401).render("Info",{dataError:{
		error: "401 Unauthorized",
		message: "La password ingresada no coincide con nuestros registros.",
		}});
	};
};
const verifyToken= async (res,token)=>{
	return jwt.verify(token, secretKey,async (err, decoded) => {
		if (err){
			res.status(401).render("Info",{dataError:{
						error: "401 Unauthorized",
						message: "Usted no está autorizado para estar aquí",
						default_error: err.message,
					}}
			)
		}else{
			let {payload} = await decoded;
			//console.log("jwt.verify: ",payload)
			return payload;
		}
    });
}
const filesList = () => {
	let list = [];
	fs.readdirSync(`${__dirname}/../public/img/`).forEach((fileName) => {
		list.push(fileName);
	});
	return list;
};
const arrfilesDelete = (arrayFile) => {
	arrayFile.forEach((fileName) => {
		fs.rm(
			`${__dirname}/../public/img/${fileName}`,
			{ recursive: true },
			(err) => {
				if (err) {
					return err.message;
				}
			}
		);
	});
};
const downloadImgByLink=async(url, filepath)=>{
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });
    return new Promise((resolve, reject) => {
        response.data.pipe(fs.createWriteStream(filepath))
            .on('error', reject)
            .once('close', () => resolve(filepath)); 
    });
}
const createHash = (plaintextPassword) => {
	return (hash = bcrypt.hashSync(plaintextPassword, saltRounds));
};
const compareHash = async (password, hash) => {
	return (match = await bcrypt.compare(password, hash));
};
const creatUuid = () => {
	return uuidv4();
};
const getStringDate = () => {
	const d = new Date();
	return d.toJSON().split(":")[0].slice(0, 10);
};
const getBiteToMB = (size) => {
	let n = size * 1024 * 1024;
	return n;
};
module.exports = {
	getStringDate,
	getBiteToMB,
	createHash,
	compareHash,
	createTokenAcces,
	verifyToken,
	creatUuid,
	filesList,
	arrfilesDelete,
    downloadImgByLink
};
