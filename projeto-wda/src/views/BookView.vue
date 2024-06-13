<template>
  <v-app id="background">
    <v-card class="pa-3 ma-5 elevation-3">
      <template>
        <v-toolbar flat class="mt-3">
          <v-col class="mt-4 mb-4">
            <v-row>
              <v-toolbar-title class="text-h4">Livros</v-toolbar-title>
              <v-divider class="mx-4" inset vertical></v-divider>

              <v-dialog v-model="dialog" max-width="500px">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on"> Novo Livro </v-btn>
                </template>

                <v-card>
                  <v-card-title>
                    <span class="text-h5">{{ formTitle }}</span>
                  </v-card-title>

                  <v-card-text>
                    <v-container>
                      <v-form ref="form" v-model="valid" lazy-validation>
                        <v-row cols="12">
                          <v-col cols="12">
                            <v-text-field append-icon="mdi-account" v-model="editedItem.name" :rules="nameRules" label="Nome Livro" required></v-text-field>
                          </v-col>
                        </v-row>
                        <v-row cols="12">
                          <v-col cols="12">
                            <v-text-field append-icon="mdi-book-account-outline" :rules="authorRules" v-model="editedItem.author" label="Autor"></v-text-field>
                          </v-col>
                          <v-col cols="12">
                            <v-autocomplete item-text="name" item-value="id" v-model="editedItem.publisher.id" :rules="[(v) => !!v || 'Editora é obrigatório']" :items="publishers" label="Editoras" placeholder="Selecionar..." required lazy-validation></v-autocomplete>
                          </v-col>
                        </v-row>
                        <v-row cols="12">
                          <v-col cols="12" sm="6">
                            <v-text-field append-icon="mdi-clock-time-eight-outline" :rules="launchRules" v-model="editedItem.launch" label="Lançamento"></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="6">
                            <v-text-field append-icon="mdi-bookshelf" :rules="amountRules" v-model="editedItem.amount" label="Estoque"></v-text-field>
                          </v-col>
                        </v-row>
                      </v-form>
                    </v-container>
                  </v-card-text>

                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="red darken-1" text @click="close"> Cancelar </v-btn>
                    <v-btn color="blue darken-1" text :disabled="!valid" @click="save"> Salvar </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <v-spacer></v-spacer>
              <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details></v-text-field>
            </v-row>
          </v-col>
        </v-toolbar>
      </template>
      <v-data-table :headers="headers" :items="books" :search="search" sort-by="name" class="pa-3 ma-5 elevation-3" :loading="loading" loading-text="Carregando..." :header-props="{ 'sort-by-text': 'Ordenar por: ' }" :footer-props="{ 'items-per-page-text': 'Itens por página' }">
        <template slot="item.actions" slot-scope="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon class="blue--text mr-2 custom-icon" @click="editItem(item)" v-bind="attrs" v-on="on">mdi-pencil</v-icon>
            </template>
            <span>Editar</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon class="red--text mr-2 custom-icon" @click="ConfirmDeletar(item)" v-bind="attrs" v-on="on">mdi-delete</v-icon>
            </template>
            <span>Excluir</span>
          </v-tooltip>
        </template>
        <template v-slot:no-results>
          <span> Nenhum Resultado Encontrado... </span>
        </template>
      </v-data-table>
    </v-card>
  </v-app>
</template>

<script>
import "@mdi/font/css/materialdesignicons.min.css";
import Swal from "sweetalert2";
import Books from "../services/bookService";
import Publishers from "../services/publisherService";

const Toast = Swal.mixin({
  toast: true,
  position: "bottom-right",
  iconColor: "white",
  customClass: {
    popup: "colored-toast",
  },
  showConfirmButton: false,
  timer: 1500,
  timerProgressBar: true,
});

