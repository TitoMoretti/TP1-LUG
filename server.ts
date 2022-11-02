import dotenv from "dotenv";
// carga las variables de entorno para poder leerlas accediendo a process.env["variable"]
dotenv.config();

import express, { Express, Request, Response, Router } from "express";
import mongoose from "mongoose";
import indexRoute from "./routes";

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
//Le decimos la ruta que nuestra app Express va a utilizar
app.use("/api", indexRoute);

async function connectToDb() {
    // cheque si la variable de entorno esta definida.
    if (process.env.DB_CONNECTION_STRING) {
      // intenta conectar con la bd.
      await mongoose.connect(process.env.DB_CONNECTION_STRING);
    } else {
      // en caso que la var no se haya cargado correctamente, loguea un mensaje en la consola.
      console.log("El string de conexión falta.");
    }
  }

app.listen(process.env.PORT, () => {
    console.log(`El server está corriendo en el puerto ${process.env.PORT}`);
    // conecta con la base de datos
    connectToDb()
    // si la conexion es exitosa sale por then y se loguea el mensaje en la consola.
    .then(() => console.log("Se ha conectado con la Base de Datos."))
    // si hubo algun error al conectar a la bd, se loguea el mensaje en la consola.
    .catch((err) => console.log(err));
  });

  module.exports = app;