const bcrypt = require("bcrypt");
const fs = require("fs");
const axios = require('axios');
const { v4: uuidv4 } = require("uuid");
const saltRounds = Number(process.env.SALT_ROUNDS);

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
	creatUuid,
	filesList,
	arrfilesDelete,
    downloadImgByLink
};
