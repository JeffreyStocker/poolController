<script>
  import { socket } from '../socket.js';

  export default {
    props: ['onClickData', 'name', 'onClick'],
    methods: {
      button: function () {
        if (this.onClick && typeof this.onClick === 'function') {
          socket.emit(...this.onClickData, this.onClick);
        } else {
          console.log (this.name, ': Button Clicked but No Event');
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