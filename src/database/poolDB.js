const app = require('../app');
const pg = require("pg");
require('dotenv').config();

/* Se configura el parseo de pg desde los Obj(Date) a String */
pg.types.setTypeParser(1082, function(stringValue) {
    return stringValue; //1082 for date type
});

/*Utiliza el paquete pg para conectarse a PostgreSQL */
const config = {
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: process.env.DB_NAME,
	password: process.env.DB_PASS,
	port: process.env.DB_PORT,
    max: 20,
    min: 5,
    idleTimeoutMillis: 15000,
    connectionTimeoutMillis: 2000,
};

const Singleton = (function () {
    let instance;
    function createInstance() {
        var classObj = new pg.Pool(config);
        return classObj;
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
                console.log("Crea Pool");
            }
            else {
                console.log("Ya existe Pool");
            }
            return instance;
        },
    };
})();

module.exports = Singleton;