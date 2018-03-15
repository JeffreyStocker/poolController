Vue.component('buttonX', {
  props: ['todo'],
  template:
  `<button> {{todo}} </button>`,
});

Vue.component('test', {
  template:
  `<div v-for="info in buttons">
    {{ info.text }}
  </div>`
});


var app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!',
    items: ['test1', 'test2', 'test3']
  },
  template: `
  <div>
    <buttonX
      v-for="(item, num) in items"
      v-bind:todo="item"
      v-bind:key="num">
    </buttonX>
  </div>`
});