var stripPacketOfHeaderAndChecksum = requireGlob('PentairMessages.js').Message.stripPacketOfHeaderAndChecksum;

module.exports = {
  processBufferMessage(message) {
    message = module.exports.convertToDecArray(message);
    return stripMessageOfHeaderAndChecksum(message);
  },

  convertToDecArray(bufferArray) {
    return [... bufferArray];
  },
};