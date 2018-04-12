import Vue from 'vue';
import GroupOfButtons from './components/GroupOfButtons.vue';
import DoubleButton from './components/DoubleButton.vue';
import OnlyButtons from './components/OnlyButtons.vue';
import PumpStatus from './components/PumpStatus.vue';
import PumpPower from './components/PumpPower.vue';
import SelectedPumpControl from './components/SelectedPumpControl.vue';
import StatusMessage from './components/statusMessage.vue';
import { clearTimeout } from 'timers';

var sendDataToServer;
var messageTimer;
var message = ' ';

var exampleData = {
  'groupName': [
  {name: "Pump Control", data: ['test', 'test2', 'test3'], type: 'button'},
  {name: "name2", data: ['test', 'test2', 'test3']}
  ]
};


var app = new Vue({
  el: '#app',
  data: {
    message: ' ',
    items: [[{name: 'test'}], [{name: 'test2'}], [{name: 'test3'}]],
    showExtended: false,
    buttonData: {
      "External Controls" : {
        '1: SPA': ['intellicom', 1],
        '2: Waterfall': ['intellicom', 2],
        "3: Slow": ['intellicom', 3],
        "4: Solar": ['intellicom', 4],
        "External: Off": ['intellicom', 0]
      },
      "Speed Controls" : {
        'Program 1': ['runSpeed', 1],
        'Program 2': ['runSpeed', 2],
        "Program 3": ['runSpeed', 3],
        "Program 4": ['runSpeed', 4],
        "Speed: Off": ['pumpPower', 'toggle'],
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
    SelectedPumpControl,
    DoubleButton
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
        this.setMessage('Message Failed' + err);
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
      <PumpPower  equipmentName="pump1" v-bind:setMessageCallback="setMessageCallback" v-bind:setMessage="setMessage" />

      <OnlyButtons v-for="(data, title) in buttonData"
        v-bind:buttons="data"
        v-bind:setMessage="setMessageCallback"
        v-bind:key="title"
        v-bind:title='title'>
      </OnlyButtons>
      <SelectedPumpControl v-for="(data, title) in savePumpSpeedButtons"
        v-bind:buttons="data"
        v-bind:setMessage="setMessageCallback"
        v-bind:key="title"
        v-bind:title='title'>
      </SelectedPumpControl>
    </div>
  </div>
  `
});

{/* <GroupOfPumpButtons v-bind:buttons="data1" v-bind:setMessage="setMessageCallback" title='Pump Controls'></GroupOfPumpButtons> */}
//

{/* <PumpPower  equipmentName="pump1"  v-bind:setMessage="setMessageCallback"></PumpPower> */}
//