import Vue from 'vue';
import pumpData from './socket.js';
import GroupOfButtons from './components/GroupOfButtons.vue';
import PumpStatus from './components/PumpStatus.vue';
// import PumpStatusData from './components/PumpStatusData.vue';

var sendDataToServer;
var message = '';

var app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!',
    items: [[{name: 'test'}], [{name: 'test2'}], [{name: 'test3'}]],
    pumpData,
    showExtended: false
  },
  components: {
    GroupOfButtons,
    PumpStatus
  },
  template: `
  <div>
    <PumpStatus v-bind:pumpData='pumpData'></PumpStatus>

    <GroupOfButtons
      v-for="(item, num) in items"
      v-bind:group="item"
      v-bind:key="num"
      >
    </GroupOfButtons>
  </div>
  `
});