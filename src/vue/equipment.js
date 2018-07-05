var _equipment = {

};

var _createEquipmentDefault = function (name) {
  return {
    pumpData: {
      name,
      dateStart: null,
      dateEnd: null,
      watts: [],
      rpms: [],
      dates: [],
      stats: {
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
      }
    }
  };
};

var getEquipment = function (name) {
  if (!_equipment[name]) {
    return null;
  }
  return _equipment[name];
};

var createEquipment = function (name) {
  if (!getEquipment(name)) {
    _equipment[name] = _createEquipmentDefault (name);
  }
  return getEquipment(name);
};

var setPumpData = function (name, data) {
  var pumpData = getEquipment(name);
  if (data) {
    if (data.state === 4) {
      data.state = 'No';
    } else if (data.state === 10) {
      data.state = 'Yes';
    }
    Object.assign(pumpData.stats, data);
  } else {
    Object.assign(pumpData.stats, pumpDataDefault);
  }
};

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


module.exports = {
  createEquipment,
  getEquipment,
  setEquipment,
  setPumpData,
  storePumpData
};