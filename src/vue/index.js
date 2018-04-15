import Vue from 'vue';
import VueRouter from 'vue-router';

import {socket} from './socket.js';

import NavBar from './components/NavBar.vue';
import Pump from './components/Pump.vue';
import UserSettings from './components/UserSettings.vue';

Vue.use(VueRouter);

var messageTimer;
var message = ' ';
var equipmentTypes = {
  Pump
};
var listEquipment = [];

// var exampleData = {
//   'groupName': [
//   {name: "Pump Control", data: ['test', 'test2', 'test3'], type: 'button'},
//   {name: "name2", data: ['test', 'test2', 'test3']}
//   ]
// };

const routes = [
  { path: '/vue', component: Pump },
  { path: '/', component: Pump },
  { path: '/index', component: Pump },
  { path: '/Settings', component: UserSettings },
];


var getListOfEquipment = function () {
  socket.emit('listEquipment', function (err, data) {
    var test = listEquipment;
    if (err) {
    } else {
      try {
        data.forEach(equipment => {
          listEquipment.push(equipment);
          router.addRoutes([
            { path: '/' + equipment.name, component: equipmentTypes[equipment.type] },
          ]);
        });
      } catch (err) {
        console.log (err);
      }
    }
  });
};


const router = new VueRouter({
  routes
});

getListOfEquipment();

const app = new Vue({
  el: '#app',
  router,
  components: { NavBar, Pump, UserSettings },
  data: {
    listEquipment
  },
  template: `
  <div>
    <NavBar :listEquipment="listEquipment"/>
    <router-view>
    </router-view>
  </div>
`
});