import vine, { errors } from "@vinejs/vine"
import prisma from "../db/db.config.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { loginSchema, registerSchema } from "../validations/authValidation.js"

class AuthController {
  static async register(req, res) {
    const body = req.body
    try {
      const validator = vine.compile(registerSchema)
      const payload = await validator.validate(body)

      // check of email already exists
      const existingUser = await prisma.users.findUnique({
        where: {
          email: payload.email,
        },
      })

      if (existingUser) {
        return res.status(400).json({
          errors: {
            email: "Email aldready taken. Please use another one.",
          },
        })
      }

      // encrypt password
      payload.password = await bcrypt.hash(payload.password, 10)

      const user = await prisma.users.create({
        data: payload,
      })
      res.status(200).json({ message: "User created successfully", user })
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ errors: error.messages })
      } else {
        return res.status(500).json({
          message: "Something went wrong, while creating the new user.",
        })
      }
    }
  }

  static async login(req, res) {
    const body = req.body
    try {
      const validator = vine.compile(loginSchema)

      const payload = await validator.validate(body)

      const user = await prisma.users.findUnique({
        where: {
          email: payload.email,
        },
      })

      if (user) {
        if (!bcrypt.compare(payload.password, user.password)) {
          return res.status(400).json({ message: "invalid credentials" })
        }

        // issue token to user
        const payloadData = {
          id: user.id,
          name: user.name,
          email: user.email,
          profile: user.profile,
        }
        const token = jwt.sign(payloadData, process.env.JWT_SECRET_TOKEN, {
          expiresIn: "10d",
        })

        return res.json({
          message: "User logged in successfully.",
          access_token: `Bearer ${token}`,
        })
      }

      return res.status(400).json({ message: "no user found with this email" })
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ errors: error.messages })
      } else {
        return res.status(500).json({
          message: "Something went wrong, while creating the new user.",
        })
      }
    }
  }
}

export default AuthController
