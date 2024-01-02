# Icons8 Image Processor Plugin

Package with functions for image processing.

## Preparation

Packages are available to download from our private NPM registry: https://gitlab.icons8.com/api/v4/packages/npm/
Before installing make sure that you are logged in to npm with one of our corporate accounts.
If you don't know the credentials contant Ilya Alonov or Konstantin Vlasov.
<details>
  <summary>add NPM registry</summary>
  
  ```
  npm config set @icons8-ui:registry https://gitlab.icons8.com/api/v4/packages/npm/
  npm login --registry=https://gitlab.icons8.com/api/v4/packages/npm/
  ```
</details>

## Note

Starting from version 1.1.0 the Jimp library (https://github.com/jimp-dev/jimp) version 0.9.8 (https://unpkg.com/jimp@0.9.8/browser/lib/jimp.js) is used in the package, if it's successfully loaded, it will be used, in the other case image processing will be done with canvas

## Install

```bash
$ npm install --save @icons8/i8-image-processor

```

## Use

```js
import {
  initializeJimp,
  processImage,
  getFileCheckSum,
  getFileDimensions,
  checkPngAndConvertToJpegIfNeeded,
  resizeImageIfNeeded,
  resizeImageByCanvasIfNeeded,
  isImageDark
} from '@icons8/i8-image-processor'

// Initializes the JIMP Library if it has not already been initialized.
// Only works on client-side and ensures that the script src is not already present in the document.
// Methods using Jimp - checkPngAndConvertToJpegIfNeeded, resizeImageIfNeeded (the methods can work without jimp, the default canvas API is used)
initializeJimp()

// processedFile - checks the image for !potential size (max size 5Mb),
// depending on the type, and for the size of the larger side, and reduces
// it if necessary using the package: image-blob-reduce (https://www.npmjs.com/package/image-blob-reduce).
// file - File type
// [maxResolution] - maximum resolution for the larger side. Default: 3840
const processedFile = await processImage(file[, { maxResolution }])
// processedFile - File type

// hashed with crypto-js (https://www.npmjs.com/package/crypto-js)
const hashMD5 = await getFileCheckSum(file)
// hashMD5 - Hash md5 in String

const { width, height, image } = await getFileDimensions(file)
// width - width image
// height - height image
// image - Image type

// [image] - optional parameter representing file -> image
const resultFile = await checkPngAndConvertToJpegIfNeeded(file[, image])
// image - width image
// height - height image

// [maxWidth, maxHeight] - max sides length. Default: 3840
const resizedFile = await resizeImageIfNeeded(file[, { maxWidth, maxHeight }])
// resizedFile - File type

// url - Image url
const isDark = await isImageDark(url)
// isDark - Boolean
```
## Use ( Nuxt.js )
In nuxt.config.js:
```js
// Needed for image-blob-reduce known issue https://github.com/nodeca/image-blob-reduce
config.build.terser = {
  terserOptions: {
    compress: { evaluate: false }
  }
}
```
