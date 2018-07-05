<script>
  import {savedPumpData, updatePumpDataFromStartOfTime, updatePumpDataFromBetweenTimes} from '../socket.js'
  import Moment from 'moment/min/moment.min';
  import DisplayPower from './DisplayPower.vue';
  import Cost from './Cost.vue';
  import {asyncBinarySearch} from '../binarySearch.js'

  var errorCheckParam = function ($route) {
      var params = typeof $route.params[0] === 'string' ? $route.params[0].toLowerCase() : null;
      if (params === null || !['day', 'week', 'month', 'year'].some(el => params === el)) {
        params = 'week';
      }
      return params;
  };

  export default {
    asyncComputed: {
      currentPower: async function () {
        var total = 0;
        console.log('element:', this.currentPowerDateRangeEarlier, this.currentPowerDateRangeLater);

        if (this.currentPowerDateRangeEarlier === null || this.currentPowerDateRangeLater === null ) { return 0; };
        console.log('date:', typeof this.currentPowerDateRangeEarlier, typeof this.currentPowerDateRangeLater);

        var earlierDatePosition = await asyncBinarySearch(this.dates, function (val) { return this.currentPowerDateRangeEarlier - val;}.bind(this), {exactMatch: false} );
        var laterDatePosition = await asyncBinarySearch(this.dates, function (val) { return this.currentPowerDateRangeLater - val;}.bind(this), {exactMatch: false} );

        console.log('positions:', earlierDatePosition, ':', laterDatePosition);

        for (var i = earlierDatePosition; i < laterDatePosition + 1; i ++) {
          total += this.powerArray[i];
        }
        console.log('total:', total);

        return total;
      },
    },
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
          mode: 'lines+markers',
          // line: {shape: 'linear'},
        },
        {
          x: this.dates,
          y: this.rpms,
          name: this.equipmentName + ' RPM',
          yaxis: 'y2',
          type: 'line',
          line: {shape: 'vh'},
          mode: 'lines+markers',
        }
      ]},
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
        // rpms: [100, 200, 300, 400 ,500, 600],
        // dates: [new Date() - 100, new Date() - 80, new Date() - 60, new Date () - 40, new Date() - 20, new Date()],
        // watts: [100, 100, 100, 100, 100, 100],

        // powerArray: [],

        currentPowerDateRangeEarlier: null,
        currentPowerDateRangeLater: null,
        totalPower: 0,
        powerUnits: 'watts',
        displayPower: 0,
        graph: null,
        element: null,
        allowUpdateGraph: true,
        allowUpdateGraphTimer: null,
        layout: {
          title: 'Double Y Axis Example',
          // hoverdistance: -1,
          yaxis: {
            title: 'Watts',
            domain: [0, 5],
            range: [0, 3200]
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

      this.graph = Plotly.react(this.element, this.plotCombinedData, this.layout); //, this.layout

      this.graph.then(graph => {
        console.log('runn:');
        graph.on('plotly_relayout', function (eventdata) {
          if (eventdata.autosize) {
            console.log('autoresized', eventdata);
          } else if (eventdata['xaxis.autorange'] === true) {
            console.log('x axis changed:', eventdata);
            this.updateDateRange(this.dates[0], this.dates[this.dates.length - 1]);
          } else if (eventdata['xaxis.range[0]'] && eventdata['xaxis.range[1]']) {
            console.log('x axis changed:', eventdata);
            this.updateDateRange(eventdata['xaxis.range[0]'], eventdata['xaxis.range[1]']);
          } else {
            console.log('????:', eventdata);
          }
        }.bind(this));

        graph.on('plotly_hover', (event) => {
          // console.log('hover:', event);
        });
        graph.on('plotly_click', (event) => {
          // console.log('click:', event);
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
      },
      allowUpdate(newStatus) {
        if (typeof newStatus !== 'boolean') {
          throw new Error ('newSttatus must be a boolean');
        }
        this.allowUpdateGraph = newStatus;
        if (newStatus === false) {
          this.allowUpdateGraphTimer = setTimeout( function () {
            this.allowUpdateGraph = true;

          }.bind(this), 3000)
        } else {
          clearTimeout(this.allowUpdateGraphTimer);
        }
      },
      updateDateRange(earlierDate, laterDate) {
        this.currentPowerDateRangeEarlier = new Date(earlierDate);
        this.currentPowerDateRangeLater = new Date(laterDate);
      }
    },
    watch: {
      dates: function() {
        if (this.allowUpdateGraph) {
          Plotly.react(this.element, this.plotCombinedData, this.layout);
        }
      },
      powerArray: function () {
        var power = this.powerArray.reduce((sum, element) => {
          if (element === undefined) {
            return sum;
          }
          return sum + element;
          }, 0);

        this.totalPower = power;
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
    <button class="btn"><router-link to="Graph/Year">Year</router-link></button>
    <br>
    <button class="btn" @click="getFromStartData('hour')">From Hour</button>
    <button class="btn" @click="getFromStartData('day')">From Day</button>
    <button class="btn" @click="getFromStartData('week')">From Week</button>
    <button class="btn" @click="getFromStartData('month')">From Month</button>
    <button class="btn" @click="getFromStartData('year')">From Year</button>
    <DisplayPower :watts='this.totalPower'/>
    <DisplayPower :watts='currentPower'/>
    <Cost :watts='this.totalPower' />
    <!-- <div>Power: {{this.totalPower}}</div>
    <div>Current View Power: {{this.displayPower}} {{this.powerUnits}}</div> -->
    <div>
      <div ref="polar" @mousedown="allowUpdate(false)" />
    </div>
  </div>

</template>

<style>
</style>