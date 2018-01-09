var os = require('os');  //to get os version so i can install some testings
var SerialPort = require('serialport');

//////// server, serial Port Functions //////////////////////
if (os.platform()==="win32"){
  const SerialPort = require('serialport/test');
  const MockBinding = SerialPort.Binding;
  const portPath = 'COM_ANYTHING';
  MockBinding.createPort(portPath, { echo: false, record: false });
  port = new SerialPort(portPath);

  port.on('open', () => {
    // To pretend to receive data (only works on open ports)
    port.binding.emitData(Buffer.from('Hi from my test!'));
  });
  // log received data
  port.on('data', (data) => {
    console.log('Received:\t', data.toString('utf8'));
  });
  // port.write('message', () => {
  //   console.log('Write:\t\t Complete!');
  //   console.log('Last write:\t', port.binding.lastWrite.toString('utf8'));
  // });

} else {
  var SerialPort = require('serialport');
  var port = new SerialPort('/dev/ttyUSB0', function (err) {
    if (err) {
      return console.log('Error: ', err.message);
    }
    console.log ('Serial Port Created')
  });



  // Switches the port into "flowing mode"
  port.on('data', function (data) {
    data = convertToDecArray (data)
    if  (data[4] === 7) {
      pumpData = parsePumpStatus(data);
      if (showPumpStatusInConsole) { console.log('Data Received:  [' + [... data] + "]"); }
      // console.log ("Pump Data Updated")
      try{
      pushPumpInfoToWebPages();
      // socket.emit("pumpData", pumpData)
      }
      catch (err) {
        console.log ("Error: Port:On: pushPUmpInfoToWebPages is not working")
        console.log('Status Received:  [' + [... data] + "]");
      }
      acknowledgment.status='found'
    }

    else if (acknowledgment.status === 'waiting For') {
     var check =  acknowledgment.isAcknowledgment(data)
      console.log(check)
      acknowledgment.status='found'
      console.log('Acknowledged:  [' + [... data] + "]");
      // acknowledgment.message.push(data);
      // acknowledgment.reset();
    }

    // else if (acknowledgment.status !== 'waiting For' || acknowledgment.isAcknowledgment(data) !== true) {
    //   console.log ('not acknowledgment', data)
    // }

    else if (Array.isArray(data) === false){
      console.log(data)
    }
    else {
      console.log('Data Received:  [' + [... data] + "]");
    }
  });
}