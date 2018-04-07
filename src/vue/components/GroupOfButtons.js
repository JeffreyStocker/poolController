import Vue from 'vue';

Vue.component('groupOfButtons', {
  props: ['group'],
  template:
  `<div>
    <buttonX
      v-for="(indv, key) in group"
      v-bind:key="key"
      v-bind:name="indv.name"
      v-bind:buttonEvent="indv.event"
      >
    </buttonX>
  </div>`
});