// var io = require ("socket.io");
var socketServer = require ('../server').socketServer;

module.exports.pushPumpInfoToWebPages = function pushPumpInfoToWebPages (pumpData) {
  socketServer.emit('pumpDataReturn', pumpData);
};