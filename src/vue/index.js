import Vue from 'vue';
import pumpData from '/socket.js';
import buttonx from '/components/buttonx.js';
import groupOfButtons from '/components/GroupOfButtons.js';
import PumpStatus from '/components/PumpStatus.js';
import PumpStatusData from '/components/PumpStatusData.js';

var socket = io.connect();

var sendDataToServer;

var message = '';



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