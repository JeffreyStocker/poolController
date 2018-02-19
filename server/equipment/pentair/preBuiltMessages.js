/////// packet Information /////////////////////////
/*
speed #, Higher # higher priority
soler 4
slow speed 3
waterfall speed 2
heater/spa speed 1
*/
var defaultMessages = {
  prefix: [255, 0, 255, 165, 0],
  shortPrefix: [255, 0, 255],
  pumpToRemote:        {name: 'Set Pump to Remote', byte: [165, 0, 96, 16, 4, 1, 255],          buffer: Buffer.from('a50060100401ff0219', 'hex'),       hex: 'a50060100401ff0219'},       byteWithChecksum: [165, 0, 96, 16, 4, 1, 255, 2, 25], //intellicom set pump to remote  //works
  pumpToLocal:         {name: 'Set Pump to Local',  byte: [165, 0, 96, 16, 4, 1, 0],            buffer: Buffer.from('a5006010040100011a', 'hex'),       hex: 'a5006010040100011a'},       byteWithChecksum: [165, 0, 96, 16, 4, 1, 0, 1, 26],
  pumpExternal_Speed4: {name: 'Exteral Speed 4',    byte: [165, 0, 96, 16, 1, 4, 3, 33, 0, 32], buffer: Buffer.from('a5006010010403210020015e', 'hex'), hex: 'a5006010010403210020015e'}, byteWithChecksum: [165, 0, 96, 16, 1, 4, 3, 33, 0, 32, 1, 94], //intellicom use external command i think 4 (highest his is solar  priority) (possibley with 1 min timer?)
  pumpExternal_Speed3: {name: 'Exteral Speed 3',    byte: [165, 0, 96, 16, 1, 4, 3, 33, 0, 24], buffer: Buffer.from('a50060100104032100180156', 'hex'), hex: 'a50060100104032100180156'}, byteWithChecksum: [165, 0, 96, 16, 1, 4, 3, 33, 0, 24, 1, 86], //slow Speed
  pumpExternal_Speed2: {name: 'Exteral Speed 2',    byte: [165, 0, 96, 16, 1, 4, 3, 33, 0, 16], buffer: Buffer.from('a5006010010403210010014e', 'hex'), hex: 'a5006010010403210010014e'}, byteWithChecksum: [165, 0, 96, 16, 1, 4, 3, 33, 0, 16, 1, 78], //waterfall
  pumpExternal_Speed1: {name: 'Exteral Speed 1',    byte: [165, 0, 96, 16, 1, 4, 3, 33, 0, 8],  buffer: Buffer.from('a50060100104032100080146', 'hex'), hex: 'a50060100104032100080146'}, byteWithChecksum: [165, 0, 96, 16, 1, 4, 3, 33, 0, 8, 1, 70], //spa
  pumpExternal_Off:    {name: 'Exteral OFF',        byte: [165, 0, 96, 16, 1, 4, 3, 33, 0, 0],  buffer: Buffer.from('a5006010010403210000013e', 'hex'), hex: 'a5006010010403210000013e'}, byteWithChecksum: [165, 0, 96, 16, 1, 4, 3, 33, 0, 0, 1, 62],
  pumpGetStatus:       {name: 'Get Pump Status',    byte: [165, 0, 96, 16, 7, 0],               buffer: Buffer.from([165, 0, 96, 16, 7, 0, 1, 28]),     hex: 'A50961670128'},             byteWithChecksum: [165, 0, 96, 16, 7, 0, 1, 28],
  pump_PowerOn:        {name: 'Set Power On',       byte: [165, 0, 96, 16, 6, 1, 10],           buffer: Buffer.from('A500601006010A0126', 'hex'),       hex: 'A500601006010A0126',        byteWithChecksum:[165, 0, 96, 16, 6, 1, 10, 1, 38]},
  pump_PowerOff:       {name: 'Set Power Off',      byte: [165, 0, 96, 16, 6, 1, 4],            buffer: Buffer.from('A50060100601040120', 'hex'),       hex: 'A50060100601040120',        byteWithChecksum:[165, 0, 96, 16, 6, 1, 4, 1, 32]},
  runFilter:           {name: 'Speed Filter',       byte: [165, 0, 96, 16, 5, 1, 0]},
  runManual:           {name: 'Speed Manual',       byte: [165, 0, 96, 16, 5, 1, 1]},
  pumpSpeed1:          {name: 'Speed 1',            byte: [165, 0, 96, 16, 5, 1, 2]},
  pumpSpeed2:          {name: 'Speed 2',            byte: [165, 0, 96, 16, 5, 1, 3]},
  pumpSpeed3:          {name: 'Speed 3',            byte: [165, 0, 96, 16, 5, 1, 4]},
  pumpSpeed4:          {name: 'Speed 4',            byte: [165, 0, 96, 16, 5, 1, 5]},
  feature1:            {name: 'feature 1',          byte: [165, 0, 96, 16, 5, 1, 6]},
  saveAndRunExternal1: {name: 'Save & Run External 1', byte: [165, 0, 96, 16, 1, 4, 2, 196]}, //needs a speed high and low bit added on the end before the checksum
};

module.exports = {
  returnDefaultMessage(preBuiltMessage, destination = 96, source = 16, options = {name: null, log: true} ) {
    var log;
    if (!options) {
      name = defaultMessages[preBuiltMessage].name;
      log = true;
    } else {
      name = options.name || defaultMessages[preBuiltMessage].name;
      (options.log !== undefined && typeof options.log === 'boolean') ? log = options.log : log = true;
    }
    var message = defaultMessages[preBuiltMessage].byte.slice();
    message[2] = destination;
    message[3] = source;
    return { name, message, log };
  },

  buildMessage() {

  },

  returnDefaultByte (preBuiltMessage, destination = 96, source = 16, name) {
    name = name || module.exports[preBuiltMessage].name;
    var message = module.exports[preBuiltMessage].byte.slice();
    message[2] = destination;
    message[3] = source;
    return { name, byte: message };
  },

  addresses: {
    Chlorinator: [2, 16], // 	Chlorinator (This is a different type of packet)
    Broadcast: 15,
    Pool_controller: 16, // 	Pool controller (EasyTouch, intellicom, et al)
    RemoteWiredController: 32,
    RemoteWirelessController: 34, 	//(Screen Logic, or any apps that connect to it, like this one)
    Pump1: 96,
    Pump2: 97,
    Pump3: 98,
    Pump4: 99,
    Pump5: 100,
    Pump6: 101,
    Pump7: 102,
    Pump8: 103,
    Pump9: 104,
    Pump10: 105,
    Pump11: 106,
    Pump12: 107,
    Pump13: 108,
    Pump14: 109,
    Pump15: 110,
    Pump16: 111,
  }
};