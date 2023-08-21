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
                            <v-text-field append-icon="mdi-account" v-model="editedItem.nome" :rules="nameRules" label="Nome Livro" required></v-text-field>
                          </v-col>
                        </v-row>
                        <v-row cols="12">
                          <v-col cols="12" sm="6">
                            <v-text-field append-icon="mdi-book-account-outline" :rules="authorRules" v-model="editedItem.autor" label="Autor"></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="6">
                            <v-autocomplete item-text="nome" item-value="id" v-model="editedItem.editora.id" :rules="[(v) => !!v || 'Editora é obrigatório']" :items="editor" label="Editoras" placeholder="Selecionar..." required></v-autocomplete>
                          </v-col>
                        </v-row>
                        <v-row cols="12">
                          <v-col cols="12" sm="6">
                            <v-text-field append-icon="mdi-clock-time-eight-outline" :rules="launchRules" v-model="editedItem.lancamento" label="Lançamento"></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="6">
                            <v-text-field append-icon="mdi-bookshelf" v-model="editedItem.quantidade" label="Estoque"></v-text-field>
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
      <v-data-table :headers="headers" :items="books" :search="search" sort-by="id" class="pa-3 ma-5 elevation-3">
        <template slot="item.acoes" slot-scope="{ item }">
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
        <template v-slot:no-data>
          <div class="text-center">
            Carregando...
            <v-progress-circular indeterminate color="primary" class="ml-2" :width="2" :size="20"></v-progress-circular>
          </div>
        </template>
      </v-data-table>
    </v-card>
  </v-app>
</template>

<script>
import "@mdi/font/css/materialdesignicons.min.css";
import Swal from "sweetalert2";
import Books from "../services/book_service";
import Editors from "../services/editor_service";

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
    valid: false,
    search: "",
    dialog: false,
    headers: [
      { text: "ID", value: "id", align: "start", sortable: false },
      { text: "Nome", value: "nome" },
      { text: "Autor", value: "autor" },
      { text: "Editora", value: "editora.nome" },
      { text: "Lançamento", value: "lancamento" },
      { text: "Estoque", value: "quantidade" },
      { text: "Alugados", value: "totalalugado" },
      { text: "Ações", value: "acoes", sortable: false },
    ],
    books: [],
    editor: [],

    editedIndex: -1,
    editedItem: {
      id: 0,
      nome: "",
      editora: {
        id: 0,
        cidade: "",
        nome: "",
      },
      lancamento: "",
      quantidade: 1,
      totalalugado: 0,
    },
    defaultItem: {
      id: 0,
      nome: "",
      editora: {
        cidade: "",
        id: 0,
        nome: "",
      },
      lancamento: "",
      quantidade: 0,
    },
    nameRules: [(v) => !!v || "Nome é obrigatório"],
    authorRules: [(v) => !!v || "E-mail é obrigatório"],
    launchRules: [(v) => !!v || "Cidade é obrigatório"],
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
    console.log(this.editor);
  },

  methods: {
    getbooks() {
      Books.getlistbooks().then((result) => {
        console.log(result.data);
        this.books = result.data;
      });
    },
    geteditors() {
      Editors.getlisteditors().then((result2) => {
        console.log(result2.data);
        this.editor = result2.data;
      });
    },

    editItem(item) {
      this.editedIndex = !this.editedIndex;
      this.dialog = true;
      Books.getuniquebook(item.id).then((result) => {
        this.editedItem = result.data;
      });
    },

    deleteItem(item) {
      console.log(item);
      Books.deletebook(item).then(() => {
        this.getbooks();
      });
    },

    save() {
      if (this.$refs.form.validate() === true) {
        if (this.editedIndex == -1) {
          console.log(this.editedItem);
          Books.postaddbook(this.editedItem)
            .then(() => {
              this.AlertAdd();
              this.getbooks();
              this.close();
            })
            .catch((error) => {
              this.AlertError(error.detail);
            });
        } else {
          console.log(this.editItem);
          Books.putbookupdate(this.editedItem)
            .then(() => {
              this.AlertEdit();
              this.getbooks();
              this.close();
            })
            .catch((error) => {
              this.AlertError(error.detail);
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
          Swal.fire("Deleted!", "Your file has been deleted.", "success", this.deleteItem(item));
        }
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

    AlertError(error) {
      Swal.fire("Ocorreu um erro", error.detail, "error");
    },

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
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
