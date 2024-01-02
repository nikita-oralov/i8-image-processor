const JPEG_TYPE = 'image/jpeg'
const PNG_TYPE = 'image/png'

export async function checkPngAndConvertToJpegIfNeeded(file, image, { quality = 100 } = {}) {
  try {
    if (file.type !== PNG_TYPE) return file
    let bits = null
    const newFileName = `${file.name.split('.')[0]}.jpeg`
    if (window.Jimp) {
      const url = URL.createObjectURL(file)
      const img = await window.Jimp.read(url)
      const hasAlpha = await img.hasAlpha()
      if (hasAlpha) return file

      bits = await img
        .quality(quality)
        .getBufferAsync(window.Jimp.MIME_JPEG)
    } else {
      if (!image) {
        image = await getImage(file)
      }
      window.globalImage = image
      const hasAlpha = await hasAlphaChannel(image)
      if (hasAlpha) return file
  
      bits = await saveImageOnCanvasToBlob(image, quality / 100)
    }

    return new File([bits], newFileName, { lastModified: new Date().getTime(), type: 'image/jpeg' })
  } catch (e) {
    return null
  }
}

function hasAlphaChannel(img) {
  // check PNG
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height

  const context = canvas.getContext('2d')
  context.drawImage(img, 0, 0)

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  let hasTransparentPixels = false
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) {
      hasTransparentPixels = true
      break
    }
  }

  return hasTransparentPixels
}

function saveImageOnCanvasToBlob(image, quality) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    if (!canvas) reject()

    canvas.width = image.width
    canvas.height = image.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(image, 0, 0)
    canvas.toBlob(function(blob) {
      resolve(blob)
    }, JPEG_TYPE, Math.max(Math.min(quality, 1), 0))
  })
}

function getImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = function () {
      const image = new Image()
      image.onload = function () {
        resolve(image)
      }
      image.onerror = function (e) {
        reject(e)
      }
      image.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}
