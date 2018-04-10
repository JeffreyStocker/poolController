<script>
  import GroupOfPumpButtons from './GroupOfPumpButtons.vue';
  import ButtonPump from './ButtonPump.vue';

  export default {
    computed: {
      range() {
        var step = 100;
        var range = [];
        for (let i = 800; i < 3400 + step; i += step) {
          range.push (i);
        }
        return range;
      },
      selectedAndName() {
        return 'save & Run: ' +  this.selected + ' RPMs';
      }
    },
    components: { GroupOfPumpButtons, ButtonPump },
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
    <select id= "speedInput" class="form-control speedInput" v-model="selected">
      <option v-for="(speed, index) in range"
        v-bind:key="index"
        v-text="speed"
      ></option>
    </select>
    <ButtonPump :onClick="setMessage" :name="selectedAndName" :onClickData="[selected]">
    </ButtonPump>
    <!-- <GroupOfPumpButtons
      v-bind:setMessage="setMessage"
      v-bind:buttons="buttons">
    </GroupOfPumpButtons> -->
  </div>
</template>

<style>
</style>

// <!-- <input id= "speedInput" type="number" class="form-control" > -->
