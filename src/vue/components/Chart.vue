<script>
  import {savedPumpData, updatePumpDataFromBetweenTimes} from '../socket.js'

  export default {
    computed: {
      plotCombinedData: function () {
        return [
        {
          x: this.dates,
          y: this.watts,
          name: this.pumpName + ' Watts',
          type: 'scatter'
        },
        {
          x: this.dates,
          y: this.rpms,
          name: this.pumpName + ' RPM',
          yaxis: 'y2',
          type: 'scatter'
        }
      ]}
    },
    components: {},
    data: function () {
      return {
        pumpName: 'Pump1',
        rpms: savedPumpData.rpms,
        dates: savedPumpData.dates,
        watts: savedPumpData.watts,
        plot: null,
        timer: null,
        placeholder: null,
        layout: {
          title: 'Double Y Axis Example',
          yaxis: {
            title: 'Watts',
            // domain: [0, 5],
            scaleratio: 0.5,
            // scaleanchor: "x",
          },
          yaxis2: {

            title: 'RPMs',
            titlefont: {color: 'rgb(148, 103, 189)'},
            tickfont: {color: 'rgb(148, 103, 189)'},
            overlaying: 'y',
            side: 'right'
          },
          xaxis: {
            type: 'date',
            title: 'Dates'
          },
        }

      }
    },
    created: function () {
      updatePumpDataFromBetweenTimes('day', 'Pump1');
    },
    mounted: function () {
      this.plot = Plotly.react(this.$refs.polar, this.plotCombinedData, this.layout);
    },
    props: [],
    methods: {
      getFromStartData: function (startString) {
        updatePumpDataFromBetweenTimes(startString, this.pumpName);
      }
    },
    watch: {
      dates: function() {
        Plotly.update(this.$refs.polar, this.plotCombinedData, this.layout);
      },
    },
  }
</script>

<template>
  <div>
    <button @click="getFromStartData('hour')">Hour</button>
    <button @click="getFromStartData('day')">Day</button>
    <button @click="getFromStartData('week')">Week</button>
    <button @click="getFromStartData('month')">Month</button>
    <button @click="getFromStartData('year')">Year</button>
    <div ref="polar"></div>
  </div>

</template>

<style>
</style>