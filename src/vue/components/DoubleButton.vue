<script>
  import ButtonPump from './ButtonPump.vue';
  export default {
    computed: {},
    components: { ButtonPump },
    data: function () {
      return {}
    },
    props: ['buttons', 'setMessage'],

  }
</script>

<template>
  <span>
    <ButtonPump :onClick="setMessage">

    </ButtonPump>
    <ButtonPump>

    </ButtonPump>
  </span>
</template>

<style>
</style>