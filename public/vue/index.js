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
  props: ['buttonEvent', 'name'],
  template:
  `<button
    v-on:click="button"
  > {{name}} </button>`,
  methods: {
    button: function () {
      if (this.buttonEvent && typeof this.buttonEvent === 'function') {
        this.buttonEvent();
      } else {
        console.log ('button');
      }
    }
  }
});

Vue.component('groupOfButtons', {
  props: ['group'],
  template:
  `<div>
    <buttonX
      v-for="(indv, key) in group"
      v-bind:key="key"
      v-bind:name="indv.name"
      v-bind:buttonEvent="indv.event"
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
      <div>Running:
        <span class="pumpState bold" id="pumpState"> {{ pumpData.state }} </span>
        <span> Timer: <span class="PumpTimers bold" id="">{{ pumpData.timers }} </span></span>
			</div>

      <div>RPM:
        <span class="pumpRPM bold" id="pumpRPM"> {{ pumpData.rpm }} </span>
				<span> Watts: <span class="pumpWatt bold" id="pumpWatt"> {{ pumpData.watt }} </span> </span>
			</div>

			<div>action:
				<span class="pumpAction bold" id="pumpAction"> {{ pumpData.action }} </span>
				<span> Time: <span class="timeCurrent bold"> {{ pumpData.timeCurrent }} </span> </span>
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
      <div>Destination:
        <span class="pumpDestination bold" id="pumpDestination"> {{ pumpData.destination }}</span>
        <span> Source: <span class="pumpSource bold" id="pumpSource"> {{ pumpData.source }} </span> </span>
      </div>
      <div>driveState:
        <span class="pumpDriveState bold" id="pumpDriveState"> {{ pumpData.driveState }}</span>
				<span> ppc: <span class="pumpPpc bold" id="pumpPpc"> {{ pumpData.ppc }}</span> </span>
			</div>

      <div>Unknown1:
        <span class="unknown1 bold"> {{ pumpData.unknown1 }} </span>
				<span> Unknown2: <span class="unknown2 bold"> {{ pumpData.unknown2 }} </span></span>
			</div>

      <div>Unknown3:
        <span class="unknown3 bold"> {{ pumpData.unknown3 }} </span>
				<span> Unknown4: <span class="unknown4 bold"> {{ pumpData.unknown4 }} </span> </span>
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