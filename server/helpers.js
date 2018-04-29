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

///// wip
var equalComplex = function (val) {
  return this.varsToTest.reduce(test => {
    if (typeof test === 'function') {
      if (test.call(null, val) === true) {
        return true;
      }
    } else {
      if (test === val) {
        return true;
      }
    }
  }, false);
};


var equalOr = function (val) {
  var equalValues = [...arguments];
  return this.equalValues.some(currentTest => val === currentTest);
};


var equal = function (val) {
  return this.varsToTest.every(currentTest => val === currentTest);
};

var notEqual = function (val) {
  return !this.varsToTest.every(currentTest => val === currentTest);
};


var notEqualOr = function (val) {
  return !this.varsToTest.includes(val);
};


module.exports.or = function() {
  var varsToTest = [...arguments];
  return {
    equal,
    notEqual,
    notEqualOr,
    equalOr
  };
};

module.exports.and = function () {

};
///// end WIP