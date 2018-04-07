<script>
  import PumpStatusData from './PumpStatusData.vue';
  import PumpStatusDataExtended from './PumpStatusDataExtended.vue';

  export default {
    components: {
      PumpStatusData,
      PumpStatusDataExtended
    },
    data: function () {
      return {
        showExtended: false
      };
    },
    props: ['pumpData', 'message'],
  }
</script>

<template>
  <div class='center' v-on:dblclick='showExtended=!showExtended'>
    <div>Pump Info</div>
    <PumpStatusData v-bind:pumpData='pumpData'></PumpStatusData>
    <pumpStatusDataExtended v-bind:pumpData='pumpData' v-show='showExtended'></PumpStatusDataExtended>

    <div class="message" id="message"> {{ message }}</div>
  </div>
</template>

<style>
</style>