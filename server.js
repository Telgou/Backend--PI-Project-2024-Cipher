const express = require('express');
var cors = require('cors')
const bodyParser = require('body-parser');
const app = express();

app.use(cors())

app.use(bodyParser.urlencoded({ extended: true }))

app.use(bodyParser.json())

app.listen(3000,   () => {
    console.log("Server is listening on port 3000");
});
//////////////////////////////// MONGODB
const dbConfig = require('./app/config/database.config.js');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoose.connect(dbConfig.url, {
	useNewUrlParser: true
}).then(() => {
    console.log("Successfully connected to the database");    
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});
/////////////////////////////////////


app.get('/', (req, res) => {
    res.json({"message": "SNU Rest API By Cipher."});
});

require('./app/routes/admin.routes.js')(app);


