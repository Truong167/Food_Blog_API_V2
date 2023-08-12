const path = require("path");
const fs = require('fs')

const deleteFiles = function(files) {
  const directory = "public/image";
  for (const file of files) {
    fs.unlink(path.join(directory, file), (err) => {
      if (err) throw err;
    });
  }
}

const deleteSingleFile = function(file) {
  const directory = "public/image";
  fs.unlink(path.join(directory, file), (err) => {
    if (err) throw err;
  });
}

module.exports = {
    deleteFiles,
    deleteSingleFile
}
