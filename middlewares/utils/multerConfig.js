let multer = require("multer");

function multerConfig(){
  let diskStorage = multer.diskStorage({
      destination: (req, file, callback) => {
        // Định nghĩa nơi file upload sẽ được lưu lại
      callback(null, 'public/image')
      },
      filename: (req, file, callback) => {
        callback(null, `${Date.now()}-${file.originalname}`)
      }
    });
  
    return multer({storage: diskStorage})
}

module.exports = multerConfig