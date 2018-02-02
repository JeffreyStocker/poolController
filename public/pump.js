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
    console.log ($('input').val());

    for (var i = 5; i < 30; i++) {
      var val = $('#' + i).val();
      if (val === undefined) { break; }
      packet[i] = val;
    }
    console.log (packet);
    // socket.emit('sendManualPumpPacket', 'off', () => {
    //   confirmMessage();
    // });
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

    $('#pumpWatt').text(data.watt);
    $('#pumpWatt').text(data.watt);
  });
});


var returnHighBit = function (value) {
  return parseInt(value / 256);
};

var returnLowBit = function  (value) {
  return value % 256;
};

var combineHighPlusLowBit = function (highBit, lowBit) {
  //returns the checksum, calculated from the high Bit and Low bit
  return highBit * 256 + lowBit;
};