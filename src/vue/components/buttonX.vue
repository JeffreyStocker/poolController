<script>
  export default {
    props: ['buttonEvent', 'name'],
    methods: {
      button: function () {
        if (this.buttonEvent && typeof this.buttonEvent === 'function') {
          this.buttonEvent();
        } else {
          console.log ('button');
        }
      }
    }
  }
</script>

<template>
  <button
    v-on:click="button"
  > {{name}}
  </button>
</template>