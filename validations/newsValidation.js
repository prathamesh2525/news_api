import vine from "@vinejs/vine"
import { CustomErrorReporter } from "./CustomErrorReposter.js"

vine.errorReporter = () => new CustomErrorReporter()

export const newSchema = vine.object({
  title: vine.string().minLength(5).maxLength(191),
  content: vine.string().minLength(10).maxLength(31000),
})
