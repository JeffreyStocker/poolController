<script>
  export default {
    computed: {
      kilowatt () {
        return this.watts / 1000;
      },
      centsPerKwatt () {
        return this.costOfPower || 40;
      },
      cost () {
        var cost = (~~(this.kilowatt * this.centsPerKwatt)) / 100;
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
    props: ['watts', 'costOfPower'],
  }
</script>

<template>
  <div>
    This cost you: ${{ this.cost }} at {{this.centsPerKwatt}}¢ per kwatt
  </div>
</template>

<style>
</style>