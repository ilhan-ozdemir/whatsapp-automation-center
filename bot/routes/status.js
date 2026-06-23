import { Router } from "express";
import { getStatus } from "../services/status.js";

const router = Router();

router.get("/status", (req, res) => {

    res.json(getStatus());

});

export default router;
