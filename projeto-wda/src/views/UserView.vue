<template>
  <v-app id="background">
    <template>
      <v-data-table :headers="headers" :items="users" :search="search" sort-by="id" class="pa-3 ma-5 elevation-3">
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title class="text-h4">Usuário</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>

            <v-dialog v-model="dialog" max-width="500px">
              <template v-slot:activator="{ on, attrs }">
                <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on"> Novo Usuário </v-btn>
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
                        <v-text-field :rules="rules" v-model="editedItem.email" label="E-mail"></v-text-field>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12">
                        <v-text-field :rules="rules" v-model="editedItem.cidade" label="Cidade"></v-text-field>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12">
                        <v-text-field :rules="rules" v-model="editedItem.endereco" label="Endereço"></v-text-field>
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
          <v-icon class="blue--text mr-2" @click="editItem(item)">mdi-pencil</v-icon>
          <v-icon class="red--text" @click="ConfirmDeletar(item)">mdi-delete</v-icon>
        </template>
        <template v-slot:no-data>
          <div class="text-center">
            Carregando...
            <v-progress-circular indeterminate color="primary" class="ml-2" :width="2" :size="20"></v-progress-circular>
          </div>
        </template>
      </v-data-table>
    </template>
  </v-app>
</template>

<script>
import "@mdi/font/css/materialdesignicons.min.css";
import Swal from "sweetalert2";
import User from "../services/user_service";

export default {
  name: "UserView",

  data: () => ({
    search: "",
    dialog: false,

    headers: [
      { text: "ID", value: "id", align: "start" },
      { text: "Nome", value: "nome" },
      { text: "E-mail", value: "email" },
      { text: "Cidade", value: "cidade" },
      { text: "Endereço", value: "endereco" },
      { text: "Ações", value: "acoes", sortable: false },
    ],
    users: [],

    editedIndex: -1,
    editedItem: {
      cidade: "",
      email: "",
      endereco: "",
      id: null,
      nome: "",
    },
    defaultItem: {
      cidade: "",
      email: "",
      endereco: "",
      id: null,
      nome: "",
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
    this.getUsers();
    console.log(this.user);
  },

  methods: {
    getUsers() {
      User.getListUsers().then((result) => {
        console.log(result.data);
        this.users = result.data;
      });
    },

    deleteItem(item) {
      console.log(item);
      User.deleteUser(item).then(() => {
        this.getUsers();
      });
    },

    editItem(item) {
      this.editedIndex = !this.editedIndex;
      this.dialog = true;
      User.getUniqueUser(item.id).then((result) => {
        this.editedItem = result.data;
      });
    },

    save() {
      if (this.editedIndex > 0) {
        Object.assign(this.books[this.editedIndex], this.editedItem);
        console.log(this.formTitle);
      } else {
        if (this.editedItem.id != 0) {
          console.log(this.editItem);
          User.putUserUpdate(this.editedItem)
            .then(() => {
              this.AlertEdit();
              this.close();
              this.getUsers();
            })
            .catch((error) => {
              this.AlertError(error.detail);
            });
        } else {
          if (this.editedItem.nome.length < 3 || this.editedItem.cidade.length < 3) {
            Swal.fire("", "Insira uma quantidades caracteres validos", "error");
          } else {
            User.postAddUser(this.editedItem)
              .then(() => {
                this.AlertAdd();
                this.close();
                this.getUsers();
              })
              .catch((error) => {
                this.AlertError(error);
              });
          }
        }
      }
    },

    ConfirmDeletar(item) {
      Swal.fire({
        title: "Deletar?",
        text: "Deseja deletar esse usuário?",
        icon: "error",
        showCancelButton: true,
        reverseButtons: true,
        confirmButtonColor: "#43A047",
        cancelButtonColor: "#d33",
        confirmButtonText: "Confirmar",
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire("Deleted!", "Usuário deletado com sucesso", "success", this.deleteItem(item));
        }
      });
    },

    AlertEdit() {
      Swal.fire("Sucesso", "O usuário foi editado com sucesso", "success");
    },

    AlertAdd() {
      Swal.fire("Sucesso", "O usuário foi adicionado com sucesso", "success");
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
#background {
  background: #fafafa;
}
</style>
