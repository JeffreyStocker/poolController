/////// packet Information /////////////////////////
/*
speed #, Higher # higher priority
soler 4
slow speed 3
waterfall speed 2
heater/spa speed 1
*/
module.exports = {
  prefix: [255, 0, 255, 165, 0],
  shortPrefix: [255, 0, 255],
  pumpToRemote:        {packet: Buffer.from('a50060100401ff0219', 'hex'),       name: 'Set Pump to Remote',  hex: 'a50060100401ff0219',       byte: [165, 0, 96, 16, 4, 1, 255, 2, 25 ]}, //intellicom set pump to remote  //works
  pumpToLocal:         {packet: Buffer.from('a5006010040100011a', 'hex'),       name: 'Set Pump to Local',   hex: 'a5006010040100011a',       byte: [165, 0, 96, 16, 4, 1, 0, 1, 26 ]},
  pumpExternal_Speed4: {packet: Buffer.from('a5006010010403210020015e', 'hex'), name: 'Exteral Speed 4',     hex: 'a5006010010403210020015e', byte: [165, 0, 96, 16, 1, 4, 3, 33, 0, 32, 1, 94 ]}, //intellicom use external command i think 4 (highest his is solar  priority) (possibley with 1 min timer?)
  pumpExternal_Speed3: {packet: Buffer.from('a50060100104032100180156', 'hex'), name: 'Exteral Speed 3',     hex: 'a50060100104032100180156', byte: [165, 0, 96, 16, 1, 4, 3, 33, 0, 24, 1, 86 ]}, //slow Speed
  pumpExternal_Speed2: {packet: Buffer.from('a5006010010403210010014e', 'hex'), name: 'Exteral Speed 2',     hex: 'a5006010010403210010014e', byte: [165, 0, 96, 16, 1, 4, 3, 33, 0, 16, 1, 78 ]}, //waterfall
  pumpExternal_Speed1: {packet: Buffer.from('a50060100104032100080146', 'hex'), name: 'Exteral Speed 1',     hex: 'a50060100104032100080146', byte: [165, 0, 96, 16, 1, 4, 3, 33, 0, 8, 1, 70 ]}, //spa
  pump_Off:            {packet: Buffer.from('a5006010010403210000013e', 'hex'), name: 'Speed OFF',           hex: 'a5006010010403210000013e', byte: [165, 0, 96, 16, 1, 4, 3, 33, 0, 0, 1, 62]},
  pumpGetStatus:       {packet: Buffer.from([165, 0, 96, 16, 7, 0, 1, 28]),     name: 'Get Pump Status',     hex: 'A50961670128',             byte: [165, 0, 96, 16, 7, 0, 1, 28]},
  pump_PowerOn:        {packet: Buffer.from('A500601006010A0126', 'hex'),       name: 'Set Power On',        hex: 'A500601006010A0126',       byte:[165, 0, 96, 16, 6, 1, 10], byteWithChecksum:[165, 0, 96, 16, 6, 1, 10, 1, 38]},
  pump_PowerOff:       {packet: Buffer.from('A50060100601040120', 'hex'),       name: 'Set Power Off',       hex: 'A50060100601040120',       byte:[165, 0, 96, 16, 6, 1, 4], byteWithChecksum:[165, 0, 96, 16, 6, 1, 4, 1, 32]},
};

module.exports.addresses = {
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
};