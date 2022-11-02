import { Schema, model } from "mongoose";

// declaro la estructura que va a tener mi esquema/documento/tabla.
const CartSchema = new Schema({
  name: {type: String, required: true},
  amount: {type: Number, required: true},
  price: {type: Number, required: true},
});

// exporto mi modelo, el cual me permite acceder a los metodos de la bd.
export default model("Cart", CartSchema);