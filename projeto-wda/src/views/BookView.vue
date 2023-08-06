<template>
  <v-app>
    <v-card class="pa-3 ma-5">
      <template>
        <v-data-table :headers="headers" :items="books" :search="search" class="elevation-1">
          <template v-slot:top>
            <v-toolbar flat>
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
                      <v-row>
                        <v-col cols="12">
                          <v-text-field :rules="rules" v-model="editedItem.nome" label="Nome Livro"></v-text-field>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="12" sm="6">
                          <v-text-field :rules="rules" v-model="editedItem.autor" label="Autor"></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6">
                          <v-select :items="editor" item-text="nome" item-value="id" v-model="editedItem.editora.id" label="Editora"></v-select>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="12" sm="6">
                          <v-text-field v-model="editedItem.lancamento" label="Lançamento"></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6">
                          <v-text-field v-model="editedItem.quantidade" label="Estoque"></v-text-field>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-card-text>

                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="close"> Cancel </v-btn>
                    <v-btn color="blue darken-1" text @click="save"> Save </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <v-spacer></v-spacer>
              <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details></v-text-field>
            </v-toolbar>
          </template>
          <template slot="item.acoes" slot-scope="{ item }">
            <v-icon class="mr-2" @click="editItem(item)">mdi-pencil</v-icon>
            <v-icon @click="ConfirmDeletar(item)">mdi-delete</v-icon>
          </template>
          <template v-slot:no-data>
            <div class="text-center">
              Carregando...
              <v-progress-circular indeterminate color="primary" class="ml-2" :width="2" :size="20"></v-progress-circular>
            </div>
          </template>
        </v-data-table>
      </template>
    </v-card>
  </v-app>
</template>

<script>
import "@mdi/font/css/materialdesignicons.min.css";
import Swal from "sweetalert2";
import Books from "../services/book_service";
import Editors from "../services/editor_service";

export default {
  name: "BookView",

  data: () => ({
    search: '',
    dialog: false,
    dialogDelete: false,
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
      estoque: 0,
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
      estoque: 0,
    },
    rules: [(value) => !!value || "Required.", (value) => (value && value.length >= 3) || "Minimo 3 caracteres"],
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "New Item" : "Edit Item";
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
      if (this.editedIndex > 0) {
        Object.assign(this.books[this.editedIndex], this.editedItem);
        console.log(this.formTitle);
      } else {
        if (this.editedItem.id != 0) {
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
        } else {
          if (this.editedItem.autor.length < 3 || this.editedItem.nome.length < 3) {
            Swal.fire("", "Insira uma quantidades caracteres validos", "error");
          } else {
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
          }
        }
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
      Swal.fire("Sucesso", "A editora foi editada com sucesso", "success");
    },

    AlertAdd() {
      Swal.fire("Sucesso", "A editora foi Adicionada com sucesso", "success");
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
