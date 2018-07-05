<script>
  var prefix = ['', 'kilo', 'mega', 'giga', 'tera', 'peta', 'exa', 'zetta', 'yotta'];

  export default {
    computed: {},
    components: {},
    data: function () {
      return {
        powerUnits: 'watts',
        shrunkPower: 0
      }
    },
    props: ['watts'],
    methods: {
      convertToLargestWattUnits(watts) {
        var count = 0;
        var base = 'watts'
        while (watts > 10000) {
          count++;
          watts = watts / 1000;
        }
        watts = Math.round (watts * 100) / 100;
        return [prefix[count] + base, watts];
      }
    },
    watch: {
      watts () {
        var shrunkPower =
        [this.powerUnits, this.shrunkPower] = this.convertToLargestWattUnits(this.watts);
      }
    }
  }
</script>

<template>
  <div>
    <!-- <div>Power: {{this.totalPower}}</div> -->
    <div>Current View Power: {{this.shrunkPower}} {{this.powerUnits}}</div>
  </div>
</template>

<style>
</style>