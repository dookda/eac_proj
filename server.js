const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const cors = require('cors');

app.use(cors());
app.options('*', cors());

app.use(bodyParser.json({
    limit: '50mb',
    extended: true
}));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));

app.use(express.static(__dirname + '/www'));

app.listen(3000, () => {
    console.log('running on http://localhost:3000')
});

const apieec = require('./service/apieec');
app.use(apieec);

const api = require('./service/organization');
app.use(api);
