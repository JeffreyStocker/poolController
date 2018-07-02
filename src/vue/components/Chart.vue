<script>
  import {savedPumpData, updatePumpDataFromStartOfTime, updatePumpDataFromBetweenTimes} from '../socket.js'
  import Moment from 'moment/min/moment.min';
  import DisplayPower from './DisplayPower.vue';
  import Cost from './Cost.vue';

  var errorCheckParam = function ($route) {
      var params = typeof $route.params[0] === 'string' ? $route.params[0].toLowerCase() : null;
      if (params === null || !['day', 'week', 'month', 'year'].some(el => params === el)) {
        params = 'week';
      }
      return params;
  };

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
          type: 'line',
          line: {shape: 'vh'},
          // line: {shape: 'linear'},
        },
        {
          x: this.dates,
          y: this.rpms,
          name: this.equipmentName + ' RPM',
          yaxis: 'y2',
          type: 'line',
          line: {shape: 'vh'},
        }
      ]}
    },
    components: { DisplayPower, Cost },
    created: function () {
      this.getFromNow(errorCheckParam(this.$route));
    },
    data: function () {
      return {
        rpms: savedPumpData.rpms,
        dates: savedPumpData.dates,
        watts: savedPumpData.watts,
        powerArray: savedPumpData.power,
        // rpms: [100],
        // dates: [new Date()],
        // watts: [50],
        // powerArray: [],
        totalPower: 0,
        powerUnits: 'watts',
        displayPower: 0,
        graph: null,
        element: null,
        layout: {
          title: 'Double Y Axis Example',
          // hoverdistance: -1,
          yaxis: {
            title: 'Watts',
            domain: [0, 5],
            // scaleratio: 0.5,
            range: [0, 3200]
            // // scaleanchor: "x",
          },
          yaxis2: {
            title: 'RPMs',
            titlefont: {color: 'rgb(148, 103, 189)'},
            tickfont: {color: 'rgb(148, 103, 189)'},
            overlaying: 'y',
            range: [0, 3200],
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

      this.graph = Plotly.newPlot(this.element, this.plotCombinedData); //, this.layout

      this.graph.then(graph => {
        console.log('runn:');
        graph.on('plotly_relayout', function (eventdata) {
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
    },
    props: ['equipmentName', 'subSelect'],
    methods: {
      getFromStartData: function (startString) {
        updatePumpDataFromStartOfTime(startString, this.equipmentName);
      },
      getFromNow (timeString) {
        updatePumpDataFromBetweenTimes(new Date(), Moment().subtract(1, timeString).toDate(), this.equipmentName);
      },
      updateGraph() {
        Plotly.Plots.resize(this.element);
      }
    },
    watch: {
      dates: function() {
        Plotly.react(this.element, this.plotCombinedData, this.layout);
      },
      powerArray: function () {
        var power = this.powerArray.reduce((sum, element) => {
          if (element === undefined) {
            return sum;
          }
          return sum + element
          }, 0);

        if (power < 10) {
          this.totalPower = power;
        } else {
          this.totalPower = Math.round(power);
        }
      },
      $route (to, from) {
        console.log('to:', to);
        console.log('from', from);
        this.getFromNow(errorCheckParam(to));
      }
    },
  }
</script>

<template>
  <div>
    <button class="btn" @click="getFromNow('hour')">Hour</button>
    <button class="btn" @click="getFromNow('day')">Day</button>
    <button class="btn" @click="getFromNow('week')">Week</button>
    <button class="btn" @click="getFromNow('month')">Month</button>
    <button class="btn" @click="getFromNow('year')">Year</button>
    <button class="btn" @click="getFromNow('year')">
      <router-link to="Graph/Year">User</router-link>
      Year
    </button>
    <br>
    <button class="btn" @click="getFromStartData('hour')">From Hour</button>
    <button class="btn" @click="getFromStartData('day')">From Day</button>
    <button class="btn" @click="getFromStartData('week')">From Week</button>
    <button class="btn" @click="getFromStartData('month')">From Month</button>
    <button class="btn" @click="getFromStartData('year')">From Year</button>
    <DisplayPower :watts='this.totalPower'/>
    <Cost :watts='this.totalPower' />
    <!-- <div>Power: {{this.totalPower}}</div>
    <div>Current View Power: {{this.displayPower}} {{this.powerUnits}}</div> -->
    <div ref="polar"></div>
  </div>

</template>

<style>
</style>