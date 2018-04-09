import Vue from 'vue';
import GroupOfButtons from './components/GroupOfButtons.vue';
import OnlyButtons from './components/OnlyButtons.vue';
import PumpStatus from './components/PumpStatus.vue';
import PumpPower from './components/PumpPower.vue';
import SelectedPumpControl from './components/SelectedPumpControl.vue';
import StatusMessage from './components/statusMessage.vue';
import { clearTimeout } from 'timers';

var sendDataToServer;
var messageTimer;
var message = ' ';

var tests = {"Pump Control": ['test', 'test2', 'test3'], name2: ['test', 'test2', 'test3']};


var app = new Vue({
  el: '#app',
  data: {
    message: ' ',
    items: [[{name: 'test'}], [{name: 'test2'}], [{name: 'test3'}]],
    showExtended: false,
    buttonData: {
      "Pump Controls": {
        'Power On': ['pumpPower', 'on'],
        'Power Off': ['pumpPower', 'on'],
        "Toggle Power": ['pumpPower', 'toggle'],
        "Local": ['pumpControlPanelState', 'local'],
        "Remote": ['pumpControlPanelState', 'remote'],
      },
      "External Controls" : {
        '1: SPA': ['intellicom', '1'],
        '2: Waterfall': ['intellicom', '2'],
        "3: Slow": ['intellicom', '3'],
        "4: Solar": ['intellicom', '4']
      },
      "Speed Controls" : {
        'Program 1': ['runSpeed', '1'],
        'Program 2': ['runSpeed', '2'],
        "Program 3": ['runSpeed', '3'],
        "Program 4": ['runSpeed', '4']
      }
    },
    savePumpSpeedButtons: {
      "Speed in RPM & Save Prog 1": {
        'Save Speed': ['test_runpumpSpeedAt1000RPM']
      }
    }
  },
  components: {
    GroupOfButtons,
    OnlyButtons,
    PumpStatus,
    PumpPower,
    StatusMessage,
    SelectedPumpControl
  },
  methods: {
    setMessage(message) {
      if (messageTimer) {
        clearTimeout(messageTimer);
        messageTimer = ' ';
      }
      this.message = message;
      setTimeout(() => {
        this.message = ' ';
      }, 5000);
    },
    setMessageCallback(err, results) {
      results = results ? ': ' + results : '';

      if (err) {
        this.setMessage('Message Failed' + results);
      } else {
        this.setMessage('Message Confirmed' + results);
      }
    },
    returnFirstObjectKey (obj) {
      return Object.keys(obj)[0];
    }
  },
  template: `
  <div>
    <div class="row">
      <PumpStatus></PumpStatus>
      <StatusMessage v-bind:message='message'></StatusMessage>
    </div>
    <div class="row">
      <PumpPower  equipmentName="pump1"  v-bind:setMessage="setMessageCallback"></PumpPower>
      <OnlyButtons v-for="(data, title) in buttonData"
        v-bind:buttons="data"
        v-bind:setMessage="setMessageCallback"
        v-bind:key="title"
        v-bind:title='title'>
      </OnlyButtons>
      <SelectedPumpControl v-bind:title="returnFirstObjectKey(savePumpSpeedButtons)" v-bind:setMessage="setMessageCallback" v-bind:buttons="savePumpSpeedButtons"></SelectedPumpControl>
    </div>
  </div>
  `
});

{/* <GroupOfPumpButtons v-bind:buttons="data1" v-bind:setMessage="setMessageCallback" title='Pump Controls'></GroupOfPumpButtons> */}
//