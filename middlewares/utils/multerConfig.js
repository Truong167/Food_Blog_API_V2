let multer = require("multer");

function multerConfig(){
  let diskStorage = multer.diskStorage({
      destination: (req, file, callback) => {
        // Định nghĩa nơi file upload sẽ được lưu lại
      if (file.fieldname === "user") {
        callback(null, 'public/image/user')
      }
      else if (file.fieldname === "recipe") {
          callback(null, 'public/image/recipe');
      }
      else if (file.fieldname === "step") {
          callback(null, 'public/image/step')
      } else if (file.fieldname === "recipeList") {
        callback(null, 'public/image/recipeList')
      }
      else if (file.fieldname === "ingredient") {
        callback(null, 'public/image/ingredient')
      }
      },
      filename: (req, file, callback) => {
      // Kiểm tra ext 
        let math = ["image/png", "image/jpeg", "image/jpg"];
        if (math.indexOf(file.mimetype) === -1) {
          let errorMess = `The file <strong>${file.originalname}</strong> is invalid. Only allowed to upload image jpeg, png, jpg.`;
          return callback(errorMess, null);
        }
        callback(null, `${Date.now()}-${file.originalname}`)
      }
    });
  
    return multer({storage: diskStorage})
}

module.exports = multerConfig