var socket = io.connect();
var sendDataToServer, pumpData;

var message = '';
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

});


Vue.component('buttonX', {
  props: ['button'],
  template:
  `<button
    v-on-click="button.click"
  > {{button}} </button>`,
});

Vue.component('groupOfButtons', {
  props: ['group'],
  template:
  `<div>
    <buttonX
      v-for="(indv, key) in group"
      v-bind:key="key"
      v-bind:button="indv.name"
      v-on-click
      >
    </buttonX>
  </div>`
});

Vue.component('pumpStatus', {
  props: ['pumpData'],
  template: `
  <div class='center' v-on:click='showExtended=!showExtended'>
			<div>Pump Info</div>
			<pumpStatusData v-bind:pumpData='pumpData'></pumpStatusData>
			<pumpStatusDataExtended v-bind:pumpData='pumpData' v-show='showExtended'></pumpStatusDataExtended>

			<div class="message" id="message"> {{ message }}</div>
		</div>
  `,
  data: function () {
    return {
      message,
      showExtended: false};
  }
});

Vue.component('pumpStatusData', {
  props: ['pumpData'],
  template: `
    <div>
			<div>Running:<b>
				<span class="pumpState" id="pumpState"> {{ pumpData.state }}</span></b>
				<span> Timer:<b><span class="PumpTimers" id="">{{ pumpData.timers }}</span></b>  </span>
			</div>

			<div>RPM:<b><span class="pumpRPM" id="pumpRPM"> {{ pumpData.rpm }} </span></b>
				<span> Watts:<b><span class="pumpWatt" id="pumpWatt"> {{ pumpData.watt }} </span></b> </span>
			</div>

			<div>action:<b>
				<span class="pumpAction" id="pumpAction"> {{ pumpData.action }}</span></b>
				<span> Time:<b><span class="timeCurrent">{{ pumpData.timeCurrent }}</span></b> </span>
			</div>
		</div>
  `,
  data: function () {
    return {message};
  }
});

Vue.component('pumpStatusDataExtended', {
  props: ['pumpData'],
  template: `
    <div>
      <div>Destination:<b>
        <span class="pumpDestination" id="pumpDestination"> {{ pumpData.destination }}</span></b>
        <span> Source: 	<b><span class="pumpSource" id="pumpSource"> {{ pumpData.source }} </span></b> </span>
      </div>
			<div>driveState:<b><span class="pumpDriveState" id="pumpDriveState"> {{ pumpData.driveState }}</span></b>
				<span> ppc: 	<b><span class="pumpPpc" id="pumpPpc"> {{ pumpData.ppc }}</span></b> </span>
			</div>

			<div>Unknown1:<b><span class="unknown1"> {{ pumpData.unknown1 }} </span></b>
				<span> Unknown2: 	<b><span class="unknown2"> {{ pumpData.unknown2 }}</span></b> </span>
			</div>

			<div>Unknown3:<b><span class="unknown3"> {{ pumpData.unknown3 }}</span></b>
				<span> Unknown4: 	<b><span class="unknown4"> {{ pumpData.unknown4 }}</span></b> </span>
      </div>
    </div>
  `,
  data: function () {
    return {message};
  }
});

var app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!',
    items: [[{name: 'test'}], [{name: 'test2'}], [{name: 'test3'}]],
    pumpData: pumpData,
    showExtended: false
  },
  template: `
  <div>
    <pumpStatus v-bind:pumpData='pumpData'></pumpStatus>

    <groupOfButtons
      v-for="(item, num) in items"
      v-bind:group="item"
      v-bind:key="num"
      >
    </groupOfButtons>
  </div>
  `
});