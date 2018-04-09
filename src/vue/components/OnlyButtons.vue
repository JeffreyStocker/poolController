<script>
  import GroupOfPumpButtons from './GroupOfPumpButtons.vue';
  export default {
    computed: {},
    components: { GroupOfPumpButtons },
    data: function () {
      return {}
    },
    props: ['buttons', 'setMessage', 'title'],
    methods: {},
    watch: {}
  }
</script>

<template>
  <div class="col-sm-2 center">
    <Label>{{title || 'Unknown'}}</Label>
    <GroupOfPumpButtons
      v-bind:buttons="buttons"
      v-bind:setMessage="setMessage"
      >
    </GroupOfPumpButtons>
  </div>
</template>

<style>
</style>