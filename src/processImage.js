import imageBlobReduce from 'image-blob-reduce'

const JPEG_OUTPUT_QUALITY = 0.98
const PNG_TYPE = 'image/png'
const MAX_FILE_SIZE = 5 * 1024 * 1024

export async function processImage(file, { maxResolution = 3840 } = {}) {
  const targetPixelCount = getTargetPixelCount(file)
  const newFile = await downsampleRecursively(file, targetPixelCount, maxResolution)
  return newFile
}

const reducer = imageBlobReduce()

/// Патчим библиотеку ImageBlobReduce под наш случай, отличия от исходника отмечены комментариями:
reducer._calculate_size = function (env) {
  let scaleFactor
  
  // Проверяем, подходит ли изображение по размеру по максимальной стороне
  const appropriateSize = env.opts.max ? (
    env.image.width < env.opts.max &&
		env.image.height < env.opts.max
  ) : true
    
  // Файл не надо масштабировать, если он меньше порога и его не надо поворачивать
  // (если надо повернуть, все равно будет перекодировка которая может увеличить размер)
  if (
    env.blob.size <= MAX_FILE_SIZE &&
    (!env.orientation || env.orientation === 1) &&
		appropriateSize
  ) {
    scaleFactor = 1
  } else {
    // Используем для масштабирования желаемое количество пикселей в результате
    const targetPixelCount = env.opts.targetPixelCount
    const originalPixelCount = env.image.width * env.image.height

    const fileSizeScaleFactor = 1 / Math.sqrt(originalPixelCount / targetPixelCount)
    const maxSideScaleFactor = appropriateSize ? 1 : env.opts.max / Math.max(env.image.width, env.image.height)

    scaleFactor = Math.min(fileSizeScaleFactor, maxSideScaleFactor)
  }

  if (scaleFactor > 1) scaleFactor = 1

  env.transform_width = Math.max(Math.round(env.image.width * scaleFactor), 1)
  env.transform_height = Math.max(Math.round(env.image.height * scaleFactor), 1)

  env.scale_factor = scaleFactor

  return Promise.resolve(env) 
}

reducer._transform = function (env) {
  env.out_canvas = this.pica.options.createCanvas(
    env.transform_width,
    env.transform_height
  )

  env.transform_width = null
  env.transform_height = null

  // Не делать никакой обработки, если картинку не надо масштабировать или поворачивать
  if (env.scale_factor === 1 && (!env.orientation || env.orientation === 1)) {
    env.unchanged = true
    return Promise.resolve(env)
  }

  const picaOpts = { alpha: env.blob.type === PNG_TYPE }

  this.utils.assign(picaOpts, this.utils.pick_pica_resize_options(env.opts))

  return this.pica
    .resize(env.image, env.out_canvas, picaOpts)
    .then(function () {
      return env
    })
}

reducer._create_blob = function (env) {
  // Пропустить неизмененный файл без перекодировки
  if (env.unchanged) {
    env.out_blob = env.blob
    env.is_jpeg = false // предотвращает патчинг метаданных плагином jpeg_attach_orig_segments (https://github.com/nodeca/image-blob-reduce/blob/master/lib/jpeg_plugins.js#L82)
    return Promise.resolve(env)
  }

  return this.pica
    .toBlob(
      env.out_canvas,
      env.blob.type,
      env.blob.type === 'image/jpeg' ? JPEG_OUTPUT_QUALITY : undefined // использовать фиксированный quality для JPEG вместо дефолта браузера
    )
    .then(function (blob) {
      env.out_blob = blob
      return env
    })
}

async function downsampleRecursively(file, targetPixelCount, maxResolution) {
  const scaleChangeMultiplier = 1.3
  const newFile = await runImageBlobReduce(file, targetPixelCount, maxResolution)
  if (newFile.size > MAX_FILE_SIZE) {
    const sizeRatio = newFile.size / MAX_FILE_SIZE
    return await downsampleRecursively(
      file,
      targetPixelCount / sizeRatio / scaleChangeMultiplier,
			maxResolution
    )
  }
  return newFile
}

async function runImageBlobReduce(file, targetPixelCount, maxResolution) {
  const reduced = await reducer.toBlob(file, {
    targetPixelCount,
		max: maxResolution
  })
  const newFile = new File([reduced], file.name, { type: file.type })
  return newFile
}

function getTargetPixelCount(file) {
  const approximateAchievableCompressionRatio =
    file.type === 'image/jpeg' ? 6 : 2

  const targetSize = MAX_FILE_SIZE * 0.8
  const targetPixelCount =
    (targetSize * approximateAchievableCompressionRatio) / 3

  return targetPixelCount
}
