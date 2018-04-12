<script>
  import { socket } from '../socket.js';

  export default {
    props: ['onClickData', 'name', 'onClick'],
    methods: {
      clickButton: function (evt) {
        console.log (this.name + ': clicked');
        // console.log ( 'onClickData: ',  this.onClickData);
        // console.log ( 'onClick: ', this.onClick.toString());
        if (this.onClick && typeof this.onClick === 'function') {
          socket.emit(...this.onClickData, this.onClick);
          // var clicked = this.onClick;
          // socket.emit(...this.onClickData, function(err, results) {
          //   console.log ('err', err, '\nResults:' + results);
          //   clicked(err, results);
          // });
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