import { Router } from "express";
import cartController from "../src/Controllers/cart";

const router = Router();

router.get("/", cartController.get);
router.post("/", cartController.add);
router.delete("/", cartController.delete);

export default router;

//put para sobreescribir
//post para agregar algo nuevo