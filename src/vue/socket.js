var sendDataToServer, pumpData;
var socket = io.connect();
var serverConnected = { status: false };
var savedPumpData = {
  watts: [],
  rpms: [],
  times: [],
};
var alerts = {
  'Pump1': {
    'Maintance Mode': {
      color: 'yellow',
      enabled: false
    },
    'Disconnected': {
      color: 'red',
      enabled: false
    },
  }
};

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
    if (data.state === 4) {
      data.state = 'No';
    } else if (data.state === 10) {
      data.state = 'Yes';
    }
    Object.assign(pumpData, data);
  } else {
    Object.assign(pumpData, pumpDataDefault);
  }
};
setPumpData();

var storePumpData = function (pumpData) {
  if (typeof pumpData.watt === 'number' && typeof pumpData.rpm === 'number') {
    if (savedPumpData.watts.length > 2000) {
      savedPumpData.watts.splice(1500);
      savedPumpData.rpms.splice(1500);
      savedPumpData.times.splice(1500);
    }
    savedPumpData.watts.push(pumpData.watt);
    savedPumpData.rpms.push(pumpData.rpm);
    savedPumpData.times.push(new Date());
    console.log ('updated');
  } else {
    console.log ('not updated');
  }
};



socket.on('connect', () => {
  console.log ('connected');
  serverConnected.status = true;
  socket.on('pumpDataReturn', function (data) {
    storePumpData(data);
    setPumpData(data);
  });

  socket.on('disconnect', () => {
    console.log ('disconnected');
    setPumpData();
    serverConnected.status = false;
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


var findPumpDataBetweenTime = function (date1, date2, pumpName = 'Pump1') {
  return new Promise ((resolve, revoke) => {
    socket.emit('getPumpDataBetweenTime', date1, date2, pumpName, (err, data) => {
      if (err) {
        return revoke (err);
      }
      resolve (data);
    });
  });
};


export default pumpData;
export { socket, pumpData, setPumpData, alerts, serverConnected, savedPumpData, findPumpDataBetweenTime };

// import moment from 'moment';
// findPumpDataBetweenTime(new Date(), moment().startOf('week').toDate())
//   .then(sumPower => console.log (sumPower))
//   .catch(err => console.log(err));
