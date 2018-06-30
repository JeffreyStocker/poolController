<script>
  export default {
    computed: {
      kilowatt () {
        return this.watts / 1000;
      },
      cost () {
        return (~~(this.kilowatt * 0.33 * 100)) / 100;
      }
    },
    components: {},
    data: function () {
      return {}
    },
    props: ['watts'],
    methods: {},
    watch: {}
  }
</script>

<template>
  <div>
    This cost you: ${{ this.cost }}
  </div>
</template>

<style>
</style>