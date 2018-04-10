var sendDataToServer, pumpData;
var socket = io.connect();

var pumpData = {
  rpm: '--',
  state: '--',
  timer: '--',
  watt: '--',
  source: '--',
  destination: '--',
  action: '--',
  driveState: '--',
  ppc: '--',
  unknown1: '--',
  unknown2: '--',
  unknown3: '--',
  unknown4: '--',
  timeCurrent: '--',
};

var pumpDataDefault = {
  rpm: '--',
  state: '--',
  timer: '--',
  watt: '--',
  source: '--',
  destination: '--',
  action: '--',
  driveState: '--',
  ppc: '--',
  unknown1: '--',
  unknown2: '--',
  unknown3: '--',
  unknown4: '--',
  timeCurrent: '--',
};


var setPumpData = function (data) {
  if (data) {
    if (data.state === 4) { data.state = 'No' }
    else if (data.state === 10) { data.state = 'Yes' }
    Object.assign(pumpData, data);
  } else {
    Object.assign(pumpData, pumpDataDefault);
  }
};
setPumpData();


socket.on('connect', () => {
  socket.on('pumpDataReturn', function (data) {
    setPumpData(data);
  });

  socket.on('disconnect', () => {
    setPumpData();
  });

  sendDataToServer = function (socketCommand, ...data) {
    socket.emit(socketCommand, ...data, (err, returnData) => {
      if (err) {
        console.log(err);

      } else {
        console.log('success sending commands');
      }
    });
  };
});

export default pumpData;
export { socket, pumpData };