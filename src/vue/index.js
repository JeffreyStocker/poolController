import Vue from 'vue';
import GroupOfButtons from './components/GroupOfButtons.vue';
import GroupOfPumpButtons from './components/GroupOfPumpButtons.vue';
import PumpStatus from './components/PumpStatus.vue';
import PumpPower from './components/PumpPower.vue';
import StatusMessage from './components/statusMessage.vue';
import { clearTimeout } from 'timers';

var sendDataToServer;
var messageTimer;
var message = ' ';

var tests = {name1: ['test', 'test2', 'test3'], name2: ['test', 'test2', 'test3']};


var app = new Vue({
  el: '#app',
  data: {
    message: ' ',
    items: [[{name: 'test'}], [{name: 'test2'}], [{name: 'test3'}]],
    showExtended: false,
    data1: {name1: ['test', 'test2', 'test3'], name2: ['test', 'test2', 'test3']}
  },
  components: {
    GroupOfButtons,
    GroupOfPumpButtons,
    PumpStatus,
    PumpPower,
    StatusMessage
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
      <GroupOfPumpButtons v-bind:buttons="data1" v-bind:setMessage="setMessageCallback"></GroupOfPumpButtons>
    </div>
  </div>
  `
});