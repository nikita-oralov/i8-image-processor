import { MD5 } from 'crypto-es/lib/md5.js';
export function getFileCheckSum(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = function (event) {
      const binary = event.target.result
      const md5Checksum = MD5(binary).toString()
      resolve(md5Checksum)
    }
    reader.onerror = function (e) {
      reject(e)
    }
    reader.readAsBinaryString(file)
  })
}

export function getFileDimensions(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = function () {
      const image = new Image()
      image.onload = function () {
        resolve({
          height: image.height,
          width: image.width,
          image
        })
      }
      image.onerror = function (e) {
        reject(e)
      }
      image.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}
