<script>
  import ButtonPump from './ButtonPump.vue';

  /*
    var test = {
      name: [data1, data2, data3]
      }
    v-for="(val, key) in test"
    v-bind:key="key"
    v-bind:name="key"
    v-bind:methodData="val"
  */
  var sendMessage = function() {

  }
  export default {
    computed: {},
    components: { ButtonPump },
    data: function () {
      return {
      }
    },
    props: ['buttons', 'setMessage'],
    methods: {
      send: function () {
      }
    },
    watch: {}
  }
</script>

<template>
  <div>
    <ButtonPump
      v-for="(data, name) in buttons"
      v-bind:key="name"
      v-bind:name="name"
      v-bind:onClickData="data"
      v-bind:onClick="setMessage"
      >
    </ButtonPump>
  </div>
</template>

<style>
</style>