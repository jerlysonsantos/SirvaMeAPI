const sharp = require('sharp');

exports.compressImage = (file, sizeX, sizeY) => {
  return sharp(file.path)
    .resize(sizeX, sizeY)
    .toFormat('webp')
    .webp({
      quality: 40,
    })
    .toBuffer()
    .then(data => data);
};
