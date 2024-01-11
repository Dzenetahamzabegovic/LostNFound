import express from "express";
import createError from "http-errors";
import logger from "morgan"; 
import indexRouter from "./routes/index.js";
import usersRouter from "./routes/users.js";
import placesRouter from "./routes/places.js";  // Importation de la route places.js
import objectsRouter from "./routes/objects.js";  // Importation de la route objects.js
import loginRouter from "./routes/login.js";  // Importation de la route login.js
import mongoose from 'mongoose';
import path from 'path';
import cors from 'cors';

mongoose.connect(process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/lostNFound');

const app = express();

// Log requests (except in test mode).
if (process.env.NODE_ENV !== 'test') {
  app.use(logger('dev'));
}
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/places", placesRouter);  // Utilisation de la route places.js avec le préfixe /places
app.use("/objects", objectsRouter);  // Utilisation de la route objects.js avec le préfixe /objects
app.use("/login", loginRouter);  // Utilisation de la route login.js avec le préfixe /login

// Serve the apiDoc documentation.
const __dirname = path.resolve();
app.use('/apidoc', express.static(path.join(__dirname, 'docs')));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Send the error status
  res.status(err.status || 500);
  res.send(err.message);
});


export default app;
