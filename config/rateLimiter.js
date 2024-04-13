import rateLimit from "express-rate-limit"

export const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  limit: 3, // limit each ip to 100 request per 'window'
  standardHeaders: "draft-7",

  legacyHeaders: false,
})
