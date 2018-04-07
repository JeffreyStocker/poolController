import Vue from 'vue';

Vue.component('buttonX', {
  props: ['buttonEvent', 'name'],
  template:
  `<button
    v-on:click="button"
  > {{name}} </button>`,
  methods: {
    button: function () {
      if (this.buttonEvent && typeof this.buttonEvent === 'function') {
        this.buttonEvent();
      } else {
        console.log ('button');
      }
    }
  }
});