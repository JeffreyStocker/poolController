<script>
  import { socket } from '../socket.js';

  export default {
    props: ['onClickData', 'name', 'onClick'],
    methods: {
      clickButton: function (evt) {
        var onClick = this.onClick;
        if (onClick && typeof onClick === 'function') {
          socket.emit(...this.onClickData, function (err, results){
            onClick (err, results, evt);
          });
        } else {
          console.log (this.name, ': Button Clicked but No Event');
        }
      }
    }
  };
</script>

<template>
  <button
    class="btn"
    v-on:click="clickButton"
  > {{name}}
  </button>
</template>