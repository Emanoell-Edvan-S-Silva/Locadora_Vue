<template>

    <v-list class="mb-5 mt-5" nav dense>

      <v-list-item class="mx-lg-auto mb-5">
        <v-img max-height="59" max-width="172" src="../assets/images/logo-sidebar.png"></v-img>
      </v-list-item>

      <v-divider></v-divider>

      <v-list-item-group v-model="selectedItem" color="primary">
        <v-list-item v-for="(item, i) in items" :key="i" :to="item.url"  class="mt-2">

          <v-list-item-icon>
            <v-icon v-text="item.icon"></v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title v-text="item.text"></v-list-item-title>
          </v-list-item-content>

        </v-list-item>
      </v-list-item-group>
      
    </v-list>

</template>
  
<script>
export default {

  data: () => ({

    selectedItem: 0,
    items: [
      { url:'/',text: 'DashBoard', icon: 'mdi-home' },
      { url:'/Users',text: 'Usuario', icon: 'mdi-account-circle' },
      { url:'/Books',text: 'Livros', icon: 'mdi-notebook-outline' },
      { url:'/Publishers',text: 'Editoras', icon: 'mdi-bookshelf' },
      { url:'/OutstandingRentals',text: 'Alugueis', icon: 'mdi-format-list-checkbox' }
    ],
  }),

}
</script>