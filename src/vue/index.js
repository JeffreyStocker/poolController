import Vue from 'vue';
// import Vue from 'vue/dist/vue.min.js';
import AsyncComputed from 'vue-async-computed';

import VueRouter from 'vue-router/dist/vue-router.min.js';

import {socket} from './socket.js';

import AlertMessages from './components/AlertMessages.vue';
import NavBar from './components/NavBar.vue';
import Chart from './components/Chart.vue';
import Pump from './components/Pump.vue';
import UserSettings from './components/UserSettings.vue';


Vue.use(AsyncComputed);
Vue.use(VueRouter);

var messageTimer;
var message = ' ';
var equipmentTypes = {
  Pump
};
var listEquipment = [];

const routes = [
  { path: '/vue', component: Pump, Pump, props: function (route) {
    return {
      equipmentName: 'Pump1',
      menuSelect: 'controls'
    };
  }
  },
  { path: '/', component: Pump, props: function (route) {
    return {
      equipmentName: 'Pump1',
      menuSelect: 'controls'
    };
  } },
  // { path: '/index', component: Pump },
  { path: '/Settings', component: UserSettings },
  { path: '/Graph', component: Chart, props: function () {
    return {
      equipmentName: 'Pump1'
    };
  } },
  { path: '/:equipmentName/:menuSelect', component: Pump, props: true},
  { path: '/:equipmentName/:menuSelect/*', component: Pump, props: function (route) {
    // console.log('rout:', route.params.subSelect);
    return {
      equipmentName: route.params.equipmentName,
      menuSelect: route.params.menuSelect,
      // subSelect: route.params.subSelect || null
    };
  } },
];


var getListOfEquipment = function () {
  socket.emit('listEquipment', function (err, data) {
    if (err) {
    } else {
      try {
        data.forEach(equipment => {
          listEquipment.push(equipment);
          router.addRoutes([
            {
              path: '/' + equipment.name, component:
              equipmentTypes[equipment.type],
              props: { equipmentName: equipment.name}
            },
          ]);
        });
      } catch (err) {
        console.log (err);
      }
    }
  });
};


const router = new VueRouter({
  routes,
  // mode: 'history'
});

getListOfEquipment();

const app = new Vue({
  el: '#app',
  router,
  components: { AlertMessages, NavBar, Pump, UserSettings },
  data: {
    listEquipment,
    maintenanceMode: false
  },
  methods: {
    setMaintenanceMode (newMode = false) {
      this.maintenanceMode = newMode;
    }
  },
  template: `
  <div>
    <NavBar :listEquipment="listEquipment" />
    <AlertMessages
      :maintenanceMode="maintenanceMode">
    </AlertMessages>
    <router-view :setMaintenanceMode='setMaintenanceMode'>
    </router-view>
  </div>
`
});