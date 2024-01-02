const SCRIPT_SRC = 'https://unpkg.com/jimp@0.9.8/browser/lib/jimp.min.js'

function initializeJimp() {
  if (!process.client || document.querySelector(`script[src="${SCRIPT_SRC}"]`)) return
  const script = document.createElement('script');
  script.src = SCRIPT_SRC;
  document.body.appendChild(script);
  initMD5()
}

function initMD5() {
  const script = document.createElement('script');
  script.src = 'md5.min.js';
  document.body.appendChild(script);
}

import {processImage} from './processImage'
import { resizeImageIfNeeded, resizeImageByCanvasIfNeeded } from './resizeImage'
import { checkPngAndConvertToJpegIfNeeded } from './convertPngToJpeg'
import { getFileCheckSum, getFileDimensions } from './getFileData'
import { isImageDark } from './isImageDark'

export {
  initializeJimp,
  processImage,
  getFileCheckSum,
  getFileDimensions,
  resizeImageIfNeeded,
  resizeImageByCanvasIfNeeded,
  checkPngAndConvertToJpegIfNeeded,
  isImageDark
}
