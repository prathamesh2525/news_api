import express from "express"
import AuthController from "../controllers/auth.controller.js"
import authMiddleware from "../middlewares/auth.middleware.js"
import ProfileController from "../controllers/profile.controller.js"
import NewsController from "../controllers/news.controller.js"

const router = express.Router()

router.post("/auth/register", AuthController.register)

router.post("/auth/login", AuthController.login)

// profile routes

router.get("/profile", authMiddleware, ProfileController.getUser)
router.put("/update", authMiddleware, ProfileController.updateUser)

// news routes

router.get("/news", NewsController.index)
router.post("/news", authMiddleware, NewsController.createNews)
router.get("/news/:id", NewsController.getNews)
router.put("/news/:id", authMiddleware, NewsController.updateNews)
router.delete("/news/:id", authMiddleware, NewsController.deleteNews)

export default router
