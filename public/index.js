// var socket=io('http://localhost:8181');
var setPumpData = function (data) {
  data = data || {
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
  // data.rpm = data.rpm || '-';
  // data.state = data.state || '-';
  // data.timer = data.timer || '-';
  // data.watt = data.watt || '-';
  // data.source = data.source || '-';
  // data.destination = data.destination || '-';
  // data.action = data.action || '-';
  // data.driveState = data.driveState || '-';
  // data.ppc = data.ppc || '-';
  // data.watt = data.watt || '-';
  // data.unknown1 = data.unknown1 || '-';
  // data.unknown2 = data.unknown2 || '-';
  // data.unknown3 = data.unknown3 || '-';
  // data.unknown4 = data.unknown4 || '-';
  // data.timeCurrent = data.timeCurrent || '-';

  if (data.state === 4) {
    $('.pumpState').text('No');
  } else if (data.state === 10) {
    $('.pumpState').text('yes');
  } else {
    $('.pumpState').text('--');
  }
  data.timer === '0:0' ? $('.PumpTimers').text('Off') : $('.PumpTimers').text(data.timer);
  $('.pumpRPM').text(data.rpm);
  $('.pumpWatt').text(data.watt);

  $('.pumpSource').text(data.source);
  $('.pumpDestination').text(data.destination);
  $('.pumpAction').text(data.action);
  $('.pumpLength').text(data.length);
  $('.pumpDriveState').text(data.driveState);
  $('.pumpPpc').text(data.ppc);

  $('.pumpWatt').text(data.watt);

  $('.unknown1').text(data.unknown1);
  $('.unknown2').text(data.unknown2);
  $('.unknown3').text(data.unknown3);
  $('.unknown4').text(data.unknown4);

  $('.timeCurrent').text(data.timeCurrent);

  // $('.timeHours').text(data.timeHours);
  // $('.timeMin').text(data.timeMin);
  // $('.unknown4').text(data.unknown4);
  // $('.unknown4').text(data.unknown4);
};





// function pumpOff (){
// 	socket.emit('pump off')
// 	console.log('pump off');
// }

// function speed1 (){
// 	socket.emit('Pump Speed 1')
// 	console.log('Pump Speed 1');
// }

// function speed2 (){
// 	socket.emit('Pump Speed 2')
// 	console.log('Pump Speed 2');
// }

// function speed3 (){
// 	socket.emit('Pump Speed 3')
// 	console.log('Pump Speed 3');
// }

// function speed4 (){
// 	socket.emit('Pump Speed 4')
// 	console.log('Pump Speed 4');
// }
var socket, messageTimer;
var showMessage = function () {
  $('.message').text('Message Sent');
  messageTimer = setTimeout(() => {
    $('.message').html('&nbsp;');
  }, 2000);
};

var confirmMessage = function () {
  $('.message').text('Message Confirmed');
  // alert('received')
  messageTimer = setTimeout(() => {
    $('.message').html('&nbsp;');
  }, 2000);
};


$('document').ready(function () {
  socket = io.connect();

  socket.on('disconnect', function () {
    setPumpData();
  });


  $('.powerOn').click(function () {
    socket.emit('pumpPower', 'on', confirmMessage);
    showMessage();
  });

  $('.powerOff').click(function () {
    socket.emit('pumpPower', 'off', confirmMessage);
  });

  $('.powerToggle').click(function () {
    socket.emit('pumpPower', 'toggle', confirmMessage);
    showMessage();
  });

  $('.speed1').click(function () {
    socket.emit('runSpeed', 1, confirmMessage);
    showMessage();
  });

  $('.speed2').click(function () {
    socket.emit('runSpeed', 2, confirmMessage);
    showMessage();
  });

  $('.speed3').click(function () {
    socket.emit('runSpeed', 3, confirmMessage);
    showMessage();
  });

  $('.speed4').click(function () {
    socket.emit('runSpeed', 4, confirmMessage);
    showMessage();
  });

  $('.external1').click(function () {
    socket.emit('intellicom', 1, confirmMessage);
    showMessage();
  });

  $('.external2').click(function () {
    socket.emit('intellicom', 2, confirmMessage);
    showMessage();
  });

  $('.external3').click(function () {
    socket.emit('intellicom', 3, confirmMessage);
    showMessage();
  });

  $('.external4').click(function () {
    socket.emit('intellicom', 4, confirmMessage);
    showMessage();
  });

  $('.externalOff').click(function () {
    socket.emit('intellicom', 0, confirmMessage);
    showMessage();
  });

  $('.test').click(function () {
    socket.emit('test_runpumpSpeedAt1000RPM', confirmMessage);
    showMessage();
  });

  $('.toggleStatusUpdates').click(function () {
    socket.emit('toggleStatusUpdate', confirmMessage);
    showMessage();
  });

  $('.pumpStatus').click(function () {
    socket.emit('pumpData', confirmMessage);
    showMessage();
  });

  $('.pumpStatusForce').click(function () {
    socket.emit('pumpDataForceUpdate', confirmMessage);
    showMessage();
  });


  $('.runPumpAtSpeed').click(function () {
    socket.emit('runPumpAtSpeed', $('.speedInput').val(), confirmMessage );
    showMessage();
  });

  $('.setPumpTimer').click(function () {
    socket.emit('setPumpTimer', $('.timerInMin').val(), confirmMessage );
    showMessage();
  });

  $('.pumpControlSetToRemote').click(function () {
    socket.emit('pumpControlPanelState', 'remote', confirmMessage);
    showMessage();
  });

  $('.pumpControlSetToLocal').click(function () {
    socket.emit('pumpControlPanelState', 'local', confirmMessage);
    showMessage();
  });

  $('.pumpControlSetToLocalOverride').click(function () {
    socket.emit('pumpControlSetToLocalOverride', 'local', confirmMessage);
    showMessage();
  });

  $('.pumpControlSetToggle').click(function () {
    socket.emit('pumpControlPanelState', 'toggle', confirmMessage);
    showMessage();
  });

  socket.on('confirm', function () {
    console.log ('running');
  });


  // socket.emit('pumpData')

  // ('http://localhost');

  socket.on('pumpDataReturn', function (data) {
    setPumpData(data);
    // // console.log(data);
    // // alert(JSON.stringify(data))
    // data.state === 4 ? $('.pumpState').text('No') : $('.pumpState').text('Yes');
    // // $('.pumpState').text(data.state)
    // data.timer === '0:0' ? $('.PumpTimers').text('Off') : $('.PumpTimers').text(data.timer);
    // // $('.PumpTimers').text(data.timer)
    // $('.pumpRPM').text(data.rpm);
    // $('.pumpWatt').text(data.watt);


    // $('.pumpSource').text(data.source);
    // $('.pumpDestination').text(data.destination);
    // $('.pumpAction').text(data.action);
    // $('.pumpLength').text(data.length);
    // $('.pumpDriveState').text(data.driveState);
    // $('.pumpPpc').text(data.ppc);

    // $('.pumpWatt').text(data.watt);


    // $('.unknown1').text(data.unknown1);
    // $('.unknown2').text(data.unknown2);
    // $('.unknown3').text(data.unknown3);
    // $('.unknown4').text(data.unknown4);

    // $('.timeCurrent').text(data.timeCurrent);

    // // $('.timeHours').text(data.timeHours);
    // // $('.timeMin').text(data.timeMin);
    // // $('.unknown4').text(data.unknown4);
    // // $('.unknown4').text(data.unknown4);
  });

  // var pumpData = {
  //   destination:  data[2],
  //   source:       data[3],
  //   action:       data[4],
  //   length:       data[5],
  //   state:        data[6], //4= off, 10 = on //power i think
  //   driveState:   data[7],
  //   ppc:          data[8],
  //   wattHighBit:  data[9],
  //   wattLowBit:   data[10],
  //   rpmHighBit:   data[11],
  //   rpmLowBit:    data[12],
  //   unknown1:     data[13],
  //   unknown2:     data[14],
  //   timerHighBit: data[15],
  //   unknown3:     data[16],
  //   unknown4:     data[17],
  //   timerLowBit:  data[18],
  //   timeHours:    data[19],
  //   timeMin:      data[20]
  // };
});




