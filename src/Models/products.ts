import { Schema, model } from "mongoose";

// declaro la estructura que va a tener mi esquema/documento/tabla.
const ProductSchema = new Schema({
  name: {type: String, required: true, unique: true},
  stock: {type: Number, required: true},
  price: {type: Number, required: true},
});

// exporto mi modelo, el cual me permite acceder a los metodos de la bd.
export default model("Product", ProductSchema);