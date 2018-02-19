var socket;

var showMessage = function () {
  $('#message').text('Message Sent');
  messageTimer = setTimeout(() => {
    $('#message').html('&nbsp;');
  }, 2000);
};

var confirmMessage = function () {
  $('#message').text('Message Confirmed');
  // alert('received')
  messageTimer = setTimeout(() => {
    $('#message').html('&nbsp;');
  }, 2000);
};


$('document').ready(function () {
  socket = io.connect();

  $('#Submit').click(function () {
    var packet = [];

    for (var i = 1; i < 99; i++) {
      var val = $('#' + i).val();
      if (val === undefined || val === '') { continue; }
      packet.push(+val);
    }
    // console.log (packet);
    var font = packet.slice(0, 3);
    var end = packet.slice(3);

    var newPacket = [165, 0].concat(font, end.length, end);
    console.log (newPacket);

    socket.emit('manualPacket', newPacket, () => {
      confirmMessage();
    });
  });

  socket.on('pumpDataReturn', function (data) {
    // console.log(data);
    // alert(JSON.stringify(data))
    data.state === 4 ? $('#pumpState').text('Off') : $('#pumpState').text('On');
    // $('#pumpState').text(data.state)
    data.timer === '0:0' ? $('#PumpTimers').text('Off') : $('#PumpTimers').text(data.timer);
    // $('#PumpTimers').text(data.timer)
    $('#pumpRPM').text(data.rpm);
    $('#pumpWatt').text(data.watt);
    $('#pumpSource').text(data.source);
    $('#pumpDestination').text(data.destination);
    $('#pumpAction').text(data.action);
    $('#pumpLength').text(data.length);
    $('#pumpDriveState').text(data.driveState);
    $('#pumpPpc').text(data.ppc);
  });


  $('#external1').on('click',
    ()=>{ parseValueIntoPumpHtmlPage([96, 16, 1, 'length', 3, 33, 0, 8]); });

  $('#external2').on('click',
    ()=>{ parseValueIntoPumpHtmlPage([96, 16, 1, 'length', 3, 33, 0, 16]); });

  $('#external3').on('click',
    ()=>{ parseValueIntoPumpHtmlPage([96, 16, 1, 'length', 3, 33, 0, 24]); });

  $('#external4').on('click',
    ()=>{ parseValueIntoPumpHtmlPage([96, 16, 1, 'length', 3, 33, 0, 32]); });

  $('#externalOff').on('click',
    ()=>{ parseValueIntoPumpHtmlPage([96, 16, 1, 'length', 3, 33, 0, 0]); });

  $('#SpeedFilter').on('click',
    ()=>{ parseValueIntoPumpHtmlPage([96, 16, 5, 'length', 0]); });

  $('#SpeedManual').on('click',
    ()=>{ parseValueIntoPumpHtmlPage([96, 16, 5, 'length', 1]); });

  $('#Speed1').on('click',
    ()=>{ parseValueIntoPumpHtmlPage([96, 16, 5, 'length', 2]); });

  $('#Speed2').on('click',
    ()=>{ parseValueIntoPumpHtmlPage([96, 16, 5, 'length', 3]); });

  $('#Speed3').on('click',
    ()=>{ parseValueIntoPumpHtmlPage([96, 16, 5, 'length', 4]); });

  $('#Speed4').on('click',
    ()=>{ parseValueIntoPumpHtmlPage([96, 16, 5, 'length', 5]); });

  $('#SpeedFeature1').on('click',
    ()=>{ parseValueIntoPumpHtmlPage([96, 16, 5, 'length', 6]); });

  $('#external1Save').on('click',
    ()=>{ parseValueIntoPumpHtmlPage([96, 16, 1, 'length', 3, 39, 0, 0]); });

  $('#external2Save').on('click',
    ()=>{ parseValueIntoPumpHtmlPage([96, 16, 1, 'length', 3, 40, 0, 0]); });

  $('#external3Save').on('click',
    ()=>{ parseValueIntoPumpHtmlPage([96, 16, 1, 'length', 3, 41, 0, 0]); });

  $('#external4Save').on('click',
    ()=>{ parseValueIntoPumpHtmlPage([96, 16, 1, 'length', 3, 42, 0, 0]); });

  $('#externalTimer').on('click',
    ()=>{ parseValueIntoPumpHtmlPage([96, 16, 1, 'length', 3, 43, 0, 0]); });

  $('#runAtSpeed').on('click',
    ()=>{ parseValueIntoPumpHtmlPage([96, 16, 4, 'length', 196]); });

  $('#runAtGPM').on('click',
    ()=>{ parseValueIntoPumpHtmlPage([96, 16, 4, 'length', 228]); });

  $('#runSpeedWithoutProgram').on('click',
    ()=>{ parseValueIntoPumpHtmlPage([96, 16, 1, 'length', 2, 196]); });

  $('#runSpeedWithoutProgram1000RPM').on('click',
    ()=>{ parseValueIntoPumpHtmlPage([96, 16, 1, 'length', 2, 196, 3, 232]); });

});

var parseValueIntoPumpHtmlPage = function (values) {
  var count = 0;
  for (var i = 0; i < 30; i++) {
    if (value[i] === 'length') {
      continue;
    }
    if (i < values.length ) {
      $('#' + (i + count)).val(values[i]);
    } else {
      $('#' + (i + count)).val('');
    }
    count++;
  }
};


var returnHighBit = function (value) {
  return parseInt(value / 256);
};

var returnLowBit = function (value) {
  return value % 256;
};

var combineHighPlusLowBit = function (highBit, lowBit) {
  //returns the checksum, calculated from the high Bit and Low bit
  return highBit * 256 + lowBit;
};