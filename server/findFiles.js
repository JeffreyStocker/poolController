var glob = require ('glob');

var filesLocations = {};
module.exports = {
  init(foldersToIgnore = [], filesToIgnore = [], setAsGlobal = true) {
    var files;

    filesLocations = {};
    foldersToIgnore = processToIgnoreIntoString(foldersToIgnore);
    filesToIgnore = processToIgnoreIntoString(filesToIgnore);
    files = glob.sync(`!(${foldersToIgnore})/**/!(${filesToIgnore}).js`, {absolute: true});

    files.forEach(file => {
      let dot = file.lastIndexOf('.');
      let slash = file.lastIndexOf('/') + 1;
      let fileName = file.slice(slash, dot);
      if (!!filesLocations[fileName]) {
        console.log (filesLocations[fileName]);
        throw new Error('Duplicate File Name Found: ' + fileName);
      }
      filesLocations[fileName] = file;
    });
    if (setAsGlobal) {
      global.requireGlob = module.exports.requireGlob;
    }
  },

  requireGlob(name) {
    [name, ...test] = name.split('.');
    if (filesLocations[name]) {
      return require(filesLocations[name]);
    } else {
      throw new Error (name + 'can not be found in files');
    }
  }
};

var processToIgnoreIntoString = function (infoToIgnore) {
  var infoArray;
  if (Array.isArray(infoToIgnore)) {
    infoArray = infoToIgnore;
  } else if (typeof infoToIgnore === 'string') {
    infoArray = infoToIgnore.split(',');
  }
  return infoArray.join('|');
};