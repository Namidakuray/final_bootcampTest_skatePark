const express = require('express');
const exphbs = require('express-handlebars');
const expressFileUpload = require('express-fileupload');
const jwt = require('jsonwebtoken');
const secretKey = "Shhhh";
const path = require('path');
const morgan = require('morgan');
require("dotenv").config();


// Initializations
const app = express();

// settings
app.set("port", process.env.SERVER_PORT);
app.set("dbuser", process.env.DB_USER);
app.set("dbhost", process.env.DB_HOST);
app.set("dbname", process.env.DB_NAME);
app.set("dbpass", process.env.DB_PASS);
app.set("dbport", process.env.DB_PORT);






app.set("views", path.join(__dirname, "/views"));
app.engine(
  ".hbs",
  exphbs({
    defaultLayout: "main",
    layoutsDir: path.join(app.get("views"), "layouts"),
    partialsDir: path.join(app.get("views"), "partials"),
    extname: ".hbs",
  })
);
app.set("view engine", ".hbs");

// middlewares
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());



// static files
app.use(express.static(path.join(__dirname, "public")));


module.exports= app;
