export async function resizeImageIfNeeded(file, { maxWidth = 3840, maxHeight = 3840 }) {
  if (window.Jimp && file.type !== 'image/webp') {
    const url = URL.createObjectURL(file)
    const img = await window.Jimp.read(url)
    if (maxWidth > img.bitmap.width && maxHeight > img.bitmap.height) return file
    const buffer = await img
      .scaleToFit(maxWidth, maxHeight)
      .getBufferAsync(file.type)
    const blob = new Blob([buffer], { type: file.type });
    return new File([blob], file.name, { type: file.type })
  } else {
    return resizeImageByCanvasIfNeeded(file, { maxWidth, maxHeight })
  }
}

export function resizeImageByCanvasIfNeeded(file, { maxWidth = 3840, maxHeight = 3840 }) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function(event) {
      const img = new Image();

      img.onload = function() {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          if (width > maxWidth) {
            width = maxWidth;
            height = width / aspectRatio;
          }
          if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          const resizedFile = new File([blob], file.name, { type: file.type });
          resolve(resizedFile);
        }, file.type);
      };

      img.src = event.target.result;
    };

    reader.onerror = function (event) {
      reject(event.target.error);
    };

    reader.readAsDataURL(file);
  });
}