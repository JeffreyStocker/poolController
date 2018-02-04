// var io = require ("socket.io");
var socketServer = require (process.env.NODE_PATH + '/server/server.js').socketServer;

module.exports.pushPumpInfoToWebPages = function pushPumpInfoToWebPages (pumpData) {
  socketServer.emit('pumpDataReturn', pumpData);
};