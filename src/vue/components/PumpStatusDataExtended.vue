<script>
  export default {
    props: ['pumpData']
  }
</script>

<template>
  <div>
    <div>Destination:
      <span class="pumpDestination bold" id="pumpDestination"> {{ pumpData.destination }}</span>
      <span> Source: <span class="pumpSource bold" id="pumpSource"> {{ pumpData.source }} </span> </span>
    </div>
    <div>driveState:
      <span class="pumpDriveState bold" id="pumpDriveState"> {{ pumpData.driveState }}</span>
      <span> ppc: <span class="pumpPpc bold" id="pumpPpc"> {{ pumpData.ppc }}</span> </span>
    </div>

    <div>Unknown1:
      <span class="unknown1 bold"> {{ pumpData.unknown1 }} </span>
      <span> Unknown2: <span class="unknown2 bold"> {{ pumpData.unknown2 }} </span></span>
    </div>

    <div>Unknown3:
      <span class="unknown3 bold"> {{ pumpData.unknown3 }} </span>
      <span> Unknown4: <span class="unknown4 bold"> {{ pumpData.unknown4 }} </span> </span>
    </div>
  </div>
</template>

<style>
</style>