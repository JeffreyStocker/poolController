<script>
  import ButtonPump from './ButtonPump.vue';
  import DoubleButton from './DoubleButton.vue';
  import Box from './box.vue'
  export default {
    components: { ButtonPump, DoubleButton, Box },
    data: function () {
      return {}
    },
    props: ['button1', 'button2', 'setMessage']
  }
</script>

<template>
  <div class='test'>
    <ButtonPump class="btnSplit testContainer"
      :name="button1.name"
      :onClick="setMessage"
      :onClickData="button1.data"
      />
    <ButtonPump class="btnSplit"
      :name="button2.name"
      :onClick="setMessage"
      :onClickData="button2.data"
      />
  </div>
</template>

<style scoped>
  .test {
    display: flex;
    justify-content: space-between;
  }
  .testContainer {
    flex-grow: 1;
    margin-right: 0.25em;
  }

</style>