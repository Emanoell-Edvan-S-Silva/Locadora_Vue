<template>
  <v-app>

    <v-navigation-drawer v-model="drawer" app dark>
      <Sidebar />
    </v-navigation-drawer>

    <v-app-bar app>

      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-row justify="space-between">
        <img class="ml-3" src="./assets/images/logo-menu.png" alt="WDA" height="55">
      </v-row>
    </v-app-bar>


    <v-main>
      <router-view />
    </v-main>

  </v-app>
</template>

<script>

import Sidebar from './components/SidebarComp.vue';

export default {
  name: 'App',

  components: {
    Sidebar,
  },


  data: () => ({
    drawer: null,
  }),
};
</script>