<template>
  <v-app id="background">
    <v-card class="pa-3 ma-5 elevation-3">
      <template>
        <v-toolbar flat class="mt-3">
          <v-col class="mt-4 mb-4">
            <v-row>
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
                      <v-form ref="form" v-model="valid" lazy-validation>
                        <v-col cols="12">
                          <v-text-field append-icon="mdi-domain" v-model="editedItem.name" :rules="nameRules" label="Nome Editora" required></v-text-field>
                        </v-col>
                        <v-col cols="12">
                          <v-text-field append-icon="mdi-city" v-model="editedItem.city" :rules="cityRules" label="Cidade" required></v-text-field>
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
              <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details></v-text-field>
            </v-row>
          </v-col>
        </v-toolbar>
      </template>
      <v-data-table :headers="headers" :items="publishers" :search="search" class="pa-3 ma-5 elevation-3" sort-by="name" :loading="loading" loading-text="Carregando..." :header-props="{ 'sort-by-text': 'Ordenar por: ' }" :footer-props="{ 'items-per-page-text': 'Itens por página' }">
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
          <span> Nenhum Resultado Encontrado </span>
        </template>
      </v-data-table>
    </v-card>
  </v-app>
</template>

<script>
import "@mdi/font/css/materialdesignicons.min.css";
import Swal from "sweetalert2";
import Publisher from "../services/publisherService";

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
  name: "PublisherView",

  data: () => ({
    loading: false,
    valid: false,
    search: "",
    dialog: false,

    headers: [
      { text: "Nome", value: "name", align: "center" },
      { text: "Cidade", value: "city", align: "center" },
      { text: "Ações", value: "actions", sortable: false, align: "center" },
    ],

    publishers: [],

    delete: {},

    modalUpdateAndCreate: -1,

    editedItem: {
      city: "",
      id: 0,
      name: "",
    },

    defaultItem: {
      city: "",
      id: 0,
      name: "",
    },

    nameRules: [(v) => !!v || "Nome é obrigatório"],
    cityRules: [(v) => !!v || "Cidade é obrigatório"],
  }),

  computed: {
    formTitle() {
      return this.modalUpdateAndCreate === -1 ? "Nova Editora" : "Editar Editora";
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
  },

  mounted() {
    this.findAllPublishers();
    console.log(this.publishers);
  },

  methods: {
    findAllPublishers() {
      this.loading = true;
      Publisher.findAllPublishers()
        .then((result) => {
          this.publishers = result.data;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    editItem(item) {
      this.modalUpdateAndCreate = 0;
      this.dialog = true;
      Publisher.findByIdPublisher(item.id)
        .then((result) => {
          this.editedItem = result.data;
        })
        .catch((error) => {
          this.AlertError(error.response.data.errors[0]);
        });
    },

    save() {
      if (this.$refs.form.validate() === true) {
        if (this.modalUpdateAndCreate == 0) {
          console.log(this.editedItem);
          Publisher.updatePublisher(this.editedItem)
            .then(() => {
              this.AlertEdit();
              this.close();
              this.findAllPublishers();
              this.resetValidation();
            })
            .catch((error) => {
              this.AlertError(error.response.data.errors[0]);
            });
        } else {
          Publisher.createNewPublisher(this.editedItem)
            .then(() => {
              this.AlertAdd();
              this.close();
              this.findAllPublishers();
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
          text: "não foi possivel adicionar editora pois existe campos nulos",
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
      await Publisher.deletePublisher(item.id)
        .then(() => {
          this.findAllPublishers();
          this.AlertDelete();
        })
        .catch((error) => {
          this.AlertError(error.response.data.errors[0]);
        });
    },

    AlertEdit() {
      Toast.fire({
        icon: "success",
        title: "Editora editada!",
        text: "Editora foi editada com sucesso!",
      });
    },

    AlertAdd() {
      Toast.fire({
        icon: "success",
        title: "Sucesso!",
        text: "Editora foi Adicionada com sucesso!",
      });
    },
    
    AlertDelete() {
      Toast.fire({
        icon: "success",
        title: "Sucesso!",
        text: "Editora foi Deletada com sucesso!",
      });
    },

    AlertError(error) {
      Swal.fire("Ocorreu um erro", error, "error");
    },

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.Model);
        this.modalUpdateAndCreate = -1;
      });
      this.resetValidation();
    },
    
    resetValidation() {
      this.$refs.form.resetValidation();
    },
  },
};
</script>

<style scoped>
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
