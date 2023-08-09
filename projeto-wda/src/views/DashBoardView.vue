<template>
  <v-app id="background">
    <v-card class="pa-3 ma-5 elevation-3">
      <v-toolbar flat>
        <v-toolbar-title class="text-h4">Dashboard</v-toolbar-title>
      </v-toolbar>
      <v-layout justify-center>
        <v-flex xs12 sm12 md12 lg12 class="ma-4 mt-2 elevation-3">
          <v-card>
            <v-container fluid grid-list-lg>
              <v-toolbar flat>
                <v-toolbar-title class="text-h6 ma-n2">LIVROS MAIS ALUGADOS</v-toolbar-title>
              </v-toolbar>
              <v-layout row wrap>
                <v-flex v-for="card in cards" v-bind="{ [`lg${card.flex}`]: true }" :key="card.title">
                  <v-card raised dark :style="getStatusStyle()" class="mt-n4 elevation-3">
                    <v-container fill-height fluid pa-2>
                      <v-flex d-sm-inline-flex align-center>
                        <h1 class="mr-2">{{ card.title }}</h1>
                        <h3> Flex {{ card.flex }} columns</h3>
                      </v-flex>
                    </v-container>
                  </v-card>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card>
        </v-flex>
      </v-layout>
      <v-layout>
        <v-flex d-flex xs12 sm12 md9 lg7 :style="getStatusStyle()">
          <v-container fluid grid-list-lg>
            <v-card class="ma-1 elevation-3">
              <v-toolbar flat>
                <v-toolbar-title class="text-h6 ma-2">ALUGUÉIS EM ATRASO</v-toolbar-title>
              </v-toolbar>
              <v-card class="pa-2" flat>
                <v-data-table dense :headers="headers" :items="desserts" item-key="usuario_id.nome" hide-default-footer class="mt-n4 elevation-3"></v-data-table> </v-card
              ><v-toolbar flat>
                <v-toolbar-title class="text-h6 ma-2">LIVROS ADICIONADOS RECENTEMENTE</v-toolbar-title>
              </v-toolbar>
              <v-card class="pa-2" flat>
                <v-data-table dense :headers="headers2" :items="desserts2" item-key="usuario_id.nome" hide-default-footer class="mt-n4 elevation-3"></v-data-table>
              </v-card>
            </v-card>
          </v-container>
        </v-flex>
        <v-flex d-flex xs6 sm6 md5 lg5 class="ma-1">
          <v-container fluid grid-list-sm :style="getStatusStyle()">
            <v-card class="elevation-3">
              <v-toolbar flat>
                <v-toolbar-title class="text-h6 ma-2">USUÁRIO COM MAIS ALUGUÉIS</v-toolbar-title>
              </v-toolbar>
            </v-card>
            <v-card class="pb-2 mt-7 elevation-3">
              <v-toolbar flat>
                <v-toolbar-title class="text-h6 ma-2">ÚLTIMOS ALUGUÉIS</v-toolbar-title>
              </v-toolbar>
              <v-card color="#1E6EAA" class="ma-3 mt-n2 pa-2">
                <h3>l1</h3>
              </v-card>
              <v-card color="#1E6EAA" class="ma-3 pa-2">
                <h3>l2</h3>
              </v-card>
            </v-card>
          </v-container>
        </v-flex>
      </v-layout>
    </v-card>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      cards: [
        {
          title: "1",
          flex: 3,
        },
        {
          title: "2",
          flex: 3,
        },
        {
          title: "3",
          flex: 3,
        },
        {
          title: "4",
          flex: 3,
        },
      ],

      getStatusStyle() {
        const style = {
          background: "white",
          color: "black",
        };

        return style;
      },

      desserts: [
        {
          nome: 1,
          calories: 159,
          fat: 6.0,
          carbs: 24,
          protein: 4.0,
          iron: 1,
        },
        {
          id: 2,
          calories: 237,
          fat: 9.0,
          carbs: 37,
          protein: 4.3,
          iron: 1,
        },
        {
          id: 3,
          calories: 262,
          fat: 16.0,
          carbs: 23,
          protein: 6.0,
          iron: 7,
        },
        {
          id: 4,
          calories: 305,
          fat: 3.7,
          carbs: 67,
          protein: 4.3,
          iron: 8,
        },
        {
          id: 5,
          calories: 356,
          fat: 16.0,
          carbs: 49,
          protein: 3.9,
          iron: 16,
        },
      ],
      headers: [
      { text: "Nome Usuario", value: "usuario_id.nome" },
      { text: "Nome Livro", value: "livro_id.nome" },
      { text: "Data de Previsão", value: "data_previsao" },
      { text: "Status", value: "status" },
      { text: "Ações", value: "acoes", sortable: false },
      ],

      desserts2: [
        {
          nome: 1,
          calories: 159,
          fat: 6.0,
          carbs: 24,
          protein: 4.0,
          iron: 1,
        },
        {
          id: 2,
          calories: 237,
          fat: 9.0,
          carbs: 37,
          protein: 4.3,
          iron: 1,
        },
        {
          id: 3,
          calories: 262,
          fat: 16.0,
          carbs: 23,
          protein: 6.0,
          iron: 7,
        },
        {
          id: 4,
          calories: 305,
          fat: 3.7,
          carbs: 67,
          protein: 4.3,
          iron: 8,
        },
        {
          id: 5,
          calories: 356,
          fat: 16.0,
          carbs: 49,
          protein: 3.9,
          iron: 16,
        },
      ],
      headers2: [
      { text: "Nome", value: "nome" },
      { text: "Autor", value: "autor" },
      { text: "Editora", value: "editora.nome" },
      ],
    };
  },
};
</script>

<style>
#background {
  background: #fafafa;
}
</style>
