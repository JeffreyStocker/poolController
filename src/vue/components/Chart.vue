<script>
  import {savedPumpData, updatePumpDataFromStartOfTime, updatePumpDataFromBetweenTimes} from '../socket.js'
  import Moment from 'moment';
  export default {
    beforeDestroy: function () {
      window.removeEventListener('resize', this.__resizeListener)
      this.__generalListeners.forEach(obj => this.$refs.container.removeAllListeners(obj.fullName))
      Plotly.purge(this.$refs.container)
    },
    computed: {
      plotCombinedData: function () {
        return [
        {
          x: this.dates,
          y: this.watts,
          name: this.pumpName + ' Watts',
          type: 'scatter',
          line: {shape: 'vh'},
        },
        {
          x: this.dates,
          y: this.rpms,
          name: this.pumpName + ' RPM',
          yaxis: 'y2',
          type: 'scatter',
          line: {shape: 'vh'},
        }
      ]}
    },
    components: {},
    created: function () {
      updatePumpDataFromStartOfTime('day', 'Pump1');
    },
    data: function () {
      return {
        pumpName: 'Pump1',
        rpms: savedPumpData.rpms,
        dates: savedPumpData.dates,
        watts: savedPumpData.watts,
        timer: null,
        graph: null,
        element: null,
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
            side: 'right',
          },
          xaxis: {
            type: 'date',
            title: 'Dates'
          }
        }
      }
    },
    mounted: function () {
      var element = this.$el,
        WIDTH_IN_PERCENT_OF_PARENT = 100,
        HEIGHT_IN_PERCENT_OF_PARENT = 80;

      var d3 = Plotly.d3;
      var gd3 = d3.select(this.$refs.polar)
          .append('div')
          .style({
            width: WIDTH_IN_PERCENT_OF_PARENT + '%',
            'margin-left': (100 - WIDTH_IN_PERCENT_OF_PARENT) / 2 + '%',

            height: HEIGHT_IN_PERCENT_OF_PARENT + 'vh',
            // 'margin-top': (100 - HEIGHT_IN_PERCENT_OF_PARENT) / 2 + 'vh'
            'min-height': '400px',
          });

      this.element = gd3.node();

      window.addEventListener('resize', () => {
        this.updateGraph();
      });

      this.graph = Plotly.react(this.element, this.plotCombinedData, this.layout);

      this.graph
        .then(graph => {
          graph.on('plotly_relayout',
            (eventdata) => {
              // eventdata.then( () => { console.log('test');})
              if (eventdata.autosize) {
                console.log('autoresized', eventdata);
              } else if (eventdata['xaxis.range[0]'] && eventdata['xaxis.range[1]']) {
                console.log('x axis changed:', eventdata);
              } else {
                console.log('????:', eventdata);
              }
            });
        })
    },
    props: [],
    methods: {
      getFromStartData: function (startString) {
        updatePumpDataFromStartOfTime(startString, this.pumpName);
      },
      getFromNow (timeString) {
        updatePumpDataFromBetweenTimes(new Date(), Moment().subtract(1, timeString).toDate());
      },
      updateGraph() {
        Plotly.Plots.resize(this.element);
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
    <button @click="getFromNow('hour')">Hour</button>
    <button @click="getFromNow('day')">Day</button>
    <button @click="getFromNow('week')">Week</button>
    <button @click="getFromNow('month')">Month</button>
    <button @click="getFromNow('year')">Year</button>
    <br>
    <button @click="getFromStartData('hour')">From Hour</button>
    <button @click="getFromStartData('day')">From Day</button>
    <button @click="getFromStartData('week')">From Week</button>
    <button @click="getFromStartData('month')">From Month</button>
    <button @click="getFromStartData('year')">From Year</button>
    <div ref="polar"></div>
  </div>

</template>

<style>
</style>