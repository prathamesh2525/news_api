import jwt from "jsonwebtoken"

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (authHeader === null || authHeader === undefined) {
    return res.status(401).json({
      message: "unauthorized",
    })
  }

  const token = authHeader.split(" ")[1]

  jwt.verify(token, process.env.JWT_SECRET_TOKEN, (err, user) => {
    if (err) return res.status(401).json({ message: "unauthorized" })
    req.user = user
    next()
  })
}

export default authMiddleware
