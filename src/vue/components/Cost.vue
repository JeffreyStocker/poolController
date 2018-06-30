<script>
  export default {
    computed: {
      kilowatt () {
        return this.watts / 1000;
      },
      cost () {
        var cost = (~~(this.kilowatt * 0.33 * 100)) / 100;
        var costStr = ('' + cost).split('.');
        if (costStr[1] !== undefined) {

          while(costStr[1].length < 2) {
            costStr[1] += '0';
          }
        } else {
          costStr[1] = '00';
        }
        return costStr.join('.');
      }
    },
    data: function () {
      return {}
    },
    props: ['watts'],
  }
</script>

<template>
  <div>
    This cost you: ${{ this.cost }}
  </div>
</template>

<style>
</style>