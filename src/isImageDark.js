export const isImageDark = (url) => {
  return new Promise(resolve => {
    const img = document.createElement('img')
    img.crossOrigin = 'anonymous'
    img.src = url

    img.onload = function () {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, img.width, img.height)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      let colorSum = 0
      // Считаем сумму яркости всех пикселей по rgb (0-255)
      for (let x = 0, len = data.length; x < len; x += 4) {
        // Умножаем значения R, G, B на значение альфа-канала
        const R = data[x]
        const G = data[x + 1]
        const B = data[x + 2]
        const A = data[x + 3] / 255
        if (A === 0) {
          colorSum += 255
        } else {
          colorSum += Math.floor(
            (
              Math.min(255, (R / A) || 0) +
              Math.min(255, (G / A) || 0) +
              Math.min(255, (B / A) || 0)
            ) / 3
          )
        }
      }

      // Если средняя яркость (brightness) меньше половины (127.5), то тёмное, иначе светлое
      const brightness = Math.floor(colorSum / (img.width * img.height))
      resolve(brightness < 127.5)
    }
    img.onerror = function (e) {
      resolve(true)
    }
  })
}