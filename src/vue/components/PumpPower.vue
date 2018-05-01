<script>
  // import GroupOfButtons from './GroupOfButtons.vue';
  import DoubleButton from './DoubleButton.vue';
  import Buttonx from './buttonX.vue';
  import { socket, pumpData, setPumpData } from '../socket.js';

  export default {
    computed: {},
    components: { Buttonx, DoubleButton },
    data: function () {
      return {
        pumpData,
      }
    },
    props: ['setMaintenanceMode', 'equipmentName', 'setMessageCallback', 'setMessage', 'setPumpData'],
    methods: {
      powerOn: function () { socket.emit('pumpPower', 'on', this.equipmentName, this.setMessageCallback) },
      powerOff: function () { socket.emit('pumpPower', 'off', this.equipmentName, this.setMessageCallback) },
      powerToggle: function () { socket.emit('pumpPower', 'toggle', this.equipmentName, this.setMessageCallback) },
      setLocal: function () { socket.emit('pumpControlPanelState', 'local', this.equipmentName, this.setMessageCallback) },
      setRemote: function () { socket.emit('pumpControlPanelState', 'remote', this.equipmentName, this.setMessageCallback) },
      sendStatusOn: function () { socket.emit('toggleStatusUpdate', 'on', this.equipmentName, this.setPumpDataCallback) },
      sendStatusOff: function () { socket.emit('toggleStatusUpdate', 'off', this.equipmentName, this.setPumpDataCallback) },
      setPumpDataCallback: function (err, results) {
          setPumpData();
          this.setMessageCallback(err, results);
      },
      setMaintenceModeCallback: function (err, results, evt) {
        this.setMessageCallback(err, results);
        if (err) {
          console.log ('Error:', err)
        } else {
          let state = evt.target.textContent.trim() === 'On' ? true : false;
          state && setPumpData();
          this.setMaintenanceMode (state);
        }
      }
    },
  }
</script>

<template>
  <div class="col-sm-2 center">
    <label>Power Controls </label>
    <DoubleButton
      :button1="{name: 'On', data: ['pumpPower', 'on', equipmentName] }"
      :button2="{name: 'Off', data: ['pumpPower', 'off', equipmentName] }"
      :setMessage="setMessageCallback" >
    </DoubleButton>
    <Buttonx name="Power Toggle" v-bind:onClick="powerToggle" />
    Control Panel
    <DoubleButton
      :button1="{name: 'Local', data: ['pumpControlPanelState', 'local', equipmentName] }"
      :button2="{name: 'Remote', data: ['pumpControlPanelState', 'remote', equipmentName] }"
      :setMessage="setPumpDataCallback" >
    </DoubleButton>
    Maintence Mode
    <DoubleButton
      :button1="{name: 'On', data: ['toggleStatusUpdate', 'off', equipmentName] }"
      :button2="{name: 'Off', data: ['toggleStatusUpdate', 'on', equipmentName] }"
      v-bind:setMessage="setMaintenceModeCallback" >
    </DoubleButton>
  </div>
</template>

<style>
</style>