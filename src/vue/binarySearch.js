var returnMiddle = function (start, finish) {
  var diff = finish - start;
  if (diff % 2 === 0) {
    diff /= 2;
  } else {
    diff = (diff + 1) / 2;
  }
  return finish - diff;
};

var search = function (inputArray, testCallback, options = {exactMatch: true}) {
  var last = null;


  var test = function (low, high, lastMiddle) {
    var middle = returnMiddle(low, high);
    if (middle === lastMiddle) {
      if (options.exactMatch === false) {
        if (Math.abs(testCallback(last)) > Math.abs(testCallback(middle))) {
          return middle;
        } else {
          return last;
        }
      }
      return null;
    }
    last = middle;
    var callbackResults = testCallback (inputArray[middle]);
    if (callbackResults === 0) {
      return middle;
    } else if (callbackResults > 0) {
      return test(middle, high, middle);
    } else if (callbackResults < 0) {
      return test(low, middle, middle);
    } else {
      throw new Error ('invalid callback test results: ' + callbackResults);
    }
  };
  return test (0, inputArray.length);
};

var binarySearch = function (inputArray, testCallback, options = {exactMatch: true}) {
  return search(inputArray, testCallback, options);
};

var asyncBinarySearch = function (inputArray, testCallback, options = {exactMatch: true}) {
  return new Promise ((resolve, revoke) => {
    var searchResults = search(inputArray, testCallback, options);
    // if (searchResults === null) {
    //   revoke (null);
    // }
    resolve (searchResults);
  });
};

module.exports = {
  binarySearch,
  asyncBinarySearch
};