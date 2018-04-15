<script>
  // import GroupOfButtons from './GroupOfButtons.vue';
  import AlertMessages from './AlertMessages.vue';
  import DoubleButton from './DoubleButton.vue';
  import OnlyButtons from './OnlyButtons.vue';
  import PumpStatus from './PumpStatus.vue';
  import PumpPower from './PumpPower.vue';
  import SelectedPumpControl from './SelectedPumpControl.vue';
  import StatusMessage from './statusMessage.vue';
  import { clearTimeout } from 'timers';

  var messageTimer;
  var message = ' ';

  export default {
    computed: {},
    components: {
      AlertMessages,
      DoubleButton,
      PumpStatus,
      OnlyButtons,
      PumpPower,
      StatusMessage,
      SelectedPumpControl
    },
    data: function () {
      return {
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
        },
        maintenceMode: false
      }
    },
    props: ['equipmentName'],
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
    setMaintenceMode (newMode = false) {
      this.maintenceMode = newMode;
    }
  },
    watch: {}
  }
</script>

<template>
  <div class="">
    <div class="row">
      <AlertMessages
        :equipmentName="equipmentName"
        :maintenceMode="maintenceMode">
      </AlertMessages>
      <PumpStatus></PumpStatus>
      <StatusMessage v-bind:message='message'></StatusMessage>
    </div>
    <div class="row">
      <PumpPower
        v-bind:equipmentName="equipmentName"
        v-bind:setMessageCallback="setMessageCallback"
        v-bind:setMessage="setMessage"
        v-bind:setMaintenceMode="setMaintenceMode"
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
</template>

<style>
</style>