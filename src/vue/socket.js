import moment from 'moment';

var sendDataToServer, pumpData;
var socket = io.connect();
var serverConnected = { status: false };
var savedPumpData = {
  watts: [],
  rpms: [],
  dates: [],
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
    if (savedPumpData.watts.length > 5000) {
      console.log('shrunk to smaller size');
      savedPumpData.watts.splice(3000);
      savedPumpData.rpms.splice(3000);
      savedPumpData.dates.splice(3000);
    }
    savedPumpData.watts.push(pumpData.watt);
    savedPumpData.rpms.push(pumpData.rpm);
    savedPumpData.dates.push(new Date());
  }
};


socket.on('connect', () => {
  console.log ('connected');
  serverConnected.status = true;
  socket.on('pumpDataReturn', function (data) {
    console.log('New Pump Data');
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


var getPumpDataBetweenTime = function (date1, date2, pumpName = 'Pump1') {
  return new Promise ((resolve, revoke) => {
    socket.emit('getPumpDataBetweenTime', date1, date2, pumpName, (err, data) => {
      if (err) {
        return revoke (err);
      }
      resolve (data);
    });
  });
};


var updatePumpData = function (powerData) {
  console.log('DataSize=' + powerData.length);
  var length = powerData.length;
  for (var i = 0; i < length; i++) {
    savedPumpData.watts[i] = powerData[i].watt;
    savedPumpData.rpms[i] = powerData[i].rpm;
    savedPumpData.dates[i] = new Date(powerData[i]._id);
  }
  savedPumpData.watts.splice(length);
  savedPumpData.rpms.splice(length);
  savedPumpData.dates.splice(length);
  // console.log('Time Difference2', startTime.getTime() - new Date().getTime());
};

var updatePumpDataFromBetweenTimes = function (time1, time2, pumpName = 'Pump1') {
  // var startTime = new Date();
  console.log(time1, time2);
  getPumpDataBetweenTime(time1, time2, pumpName)
    .then(updatePumpData)
    .catch(err => console.log(err));
};


var updatePumpDataFromStartOfTime = function (startDateIntervalString, pumpName = 'Pump1') {
  // var startTime = new Date();
  getPumpDataBetweenTime(new Date(), moment().startOf(startDateIntervalString).toDate())
    .then(updatePumpData)
    .catch(err => console.log(err));
};


export default pumpData;
export { socket,
  pumpData,
  setPumpData,
  alerts,
  serverConnected,
  savedPumpData,
  getPumpDataBetweenTime,
  updatePumpDataFromBetweenTimes,
  updatePumpDataFromStartOfTime
};