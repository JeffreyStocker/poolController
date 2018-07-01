<script>
  import {savedPumpData, getPumpDataBetweenTime} from '../socket.js'
  import Moment from 'moment/min/moment.min';

  export default {
    beforeDestroy: function () {
      window.removeEventListener('resize', this.__resizeListener)
      // this.__generalListeners.forEach(obj => this.$refs.container.removeAllListeners(obj.fullName))
      // Plotly.purge(this.$refs.container)
    },
    computed: {
      plotCombinedData: function () {
        return [
        {
          x: this.dates,
          y: this.watts,
          name: this.equipmentName + ' Watts',
          type: 'scatter',
        }
      ]}
    },
    components: {},
    created: function () {
      // updatePumpDataFromStartOfTime('week', this.equipmentName);
    },
    data: function () {
      return {
        dates: ['January', 'Febuary'],
        watts: [10, 11],
        displayPower: 0,
        graph: null,
        element: null,
        layout: {
          title: 'Double Y Axis Example',
          yaxis: {
            title: 'Watts',
          },
          // yaxis2: {
          //   title: 'RPMs',
          //   titlefont: {color: 'rgb(148, 103, 189)'},
          //   tickfont: {color: 'rgb(148, 103, 189)'},
          //   overlaying: 'y',
          //   side: 'right',
          // },
          xaxis: {
            type: 'string',
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

      this.graph = Plotly.react(this.element, this.plotCombinedData);

      this.graph
        .then(graph => {
          graph.on('plotly_relayout', (eventdata) => {
              // eventdata.then( () => { console.log('test');})
              if (eventdata.autosize) {
                console.log('autoresized', eventdata);
              } else if (eventdata['xaxis.range[0]'] && eventdata['xaxis.range[1]']) {
                console.log('x axis changed:', eventdata);
              } else {
                console.log('????:', eventdata);
              }
            });

          graph.on('plotly_hover', (event) => {
            console.log('hover:', event);
          });
          graph.on('plotly_click', (event) => {
            console.log('click:', event);
          });

        })

        var data = [
  {
    x: ['giraffes', 'orangutans', 'monkeys'],
    y: [20, 14, 23],
    type: 'bar'
  }
];

Plotly.newPlot('myDiv', data);
    },
    props: ['equipmentName'],
    methods: {
      getBy (range) {

      },
      getFromStartData: function (startString) {

        getPumpDataBetweenTime(new Date(), Moment().subtract(1, 'year'), this.equipmentName)
          .then(data => {

          })
          .catch(err => {

          });
        // updatePumpDataFromStartOfTime(startString, this.equipmentName);
      },
      getFromNow (timeString) {
        // updatePumpDataFromBetweenTimes(new Date(), Moment().subtract(1, timeString).toDate(), this.equipmentName);
      },
      updateGraph() {
        Plotly.Plots.resize(this.element);
      }
    },
    watch: {
      dates: function() {
        Plotly.react(this.$refs.polar, this.plotCombinedData);
      }
    },
  }
</script>

<template>
  <div>
    <button @click="getFromNow('hour')">Day</button>
    <button @click="getFromNow('day')">Week</button>
    <button @click="getFromNow('week')">Month</button>
    <button @click="getFromNow('month')">Year</button>
    <button @click="getFromNow('year')">Year</button>

    <div id="myDiv"> </div>
    <div ref="polar"></div>
  </div>

</template>

<style>
</style>