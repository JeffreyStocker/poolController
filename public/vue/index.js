Vue.component('button', {
  template:
  `
  <button> {{text.text}}</button>
  `,
  bind: text
});

Vue.component('test', {
  template:
  `
  <div v-for="info in buttons">
    {{ info.text }}
  </div>
  `
});


var app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!'
  }
});