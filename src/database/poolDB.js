const app = require('../app');
const { Pool, types } = require("pg");
require('dotenv').config();

/* Se configura el parseo de pg desde los Obj(Date) a String */
types.setTypeParser(1082, (stringValue)=>{
    return stringValue; //1082 for date type
});
/*Utiliza el paquete pg para conectarse a PostgreSQL */
const config = {
	user: app.get("dbuser"),
	host: app.get("dbhost"),
	database: app.get("dbname"),
	password: app.get("dbpass"),
	port: app.get("dbport"),
    max: 20,
    min: 5,
    idleTimeoutMillis: 15000,
    connectionTimeoutMillis: 2000,
};

const Singleton = (function () {
    let instance;
    function createInstance() {
        var classObj = new Pool(config);
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