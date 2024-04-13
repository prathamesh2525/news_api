import express from "express"
import "dotenv/config"
import fileUpload from "express-fileupload"
import helmet from "helmet"
import cors from "cors"

const app = express()
const PORT = process.env.PORT || 8000

// middlewares

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static("public"))
app.use(fileUpload())
app.use(limiter)

app.get("/", (req, res) => {
  res.json({ message: "working fine..." })
})

import ApiRoutes from "./routes/api.js"
import { limiter } from "./config/rateLimiter.js"
app.use("/api/v1", ApiRoutes)

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`)
})
