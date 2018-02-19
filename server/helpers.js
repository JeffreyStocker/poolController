module.exports.returnValueFromObject = function (object, path) {
  var pathNames;
  if (!object || !path) { return null; }
  if (typeof object !== 'object' || typeof path !== 'string') { return null; }

  pathNames = path.split('.');
  for (var name of pathNames) {
    if (object[name] === undefined) {
      return undefined;
    } else {
      object = object[name];
    }
  }
  return object;
};
