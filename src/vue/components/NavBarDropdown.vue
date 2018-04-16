<script>
  export default {
    computed: {},
    components: {},
    data: function () {
      return {}
    },
    props: ['list'],
    methods: {},
    watch: {}
  }
</script>

<template>
<transition name="slide-fade" appear>
  <div class="navBarDropdown">
    <ul>
      <li v-for="name in list"
        :key="name">
        {{name}}
      </li>
    </ul>
  </div>
</transition>
</template>

<style>

</style>