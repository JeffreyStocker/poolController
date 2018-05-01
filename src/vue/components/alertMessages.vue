<script>
  import { alerts, serverConnected } from '../socket.js';

  export default {
    props: ['maintenanceMode'],
    components: {},
    data: function () {
      return {
        serverConnected,
      }
    },
    computed: {},
    methods: {},
    watch: {
    }
  }
</script>

<template>
  <div>
    <div
        class="red center"
        v-if="!serverConnected.status"
      >
      Disconnected
      </div>
      <div
        class="yellow center"
        v-if="maintenanceMode"
        >
        <!-- <template> -->
          Maintence Mode
        <!-- </template> -->
      </div>
  </div>
</template>

<style scoped>
  .green {
    background-color: green
  }
  .yellow {
    background-color: yellow
  }
  .red {
    background-color: red
  }
</style>