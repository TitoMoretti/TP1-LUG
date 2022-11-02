import { Router } from "express";
import productController from "../src/Controllers/products";

const router = Router();

router.get("/", productController.get);
router.delete("/", productController.delete);
router.post("/", productController.add);
router.put("/", productController.put);

export default router;

//put para sobreescribir
//post para agregar algo nuevo