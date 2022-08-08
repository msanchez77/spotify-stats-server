const express = require('express'); // Express web server framework
const cors = require('cors');
const cookieParser = require('cookie-parser');
const middleware = require("./utils/middleware");
const spotifyRouter = require('./controllers/spotify');


const app = express();

app.use(cors());
app.use(cookieParser());
app.use(middleware.requestLogger);

app.use("/api/spotify", spotifyRouter);


app.use(middleware.errorHandler);


module.exports = app;
 