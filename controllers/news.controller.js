import vine, { errors } from "@vinejs/vine"
import { newSchema } from "../validations/newsValidation.js"
import { generateUniqueName, imageValidator } from "../utils/helper.js"
import prisma from "../db/db.config.js"
import NewsApiTransform from "../transform/newsApiTransform.js"

class NewsController {
  static async index(req, res) {
    const news = await prisma.news.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profile: true,
          },
        },
      },
    })
    const newsTransform = news?.map((item) => NewsApiTransform.transform(item))
    res.json(newsTransform)
  }

  static async createNews(req, res) {
    const user = req.user
    const body = req.body
    try {
      const validator = vine.compile(newSchema)
      const payload = await validator.validate(body)

      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
          errors: {
            image: "Image field is required.",
          },
        })
      }

      const image = req.files?.image
      const message = imageValidator(image?.size, image?.mimetype)

      if (message !== null) {
        return res.status(400).json({
          message: message,
        })
      }

      const imgExt = image?.name.split(".")

      const imageName = generateUniqueName(imgExt[0]) + "." + imgExt[1]
      const uploadPath = process.cwd() + "/public/images/" + imageName

      image.mv(uploadPath, (err) => {
        if (err) throw err
      })

      payload.image = imageName
      payload.user_id = user.id

      const news = await prisma.news.create({ data: payload })

      return res
        .status(200)
        .json({ message: "News created successfully", news })
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ errors: error.message, error })
      } else {
        return res.status(500).json({
          message: "something went wrong while appending news to DB",
        })
      }
    }
  }

  static async getNews(req, res) {}

  static async updateNews(req, res) {}

  static async deleteNews(req, res) {}
}

export default NewsController
