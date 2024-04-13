import fs from "fs"
import { supportedMimes } from "../config/fileSystem.js"

export const imageValidator = (size, mime) => {
  if (bytesToMb(size) > 2) {
    return "Image size must be less than 2mb"
  } else if (!supportedMimes.includes(mime)) {
    return "image must be type of png,jpg,jpeg,svg,webp,gif.."
  }

  return null
}

export const bytesToMb = (bytes) => {
  return bytes / (1024 * 1024)
}

export const generateUniqueName = (name) => {
  return `${name}_${Date.now()}`
}

export const getImageUrl = (imageName) => {
  return `${process.env.APP_URL}/images/${imageName}`
}

export const removeImage = (imageName) => {
  const path = process.cwd + "/public/images/" + imageName
  if (fs.existsSync(path)) {
    fs.unlinkSync(path)
  }
}

export const uploadImage = (image) => {
  const imgExt = image?.name.split(".")

  const imageName = generateUniqueName(imgExt[0]) + "." + imgExt[1]
  const uploadPath = process.cwd() + "/public/images/" + imageName

  image.mv(uploadPath, (err) => {
    if (err) throw err
  })

  return imageName
}
