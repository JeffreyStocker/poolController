

// var socket=io('http://localhost:8181');
var socket = io.connect();


  

// function pumpOff (){
// 	socket.emit('pump off')
// 	console.log("pump off");
// }

// function speed1 (){
// 	socket.emit('Pump Speed 1')
// 	console.log("Pump Speed 1");
// }

// function speed2 (){
// 	socket.emit('Pump Speed 2')
// 	console.log("Pump Speed 2");
// }

// function speed3 (){
// 	socket.emit('Pump Speed 3')
// 	console.log("Pump Speed 3");
// }

// function speed4 (){
// 	socket.emit('Pump Speed 4')
// 	console.log("Pump Speed 4");
// }



$('document').ready(function () {

	$('#powerOn').click(function (){
		socket.emit('pumpPower', 'on')
	})

	$('#powerOff').click(function (){
		socket.emit('pumpPower', 'off')
	})

	$('#powerToggle').click(function (){
		socket.emit('pumpPower', 'toggle')
	})

	$('#speed1').click(function (){
		socket.emit('intellicom', 1)
	})
	
	$('#speed2').click(function (){
		socket.emit('intellicom', 2)
	})

	$('#speed3').click(function (){
		socket.emit('intellicom', 3)
	})

	$('#speed4').click(function (){
		socket.emit('intellicom', 4)
	})

	$('.speedOff').click(function (){
		socket.emit('intellicom', 0)
	})

	$('#test').click(function (){
		socket.emit('test_runpumpSpeedAt1000RPM')
	})

	$('#toggleStatusUpdates').click(function (){
		socket.emit('toggleStatusUpdate')
	})

	$('#pumpStatus').click(function (){
		socket.emit('pumpData')
	})

	$('#pumpStatusForce').click(function (){
		socket.emit('pumpDataForceUpdate')
	})

	
	$('#runPumpAtSpeed').click(function (){
		socket.emit('runPumpAtSpeed', $('#speedInput').val() ) 
	})
	
	$('#setPumpTimer').click(function (){
		socket.emit('setPumpTimer', $('#timerInMin').val() ) 
	})

	$('#pumpControlSetToRemote').click(function (){
		socket.emit('pumpControlPanelState', 'remote')
	})
	$('#pumpControlSetToLocal').click(function (){
		socket.emit('pumpControlPanelState', 'local')
	})
	$('#pumpControlSetToggle').click(function (){
		socket.emit('pumpControlPanelState', 'toggle')
	})



	socket.emit('pumpData')
})




	// ('http://localhost');
	socket.on('pumpDataReturn', function (data) {
		console.log(data);
		// alert(JSON.stringify(data))
		data.state===4 ? $('#pumpState').text('Off') : $('#pumpState').text('On')
		// $('#pumpState').text(data.state)
		data.timer === "0:0" ? $('#PumpTimers').text("Off") : $('#PumpTimers').text(data.timer)
		// $('#PumpTimers').text(data.timer)
		$('#pumpRPM').text(data.rpm)
		$('#pumpWatt').text(data.watt)


		$('#pumpSource').text(data.source)
		$('#pumpDestination').text(data.destination)
		$('#pumpAction').text(data.action)
		$('#pumpLength').text(data.length)
		$('#pumpDriveState').text(data.driveState)
		$('#pumpPpc').text(data.ppc)

		$('#pumpWatt').text(data.watt)
		$('#pumpWatt').text(data.watt)
		});

		// destination:  data[2],
    // source:       data[3],
    // action:       data[4],
    // length:       data[5],
    // state:         data[6], //4= off, 10 = on //power i think
    // driveState:   data[7],
    // ppc:          data[8],
    // wattHighBit:  data[9], 
    // wattLowBit:   data[10],
    // rpmHighBit:   data[11],
    // rpmLowBit:    data[12],
    // timerHighBit: data[15],
    // timerLowBit:  data[18],
    // timeHours:    data[19],
    // timeMin:      data[20]