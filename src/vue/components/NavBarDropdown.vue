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
      <ul>
        <li>
          <router-link :to="'/' + equipmentName + '/controls'" >
            <span @click="toggleState">Power Controls</span>
          </router-link>
        </li>
        <li>
          <router-link :to="'/' + equipmentName + '/Graph'" >
            <span @click="toggleState">Power Graphs</span>
          </router-link>
        </li>
      </ul>
    </div>
    </transition>
    <div class="offClickElement" @click="toggleState" />
  </div>
</template>

<style>

</style>