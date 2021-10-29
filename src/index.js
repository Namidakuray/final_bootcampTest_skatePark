const app = require('./app');



// Server is listening
app.listen(app.get("port"));

console.log("Server on port", app.get("port"));