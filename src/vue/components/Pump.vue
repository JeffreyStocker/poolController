<script>
  // import GroupOfButtons from './GroupOfButtons.vue';
  import DoubleButton from './DoubleButton.vue';
  import OnlyButtons from './OnlyButtons.vue';
  import PumpStatus from './PumpStatus.vue';
  import PumpPower from './PumpPower.vue';
  import Chart from './Chart.vue';
  import SelectedPumpControl from './SelectedPumpControl.vue';
  import StatusMessage from './statusMessage.vue';
  import { clearTimeout } from 'timers';

  var messageTimer;
  var message = ' ';

  export default {
    computed: {},
    components: {
      DoubleButton,
      Chart,
      PumpStatus,
      OnlyButtons,
      PumpPower,
      StatusMessage,
      SelectedPumpControl
    },
    data: function () {
      return {
        message: ' ',
        showExtended: false,
        buttonData: {
          "External Controls" : {
            '1: SPA': ['intellicom', 1, this.equipmentName],
            '2: Waterfall': ['intellicom', 2, this.equipmentName],
            "3: Slow": ['intellicom', 3, this.equipmentName],
            "4: Solar": ['intellicom', 4, this.equipmentName],
            "External: Off": ['intellicom', 0, this.equipmentName]
          },
          "Speed Controls" : {
            'Program 1': ['runSpeed', 1, this.equipmentName],
            'Program 2': ['runSpeed', 2, this.equipmentName],
            "Program 3": ['runSpeed', 3, this.equipmentName],
            "Program 4": ['runSpeed', 4, this.equipmentName],
            "Speed: Off": ['pumpPower', 'toggle', this.equipmentName],
          }
        },
        savePumpSpeedButtons: {
          "Speed in RPM & Save Prog 1": {
            'Save Speed': ['test_runpumpSpeedAt1000RPM', this.equipmentName]
          }
        },
      }
    },
    props: ['equipmentName', 'menuSelect', 'setMaintenanceMode'],
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
      },
    },
    // watch: {
    //   '$route' (to, from) {
    //   }
    // }
  }
</script>

<template>
  <div>
    <div v-if="menuSelect==='controls' || !menuSelect" class="">
      <div class="row">
        <PumpStatus></PumpStatus>
        <StatusMessage v-bind:message='message'></StatusMessage>
      </div>
      <div class="row">
        <PumpPower
          v-bind:equipmentName="equipmentName"
          v-bind:setMessageCallback="setMessageCallback"
          v-bind:setMessage="setMessage"
          v-bind:setMaintenanceMode="setMaintenanceMode"
          />
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
    <Chart v-if="menuSelect==='Graph'"/>
  </div>
</template>

<style>
</style>