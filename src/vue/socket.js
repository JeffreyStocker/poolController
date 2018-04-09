var sendDataToServer, pumpData;
var socket = io.connect();

var setPumpData = function (data) {
  pumpData = data || {
    rpm: '--',
    state: '--',
    timer: '--',
    watt: '--',
    source: '--',
    destination: '--',
    action: '--',
    driveState: '--',
    ppc: '--',
    watt: '--',
    unknown1: '--',
    unknown2: '--',
    unknown3: '--',
    unknown4: '--',
    timeCurrent: '--',
  };
};
setPumpData();
export default pumpData;
export { socket };

socket.on('connect', () => {
  console.log('connected');
  sendDataToServer = function (socketCommand, ...data) {
    socket.emit(socketCommand, ...data, (err, returnData) => {
      if (err) {
        console.log(err);

      } else {
        console.log('success sending commands');
      }
    });
  };

  socket.on('pumpDataReturn', function (data) {
    console.log (data);
    setPumpData(data);
  });

  socket.on('disconnect', () => {
    setPumpData();
  });
});