<script>
  // import GroupOfButtons from './GroupOfButtons.vue';
  import Buttonx from './buttonX.vue';
  import { socket, pumpData } from '../socket.js';

  export default {
    computed: {},
    components: { Buttonx },
    data: function () {
      return {
        pumpData
      }
    },
    props: ['equipmentName', 'setMessage'],
    methods: {
      powerOn: function () { socket.emit('pumpPower', 'on', this.equipmentName, this.setMessage) },
      powerOff: function () { socket.emit('pumpPower', 'off', this.equipmentName, this.setMessage) },
      powerToggle: function () { socket.emit('pumpPower', 'toggle', this.equipmentName, this.setMessage) },
      setLocal: function () { socket.emit('pumpControlPanelState', 'local', this.equipmentName, this.setMessage) },
      setRemote: function () { socket.emit('pumpControlPanelState', 'remote', this.equipmentName, this.setMessage) },
      sendStatusOn: function () { socket.emit('toggleStatusUpdate', 'on', this.equipmentName, this.setMessage) },
      sendStatusOff: function () { socket.emit('toggleStatusUpdate', 'off', this.equipmentName, this.setMessage) },
    },
    watch: {}
  }
</script>

<template>
  <div class="col-sm-2 center">
    <label>Power Controls </label>
    <Buttonx name="Power On" v-bind:onClick="powerOn" />
    <Buttonx name="Power Off" v-bind:onClick="powerOff" />
    <Buttonx name="Power Toggle" v-bind:onClick="powerToggle" />
    <Buttonx name="Status On" v-bind:onClick="sendStatusOn" />
    <Buttonx name="Status Off" v-bind:onClick="sendStatusOff" />
  </div>
</template>

<style>
</style>