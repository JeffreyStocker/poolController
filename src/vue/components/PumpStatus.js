import Vue from 'vue';

Vue.component('pumpStatus', {
  data: function () {
    return {
      message,
      showExtended: false};
  },
  props: ['pumpData'],
  template: `
  <div class='center' v-on:dblclick='showExtended=!showExtended'>
			<div>Pump Info</div>
			<pumpStatusData v-bind:pumpData='pumpData'></pumpStatusData>
			<pumpStatusDataExtended v-bind:pumpData='pumpData' v-show='showExtended'></pumpStatusDataExtended>

			<div class="message" id="message"> {{ message }}</div>
		</div>
  `
});