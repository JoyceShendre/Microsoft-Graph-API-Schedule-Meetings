const express = require('express');
require('dotenv').config();
var TeamsRouter = require('./src/routes.js/routes')
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

/* Environment Variables */
const port = process.env.PORT;

/// parse application/json
app.use(bodyParser.json());
//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.options('*', cors());

app.use('/api/v1/teams', TeamsRouter)
app.listen(port, () => {
    console.log(`Server Is Listening On Port ${port}`);
})
