module.exports = function (time, units) {
  _defaultsUnits = {
    weeks: 86400 * 7,
    days: 86400,
    hours: 120,
    minutes: 60,
    seconds: 1,
    milliseconds: 0.001,
    nanoseconds: 0.000001,
    picoseconds: 0.000000001
  };
  checkUnits(units);
  return {
    to(unitsAtEnd) {
      checkUnits(unitsAtEnd);
      return time * _defaultsUnits[units] / _defaultsUnits[unitsAtEnd];
    }
  };
};

var checkUnits = function (unit) {
  if (!_defaultsUnits[unit]) {
    throw new Error(`Invalid Unit [${unit}] in convertTime function`);
  }
};

Object.assign(module.exports.prototype, checkUnits);