export default {
  name: "BookView",

  data: () => ({
    loading: false,
    valid: false,
    search: "",
    dialog: false,
    headers: [
      { text: "Nome", value: "name" },
      { text: "Autor", value: "author" },
      { text: "Editora", value: "publisher.name" },
      { text: "Lançamento", value: "launch" },
      { text: "Estoque", value: "amount" },
      { text: "Aluguéis Ativos", value: "active_rentals" },
      { text: "Ações", value: "actions", sortable: false },
    ],
    books: [],
    publishers: [],

    editedIndex: -1,
    editedItem: {
      amount: 0,
      author: "",
      id: 0,
      launch: 0,
      name: "",
      publisher: {
        id: 0,
        name: "",
      },
      active_rentals: 0,
    },
    defaultItem: {
      amount: 0,
      author: "",
      id: 0,
      launch: 0,
      name: "",
      publisher: {
        id: 0,
        name: "",
      },
      active_rentals: 0,
    },
    createItem: {
      amount: 0,
      author: "",
      launch: 0,
      name: "",
      publisherId: 0,
    },

    updateItem: {
      amount: 0,
      author: "",
      id: 0,
      launch: 0,
      name: "",
      publisherId: 0,
    },

    nameRules: [(v) => !!v || "Nome é obrigatório"],
    authorRules: [(v) => !!v || "E-mail é obrigatório"],
    launchRules: [(v) => !!v || "Lançamento é obrigatório"],
    amountRules: [(v) => !!v || "Estoque é obrigatório"],
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Novo Livro" : "Editar Livro";
    },
  },
  watch: {
    dialog(val) {
      val || this.close();
    },
  },
  mounted() {
    this.getbooks();
    this.geteditors();
    console.log(this.publishers);
  },

  methods: {
    getbooks() {
      this.loading = true;
      Books.findAllBooks()
        .then((result) => {
          this.books = result.data;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    geteditors() {
      Publishers.findAllPublishers().then((result2) => {
        console.log(result2.data);
        this.publishers = result2.data;
      });
    },

    editItem(item) {
      this.editedIndex = 0;
      this.dialog = true;
      Books.findByIdBook(item.id).then((result) => {
        this.editedItem = result.data;
      });
    },

    save() {
      if (this.$refs.form.validate() === true) {
        if (this.editedIndex == -1) {
          this.createItem.amount = this.editedItem.amount;
          this.createItem.author = this.editedItem.author;
          this.createItem.launch = this.editedItem.launch;
          this.createItem.name = this.editedItem.name;
          this.createItem.publisherId = this.editedItem.publisher.id;
          Books.createNewBook(this.createItem)
            .then(() => {
              this.AlertAdd();
              this.getbooks();
              this.close();
              this.resetValidation();
            })
            .catch((error) => {
              this.AlertError(error.response.data.errors[0]);
            });
        } else {
          this.updateItem.amount = this.editedItem.amount;
          this.updateItem.author = this.editedItem.author;
          this.updateItem.id = this.editedItem.id;
          this.updateItem.launch = this.editedItem.launch;
          this.updateItem.name = this.editedItem.name;
          this.updateItem.publisherId = this.editedItem.publisher.id;
          console.log(this.editItem);
          Books.updateBook(this.updateItem)
            .then(() => {
              this.AlertEdit();
              this.getbooks();
              this.resetValidation();
              this.close();
              
            })
            .catch((error) => {
              this.AlertError(error.response.data.errors[0]);
            });
        }
      } else {
        Toast.fire({
          icon: "error",
          title: "Erro",
          text: "não foi possivel adicionar Livro pois existe campos nulos",
        });
      }
    },

    ConfirmDeletar(item) {
      Swal.fire({
        title: "Deletar?",
        text: "Deseja deletar essa Editora?",
        icon: "error",
        showCancelButton: true,
        reverseButtons: true,
        confirmButtonColor: "#43A047",
        cancelButtonColor: "#d33",
        confirmButtonText: "Confirmar",
      }).then((result) => {
        if (result.isConfirmed) {
          this.deleteItem(item);
        }
      });
    },

    async deleteItem(item) {
      console.log(item);
      await Books.deleteBook(item.id)
        .then(() => {
          this.getbooks();
          this.AlertDelete();
        })
        .catch((error) => {
          this.AlertError(error.response.data.detail);
        });
    },

    AlertEdit() {
      Toast.fire({
        icon: "success",
        title: "Editora editada!",
        text: "Livro foi editado com sucesso!",
      });
    },

    AlertAdd() {
      Toast.fire({
        icon: "success",
        title: "Sucesso!",
        text: "Livro foi Adicionado com sucesso!",
      });
    },
    AlertDelete() {
      Toast.fire({
        icon: "success",
        title: "Deletado!",
        text: "Livro foi deletado com sucesso!",
      });
    },

    AlertError(error) {
      Swal.fire("Ocorreu um erro", error, "error");
    },

    close() {
      this.resetValidation();
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem.publisher.id = null;
        this.editedItem.name = "";
        this.editedItem.author = "";
        this.editedItem.launch = 0;
        this.editedItem.amount = 0;

        this.createItem.publisherId = null;
        this.createItem.name = "";
        this.createItem.author = "";
        this.createItem.launch = 0;
        this.createItem.amount = 0;
        this.editedIndex = -1;
      });
      console.log(this.editedItem);
    },

    resetValidation() {
      this.$refs.form.resetValidation();
    },
  },
};
</script>

<style>
.swal2-popup {
  font-size: 1rem !important;
  font-family: sans-serif;
}
.colored-toast.swal2-icon-success {
  background-color: #689f38 !important;
}

.colored-toast.swal2-icon-error {
  background-color: #e53935 !important;
}

.colored-toast.swal2-icon-warning {
  background-color: #f8bb86 !important;
}

.colored-toast.swal2-icon-info {
  background-color: #3fc3ee !important;
}

.colored-toast.swal2-icon-question {
  background-color: #87adbd !important;
}

.colored-toast .swal2-title {
  color: white;
}

.colored-toast .swal2-close {
  color: white;
}

.colored-toast .swal2-html-container {
  color: white;
}
</style>
