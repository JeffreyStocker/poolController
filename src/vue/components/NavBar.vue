<script>
  import NavBarDropdown from './NavBarDropdown.vue';
  export default {
    computed: {
      // dropDownEquipmentName: function (name) {
      //   return name;
      // }
    },
    components: { NavBarDropdown },
    data: function () {
      return {
        dropdownState: false,
        dropDownEquipmentName: null
      }
    },
    props: ['listEquipment'],
    methods: {
       toggleState: function () {
         this.dropdownState = !this.dropdownState;
         },
         test: function (data) {
           console.log (data)
         },
         dropDownEquipmentNameUpdateEvt: function (evt) {
          //  console.log(event.target.text);
           this.dropDownEquipmentName = evt.target.text.trim();
           this.dropdownState = !this.dropdownState;
         },
        dropDownEquipmentNameUpdate: function (name) {
          //  console.log(event.target.text);
          console.log(name);
          console.log(name.trim());
           this.dropDownEquipmentName = name.trim();
           this.dropdownState = !this.dropdownState;
         }
    },
    watch: {}
  }
</script>

<template>
  <div>
    <div class="navbar navbarSize">
      <template v-for="equipment in listEquipment">
        <a
          :key="equipment.name"
          v-on:click="dropDownEquipmentNameUpdateEvt">
          {{equipment.name}}
        </a>
      </template>
      <!-- <a @click="dropDownEquipmentNameUpdate('Pump1')">testtt</a> -->
      <router-link to="/Settings" class="floatRight">Settings</router-link>
      <!-- <router-link to="/Graph">Graph</router-link> -->
      <!-- <button @click="toggleState">test</button> -->
      <!-- <button @click="test" class="navButton">Pump1</button> -->
    </div>
    <div class="navbarSize" />
    <NavBarDropdown
      v-if="dropdownState"
      :equipmentName="dropDownEquipmentName"
      :toggleState="toggleState"
      />

  </div>
</template>

<style>
.slide-fade-enter-active {
  transition: all .3s ease;
}
.slide-fade-leave-active {
  transition: all .2s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to {
  transform: translateX(-10px);
  opacity: 0;
}

.navButton {
  float: left;
  display: block;
  color: white;
  text-align: center;
  padding: 14px 16px;
  background-color: transparent;
  /* text-decoration: none; */
  /* cursor: pointer; */
  border: 0px
}
.navButton:hover {
  	background-color: #ddd;
	color: black;

}
.navButton:focus {
	background-color: #5C5C5C;
	/* text-decoration-color: white; */
	color: white;
}
</style>