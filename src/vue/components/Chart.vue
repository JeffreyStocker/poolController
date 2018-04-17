<script>
  // import Plotly from 'plotly.js';
  import {savedPumpData} from '../socket.js'
  var plot
  export default {
    computed: { },
    components: {},
    data: function () {
      return {
      rpms: savedPumpData.rpms ,
      times: savedPumpData.times,
      watt: savedPumpData.watt,
      timer: null
      }
    },
    created: function () {},
    mounted: function () {
      var trace1 = {
        x: savedPumpData.times,
        y: savedPumpData.watts,
        name: 'yaxis data',
        type: 'scatter'
      };

      var trace2 = {
        x: savedPumpData.times,
        y: savedPumpData.rpms,
        name: 'yaxis2 data',
        yaxis: 'y2',
        type: 'scatter'
      };

      var data = [trace1, trace2];

      var layout = {
        title: 'Double Y Axis Example',
        yaxis: {title: 'yaxis title'},
        yaxis2: {
          title: 'yaxis2 title',
          titlefont: {color: 'rgb(148, 103, 189)'},
          tickfont: {color: 'rgb(148, 103, 189)'},
          overlaying: 'y',
          side: 'right'
        }
      }

      plot = Plotly.react(this.$refs.polar, data, layout);
      this.timer = setInterval(function () {
        Plotly.update(this.$refs.polar, data, layout);
      }.bind(this), 250)
    },
    props: [],
    methods: {},
    watch: {},
    beforeDestroy: function () {
      clearInterval(this.timer);
      console.log ('timer cleared', this.timer)
    }
  }
</script>

<template>
  <div >
    <div ref="polar"></div>
  </div>

</template>

<style>
</style>