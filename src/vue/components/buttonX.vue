<script>
  export default {
    props: ['onClick', 'name'],
    methods: {
      button: function () {
        if (this.onClick && typeof this.onClick === 'function') {
          this.onClick();
        } else {
          console.log ('Button Clicked but No Event');
        }
      }
    }
  }
</script>

<template>
  <button
    class="btn"
    v-on:click="button"
  > {{name}}
  </button>
</template>