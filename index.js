import express from "express"
import "dotenv/config"
import fileUpload from "express-fileupload"

const app = express()
const PORT = process.env.PORT || 8000

// middlewares

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static("public"))
app.use(fileUpload())

app.get("/", (req, res) => {
  res.json({ message: "working fine..." })
})

import ApiRoutes from "./routes/api.js"
app.use("/api/v1", ApiRoutes)

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`)
})
