<script>
  import buttonX from './buttonX.vue'

  export default {
    computed: {},
    components: { buttonX },
    data: function () {
      return {
      }
    },
    props: ['group'],
  }
</script>

<template>
  <div>
    <buttonX
      v-for="(indv, key) in group"
      v-bind:key="key"
      v-bind:name="indv.name"
      v-bind:buttonEvent="indv.event"
      >
    </buttonX>
  </div>
</template>

<style>
</style>