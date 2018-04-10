<script>
  export default {
    props: ['pumpData']
  }
</script>

<template>
  <div>
    <div>Running:
      <span class="pumpState bold" id="pumpState"> {{ pumpData.state }} </span>
      <span> Timer: <span class="PumpTimers bold" id="">{{ pumpData.timer }} </span></span>
    </div>

    <div>RPM:
      <span class="pumpRPM bold" id="pumpRPM"> {{ pumpData.rpm }} </span>
      <span> Watts: <span class="pumpWatt bold" id="pumpWatt"> {{ pumpData.watt }} </span> </span>
    </div>

    <div>action:
      <span class="pumpAction bold" id="pumpAction"> {{ pumpData.action }} </span>
      <span> Time: <span class="timeCurrent bold"> {{ pumpData.timeCurrent }} </span> </span>
    </div>
  </div>
</template>

<style>
</style>