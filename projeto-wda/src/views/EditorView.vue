<template>
  <v-app>
    <v-card class="pa-3 ma-5">
      <template>
        <v-data-table :headers="headers" :items="editor" sort-by="nome" class="elevation-1" :items-per-page="5">
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title class="text-h4">Editora</v-toolbar-title>
              <v-divider class="mx-4" inset vertical></v-divider>

              <v-dialog v-model="dialog" max-width="500px">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on"> Nova Editora </v-btn>
                </template>

                <v-card>
                  <v-card-title>
                    <span class="text-h5">{{ formTitle }}</span>
                  </v-card-title>

                  <v-card-text>
                    <v-container>
                      <v-row>
                        <v-col cols="12">
                          <v-text-field :rules="rules" v-model="editedItem.nome" label="Nome"></v-text-field>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="12">
                          <v-text-field :rules="rules" v-model="editedItem.cidade" label="Cidade"></v-text-field>
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
import Editors from "../services/editor_service";

export default {
  name: "BookView",

  data: () => ({
    dialog: false,

    headers: [
      { text: "Nome", value: "nome" , align: 'center'},
      { text: "Cidade", value: "cidade", align: 'center' },
      { text: "Ações", value: "acoes", sortable: false, align: 'center'},
    ],
    editor: [],
    delete: {},

    editedIndex: -1,
    editedItem: {
      id: 0,
      cidade: "",
      nome: "",
    },
    defaultItem: {
      id: 0,
      cidade: "",
      nome: "",
    },

    rules: [(value) => !!value || "Required.",
    (value) => (value && value.length >= 3) || "Minimo 3 caracteres"],

  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "New Item" : "Edit Item"
    },
  },
  watch: {
    dialog(val) {
      val || this.close()
    },
  },
  mounted() {
    this.geteditors();
    console.log(this.editor)
  },

  methods: {
    geteditors() {
      Editors.getlisteditors().then((result) => {
        console.log(result.data)
        this.editor = result.data
      });
    },

    deleteItem(item) {
      console.log(item)
      Editors.deleteeditor(item)
      this.geteditors()
    },

    editItem(item) {
      this.editedIndex = !this.editedIndex
      this.dialog = true
      Editors.getuniqueeditor(item.id).then((result) => {
        this.editedItem = result.data
      });
    },

    save() {
      if (this.editedIndex > 0) {
        Object.assign(this.books[this.editedIndex], this.editedItem)
        console.log(this.formTitle)
      } else {
        if (this.editedItem.id != 0) {
          console.log(this.editItem)
          Editors.puteditorupdate(this.editedItem)
            .then(() => {
              this.AlertEdit()
              this.close()
              this.geteditors()
            })
            .catch((error) => {
              this.AlertError(error.detail)
            })
        } else {
          if (this.editedItem.nome.length < 3 || this.editedItem.cidade.length < 3) {
            Swal.fire("", "Insira uma quantidades caracteres validos", "error");
          } else {
            Editors.postaddeditor(this.editedItem).then(() => {
              this.AlertAdd()
              this.close()
              this.geteditors()
            })
            .catch((error) => {
              this.AlertError(error)
            })
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

    AlertError(error){
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
</style>
