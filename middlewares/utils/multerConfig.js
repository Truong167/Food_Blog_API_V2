let multer = require("multer");

function multerConfig(){
  let diskStorage = multer.diskStorage({
      destination: (req, file, callback) => {
        // Định nghĩa nơi file upload sẽ được lưu lại
      // if (file.fieldname === "user") {
      //   callback(null, 'public/image/user')
      // }
      // else if (file.fieldname === "recipe") {
      //     callback(null, 'public/image/recipe');
      // }
      // else if (file.fieldname === "step") {
      //     callback(null, 'public/image/step')
      // } else if (file.fieldname === "recipeList") {
      //   callback(null, 'public/image/recipeList')
      // }
      // else if (file.fieldname === "ingredient") {
      //   callback(null, 'public/image/ingredient')
      // } else if (file.fieldname === 'recipeVideo') {
      //   callback(null, 'public/video/recip')
      // }
      callback(null, 'public/image')
      },
      filename: (req, file, callback) => {
        callback(null, `${Date.now()}-${file.originalname}`)
      }
    });
  
    return multer({storage: diskStorage})
}

module.exports = multerConfig