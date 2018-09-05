import moment from 'moment/min/moment.min';
import Timer from '../../server/TimeTracker.js';

var sendDataToServer, pumpData;
var socket = io.connect();
var serverConnected = { status: false };
var savedPumpData = {
  watts: [],
  rpms: [],
  dates: [],
  power: []
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
    if (savedPumpData.watts.length > 500000) {
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


var getPumpDataBetweenTime = function (date1, date2, pumpName) {
  return new Promise ((resolve, revoke) => {
    socket.emit('getPumpDataBetweenTime', date1, date2, pumpName, (err, data) => {
      if (err) {
        return revoke (err);
      }
      resolve (data);
    });
  });
};

var resetArrays = function (savedPumpData) {
  savedPumpData.watts.length = 0;
  savedPumpData.rpms.length = 0;
  savedPumpData.dates.length = 0;
  savedPumpData.power.length = 0;
};

var updatePumpData = function (powerData) {
  console.log('DataSize=' + powerData.length);
  var length = powerData.length;
  resetArrays(savedPumpData);
  for (var i = 0; i < length; i++) {
    savedPumpData.watts[i] = powerData[i].watt;
    savedPumpData.rpms[i] = powerData[i].rpm;
    savedPumpData.dates[i] = new Date(powerData[i]._id);

    // savedPumpData.watts.push(powerData[i].watt);
    // savedPumpData.rpms.push(powerData[i].rpm);
    // savedPumpData.dates.push(new Date(powerData[i].endTime));

    // savedPumpData.watts.push(powerData[i].watt);
    // savedPumpData.rpms.push(powerData[i].rpm);
    // savedPumpData.dates.push(new Date(powerData[i].startTime));

    savedPumpData.power[i] = powerData[i].powerUsed === undefined ? 0 : powerData[i].powerUsed;
  }
  savedPumpData.watts.splice(length);
  savedPumpData.rpms.splice(length);
  savedPumpData.dates.splice(length);
  savedPumpData.power.splice(length);
  // console.log('Time Difference2', startTime.getTime() - new Date().getTime());
};

var updatePumpDataFromBetweenTimes = function (time1, time2, pumpName, callback = () => {}) {
  var timer = new Timer('updatePumpDataFromBetweenTimes');

  getPumpDataBetweenTime(time1, time2, pumpName)
    .then((data) => {
      timer.mark('xxx');
      updatePumpData(data);
    })
    .catch(err => console.error(err))
    .then (() => {
      timer.end();
      callback ();
    });
};


var updatePumpDataFromStartOfTime = function (startDateIntervalString, pumpName, callback = () => {}) {
  getPumpDataBetweenTime(new Date(), moment().startOf(startDateIntervalString).toDate(), pumpName)
    .then(updatePumpData)
    .catch(err => console.error(err))
    .then (() => { callback (); });
};

var getBarChartData = async function (equipmentName, date1, date2) {
  return new Promise ((resolve, revoke) => {
    socket.emit('summaryaPumpData', date1, date2, (err, data) => {
      if (err) {
        revoke (err);
      } else {
        resolve(data);
      }
    });
  });
};


export default pumpData;
export {
  alerts,
  getBarChartData,
  getPumpDataBetweenTime,
  pumpData,
  setPumpData,
  serverConnected,
  savedPumpData,
  socket,
  updatePumpDataFromBetweenTimes,
  updatePumpDataFromStartOfTime
};