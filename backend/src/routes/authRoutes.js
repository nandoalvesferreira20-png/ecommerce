import express from "express";
import {
cadastro,
login,
logout
}
from "../controllers/authController.js";
import {
authMiddleware
}
from "../middlewares/authMiddleware.js";
const router = express.Router();
router.post("/cadastro", cadastro);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authMiddleware, (req, res) => {
res.json({
usuario: req.user
});
});
export default router;