<script>
  export default {
    computed: {},
    components: {},
    data: function () {
      return {}
    },
    props: ['listEquipment'],
    methods: {},
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
  </div>
  <div class="navbarSize">

  </div>
  </div>
</template>

<style>

</style>