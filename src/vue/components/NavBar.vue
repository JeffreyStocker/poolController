<script>
  import NavBarDropdown from './NavBarDropdown.vue';
  export default {
    computed: {},
    components: { NavBarDropdown },
    data: function () {
      return {
        dropdownState: false
      }
    },
    props: ['listEquipment'],
    methods: {
       toggleState: function () {
         this.dropdownState = !this.dropdownState;
         },
         test: function (data) {
           console.log (data)
         }
    },
    watch: {}
  }
</script>

<template>
<div>
  <div class="navbar navbarSize">
    <template v-for="equipment in listEquipment">
      <router-link :to="'/' + equipment.name" :key="equipment.name" >{{equipment.name}}</router-link>
    </template>
    <router-link to="/Settings">Settings</router-link>
    <router-link to="/Graph">Graph</router-link>
    <button @click="toggleState">test</button>
    <button @click="test">test</button>
  </div>
  <div class="navbarSize" />
  <NavBarDropdown v-if="dropdownState" :list="['Controls', 'Power Logs']" />
  </div>
</template>

<style>
.slide-fade-enter-active {
  transition: all .3s ease;
}
.slide-fade-leave-active {
  transition: all .2s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to {
  transform: translateX(-10px);
  opacity: 0;
}
</style>