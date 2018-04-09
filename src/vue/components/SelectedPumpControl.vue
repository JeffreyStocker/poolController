<script>
  import GroupOfPumpButtons from './GroupOfPumpButtons.vue';

  export default {
    computed: {
      range() {
        var step = 100;
        var range = [];
        for (let i = 800; i < 3400 + step; i += step) {
          range.push (i);
        }
        return range;
      }
    },
    components: { GroupOfPumpButtons },
    data: function () {
      return {
        selected: 1600
      }
    },
    props: ['setMessage', 'buttons', 'title'],
    methods: {},
    watch: {}
  }
</script>

<template>
  <div class="col-sm-2 center">
    <Label for="speedInput">{{title || 'Unknown'}}</Label>
    <!-- <label for="speedInput">Speed in RPM & Save Prog 1:</label> -->
    {{selected}}
    <select id= "speedInput" class="form-control speedInput" v-model="selected">
      <option v-for="(speed, index) in range"
        v-bind:key="index"
        v-text="speed"
      ></option>
    </select>
    <GroupOfPumpButtons
      v-bind:setMessage="setMessage"
      v-bind:buttons="buttons">
    </GroupOfPumpButtons>
  </div>
</template>

<style>
</style>

// <!-- <input id= "speedInput" type="number" class="form-control" > -->
