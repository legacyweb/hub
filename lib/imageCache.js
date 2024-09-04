const {LRUCache} = require('lru-cache');
const Jimp = require('jimp');

function ImageCache() {
  this.cache = new LRUCache({
    ttl: 1000 * 60 * 60 * 24,
    ttlAutopurge: true
  });
}

ImageCache.prototype.getImage = async function(key, remoteUrl) {
  try {
    let image = this.cache.get(key);
    if (!image) {
      // Fetch using axios
      const data = await Jimp.read(remoteUrl);
      const imageBuffer = await new Promise(function(resolve, reject) {
        data.getBuffer(Jimp.MIME_GIF, function (err, buffer) {
          if (err) {
            return reject(err);
          }
          return resolve(buffer);
        });
      });
      image = Buffer.from(imageBuffer).toString('base64');
      this.cache.set(key, image);
    }
    return image;
  } catch (err) {
    return null;
  }
}

ImageCache.prototype.icon = function() {
  const imageCache = this;

  return async function(req, res) {
    const iconKey = req.params.icon;
    const origUrl = req.query.orig;
    const iconBase64 = await imageCache.getImage(iconKey, origUrl);
    const iconData = Buffer.from(iconBase64, 'base64');

    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': iconData.length
    });
    res.end(iconData);
  }
}

module.exports = ImageCache;