<script>
  export default {
    computed: {},
    components: {},
    data: function () {
      return {}
    },
    props: ['list', 'equipmentName', 'toggleState'],
    methods: {},
    watch: {}
  }
</script>

<template>
  <div>
    <transition name="slide-fade" appear>
      <div class="navBarDropdown">
        <router-link :to="'/' + equipmentName + '/controls'" >
          <button class="btn fullWidth"  @click="toggleState">Power Controls</button>
        </router-link>

        <router-link :to="'/' + equipmentName + '/Graph'" >
          <button class="btn fullWidth"  @click="toggleState">Power Graphs</button>
        </router-link>

        <router-link :to="'/' + equipmentName + '/GraphBar'" >
          <button class="btn fullWidth"  @click="toggleState">Power Graphs Bar</button>
        </router-link>
      </div>
    </transition>
    <div class="offClickElement" @click="toggleState" />
  </div>
</template>

<style>

</style>