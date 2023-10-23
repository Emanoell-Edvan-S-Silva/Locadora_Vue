<template>
  <v-app id="background">
    <v-card class="pa-3 ma-5 elevation-3">
      <template>
        <v-toolbar flat class="mt-3">
          <v-col class="mt-4 mb-4">
            <v-row>
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
                      <v-form ref="form" v-model="valid" lazy-validation>
                        <v-col cols="12">
                          <v-text-field append-icon="mdi-account" v-model="editedItem.name" :rules="nameRules" label="Nome" required></v-text-field>
                        </v-col>
                        <v-col cols="12">
                          <v-text-field append-icon="mdi-email-edit" v-model="editedItem.email" :rules="emailRules" label="E-mail" required></v-text-field>
                        </v-col>
                        <v-col cols="12">
                          <v-text-field append-icon="mdi-city" v-model="editedItem.city" :rules="cityRules" label="Cidade" required></v-text-field>
                        </v-col>
                        <v-col cols="12">
                          <v-text-field append-icon="mdi-map-marker" v-model="editedItem.address" :rules="addressRules" label="Endereço" required></v-text-field>
                        </v-col>
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
              <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details class="mt-4"></v-text-field>
            </v-row>
          </v-col>
        </v-toolbar>
      </template>
      <v-data-table :headers="headers" :items="users" :search="search" sort-by="id" class="pa-3 ma-5 elevation-3" :loading="loading" loading-text="Carregando..." :header-props="{ 'sort-by-text': 'Ordenar por: ' }" :footer-props="{ 'items-per-page-text': 'Itens por página' }">
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
import User from "../services/userService";

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
  name: "UserView",

  data: () => ({
    loading: false,
    valid: false,
    search: "",
    dialog: false,

    headers: [
      { text: "Nome", value: "name" },
      { text: "E-mail", value: "email" },
      { text: "Cidade", value: "city" },
      { text: "Endereço", value: "address" },
      { text: "Ações", value: "actions", sortable: false },
    ],
    users: [],

    editedIndex: -1,
    editedItem: {
      address: "",
      city: "",
      email: "",
      id: 0,
      name: ""
    },
    defaultItem: {
      address: "",
      city: "",
      email: "",
      id: 0,
      name: ""
    },

    nameRules: [(v) => !!v || "Nome é obrigatório"],
    emailRules: [(v) => !!v || "E-mail é obrigatório", (v) => /.+@.+\..+/.test(v) || "E-mail Invalido"],
    cityRules: [(v) => !!v || "Cidade é obrigatório"],
    addressRules: [(v) => !!v || "Endereço é obrigatório"],
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Novo Usuário" : "Editar Usuário";
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
      this.loading = true;
      User.findAllUsers()
        .then((result) => {
          this.users = result.data;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    editItem(item) {
      this.editedIndex = 0;
      this.dialog = true;
      User.findByIdUser(item.id)
        .then((result) => {
          this.editedItem = result.data;
        })
        .catch((error) => {
          this.AlertError(error.response.data.errors[0]);
        });
    },

    save() {
      if (this.$refs.form.validate()) {
        if (this.editedIndex == -1) {
          User.createNewUser(this.editedItem)
            .then(() => {
              this.AlertAdd();
              this.close();
              this.getUsers();
              this.resetValidation();
            })
            .catch((error) => {
              this.AlertError(error.response.data.errors[0]);
            });
        } else {
          console.log(this.editItem);
          User.updateUser(this.editedItem)
            .then(() => {
              this.AlertEdit();
              this.close();
              this.getUsers();
              this.resetValidation();
            })
            .catch((error) => {
              this.AlertError(error.response.data.errors[0]);
            });
        }
      } else {
        Toast.fire({
          icon: "error",
          title: "Erro",
          text: "não foi possivel adicionar Usuários pois existe campos nulos",
        });
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
          this.deleteItem(item);
        }
      });
    },
    async deleteItem(item) {
      console.log(item);
      await User.deleteUser(item.id)
        .then(() => {
          this.getUsers();
          this.AlertDelete();
        })
        .catch((error) => {
          this.AlertError(error.response.data.detail);
        });
    },

    AlertEdit() {
      Toast.fire({
        icon: "success",
        title: "Usuário editado!",
        text: "Usuário foi editado com sucesso!",
      });
    },

    AlertAdd() {
      Toast.fire({
        icon: "success",
        title: "Sucesso!",
        text: "Usuário foi Adicionado com sucesso!",
      });
    },

    AlertDelete() {
      Toast.fire({
        icon: "success",
        title: "Deletado!",
        text: "Usuário foi deletado com sucesso!",
      });
    },

    AlertError(error) {
      Swal.fire("Ocorreu um erro", error, "error");
    },

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
      this.resetValidation();
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

@media (max-width: 900px) {
  .searchBar {
    display: flex;
  }
}
</style>
