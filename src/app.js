const express = require('express');
const exphbs = require('express-handlebars');
const expressFileUpload = require('express-fileupload');
const jwt = require('jsonwebtoken');
const secretKey = "Shhhh";
const path = require('path');
const morgan = require('morgan');
const tools = require('./middleware/tools');
require("dotenv").config();

// Initializations
const app = express();

// setting server port
app.set("port", process.env.SERVER_PORT);


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
//limit to upload
const fileSize = tools.getBiteToMB(5);
app.use(expressFileUpload({
  limits: {fileSize: fileSize},
  abortOnLimit: true,
  responseOnLimit: "El archivo es demasiado pesado, intente nuevamente con una imagen inferior a los 5Mb"
}))

// Import Routes
const indexRoutes = require('./routes/index.routes');
const intranetRoutes = require('./routes/intranet.routes');
const skatersRoutes = require('./routes/skaters.routes');

// routes
app.use(indexRoutes);
app.use(intranetRoutes);
app.use(skatersRoutes);

// static files
app.use(express.static(path.join(__dirname, "public")));


module.exports= app;
