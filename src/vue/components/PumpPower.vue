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
    },
    watch: {}
  }
</script>

<template>
  <div class="col-sm-2 center">
    Power Controls
    <Buttonx
      name="Power On" v-bind:onClick="powerOn">
    </Buttonx>
    <Buttonx
      name="Power Off" v-bind:onClick="powerOff">
    </Buttonx>
    <Buttonx
      name="Power Toggle" v-bind:onClick="powerToggle">
    </Buttonx>
  </div>
</template>

<style>
</style>