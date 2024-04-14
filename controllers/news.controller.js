import vine, { errors } from "@vinejs/vine"
import { newSchema } from "../validations/newsValidation.js"
import {
  generateUniqueName,
  imageValidator,
  removeImage,
  uploadImage,
} from "../utils/helper.js"
import prisma from "../db/db.config.js"
import NewsApiTransform from "../transform/newsApiTransform.js"
import redisCache from "../db/redis.config.js"
import logger from "../config/logger.js"

class NewsController {
  static async index(req, res) {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10

    if (page <= 0) {
      page = 1
    }
    if (limit <= 0 || limit > 100) {
      limit = 10
    }

    const skip = (page - 1) * limit

    const news = await prisma.news.findMany({
      take: limit,
      skip: skip,
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

    const totalNews = await prisma.news.count()
    const totalPages = Math.ceil(totalNews / limit)

    res.json({
      news: newsTransform,
      metadata: {
        totalPages,
        currentPage: page,
        currentLimit: limit,
      },
    })
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

      const imageName = uploadImage(image)

      payload.image = imageName
      payload.user_id = user.id

      const news = await prisma.news.create({ data: payload })

      redisCache.del("/api/news", (err) => {
        if (err) throw new err()
      })

      return res
        .status(200)
        .json({ message: "News created successfully", news })
    } catch (error) {
      logger.error(error?.message)
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ errors: error.message, error })
      } else {
        return res.status(500).json({
          message: "something went wrong while appending news to DB",
        })
      }
    }
  }

  static async getNews(req, res) {
    try {
      const { id } = req.params
      const news = await prisma.news.findUnique({
        where: {
          id: Number(id),
        },
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
      return res.json({
        news: news ? NewsApiTransform.transform(news) : null,
      })
    } catch (error) {
      return res.status(500).json({
        message: "something went wrong while fetching news",
      })
    }
  }

  static async updateNews(req, res) {
    try {
      const { id } = req.params
      const user = req.user

      const news = await prisma.news.findUnique({
        where: {
          id: Number(id),
        },
      })

      if (user.id !== news.user_id) {
        return res.status(500).json({
          message: "Unauthorized user",
        })
      }

      const validator = vine.compile(newSchema)
      const payload = validator.validate(req.body)

      const image = req?.files?.image // if user wants to update image
      let imageName

      if (image) {
        const message = imageValidator(image?.size, image?.mimetype)
        if (message !== null) {
          0
          return res.status(400).json({
            errors: {
              image: message,
            },
          })
        }

        // upload new image
        imageName = uploadImage(image)
        payload.image = imageName

        // delete old image
        removeImage(news.image)
      }
      await prisma.news.update({
        where: {
          id: Number(id),
        },
        data: payload,
      })

      return res.status(200).json({ message: "news updated successfully" })
    } catch (error) {
      res.status(400).json({
        errors: {
          message: error,
        },
      })
    }
  }

  static async deleteNews(req, res) {
    try {
      const { id } = req.params
      const news = await prisma.news.findUnique({
        where: {
          id: Number(id),
        },
      })

      if (req.user.id !== news?.user_id) {
        return res.status(401).json({ message: "Unauthorized" })
      }

      // delete image from filesystem
      removeImage(news.image)

      await prisma.news.delete({
        where: {
          id: Number(id),
        },
      })

      res.json({
        message: "News deleted successfully",
      })
    } catch (error) {
      return res.status(500).json({
        errors: {
          message: error,
        },
      })
    }
  }
}

export default NewsController
