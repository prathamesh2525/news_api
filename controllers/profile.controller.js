import prisma from "../db/db.config.js"
import { generateUniqueName, imageValidator } from "../utils/helper.js"

class ProfileController {
  static async getUser(req, res) {
    try {
      const user = req.user
      return res.json(user)
    } catch (error) {
      return res.status(400).json({ message: "error while fetchig user info" })
    }
  }

  static async createUser(req, res) {}

  static async updateUser(req, res) {
    try {
      const id = req.user.id

      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ message: "profile image is required" })
      }

      const profile = req.files?.profile
      console.log(profile)
      const message = imageValidator(profile?.size, profile?.mimetype)
      console.log(message)

      if (message !== null) {
        return res.status(400).json({
          errors: {
            profile: message,
          },
        })
      }

      const imageExt = profile?.name.split(".")
      const imageName = generateUniqueName(imageExt[0]) + "." + imageExt[1]

      const uploadPath = process.cwd() + "/public/images/" + imageName

      profile.mv(uploadPath, (err) => {
        if (err) throw err
      })

      await prisma.users.update({
        data: {
          profile: imageName,
        },
        where: {
          id: Number(id),
        },
      })

      return res.status(200).json({
        message: "profile updated successfully",
      })
    } catch (error) {
      console.log(error)
      return res.status(500).json({
        message: "Something went wrong. please try again",
      })
    }
  }

  static async deleteUser() {}
}

export default ProfileController
