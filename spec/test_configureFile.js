var cf = require('../server/configureFile');
var assert = require('assert');
var fs = require('fs');

describe('Load Configure File', () => {
  before (() => {
    config = cf.init('./config.json');
  });
  it('should load a object', () => {
    assert.equal(typeof config, 'object');
  });
  it('should not be empty', () => {
    assert.notEqual(Object.keys('config').length, 0);
  });
  it ('should same load data from a given file', () => {
    var file = JSON.parse(fs.readFileSync('./config.json'));
    assert.notEqual (cf.resultsForLogger()[0], 'defaults');
    assert.equal (cf.resultsForLogger()[0], 'location');
    assert.deepEqual(file, config);
  });

});
