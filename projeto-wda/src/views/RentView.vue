<template>
  <v-app id="background">
    <v-card class="pa-3 ma-5 elevation-3">
      <template>
        <v-toolbar flat class="mt-3">
          <v-col class="mt-4 mb-4">
            <v-row>
              <v-toolbar-title class="text-h4">Aluguéis</v-toolbar-title>
              <v-divider class="mx-4" inset vertical></v-divider>

              <v-dialog v-model="dialog" max-width="500px">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on"> Novo Aluguel </v-btn>
                </template>

                <v-card>
                  <v-card-title>
                    <span class="text-h5">{{ formTitle }}</span>
                  </v-card-title>

                  <v-card-text>
                    <v-container>
                      <v-form ref="form" v-model="valid" lazy-validation>
                        <v-row>
                          <v-col cols="12">
                            <v-autocomplete item-text="nome" item-value="id" v-model="editedItem.usuario_id.id" :rules="[(v) => !!v || 'Usuário é obrigatório']" :items="users" label="Usuário" placeholder="Selecionar..." required></v-autocomplete>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col cols="12">
                            <v-autocomplete item-text="nome" item-value="id" v-model="editedItem.livro_id.id" :rules="[(v) => !!v || 'Livro é obrigatório']" :items="availableBooks" label="Livro" placeholder="Selecionar..." required></v-autocomplete>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col cols="12" sm="6">
                            <v-text-field v-model="editedItem.data_aluguel" label="Data de Aluguel" readonly></v-text-field>
                          </v-col>
                          <v-col>
                            <v-dialog ref="dialog" v-model="modal" :return-value.sync="editedItem.data_previsao" persistent width="290px">
                              <template v-slot:activator="{ on, attrs }">
                                <v-text-field :rules="[(v) => !!v || 'Data é obrigatório']" v-model="editedItem.data_previsao" label="Data de previsão" readonly v-bind="attrs" v-on="on"></v-text-field>
                              </template>
                              <v-date-picker v-model="editedItem.data_previsao" scrollable :min="minDate" :max="maxDate">
                                <v-spacer></v-spacer>
                                <v-btn text color="primary" @click="modal = false"> Cancel </v-btn>
                                <v-btn text color="primary" @click="$refs.dialog.save(editedItem.data_previsao, editedItem.data_devolucao)"> OK </v-btn>
                              </v-date-picker>
                            </v-dialog>
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
              <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details class="mt-4"></v-text-field>
            </v-row>
          </v-col>
        </v-toolbar>
      </template>
      <v-data-table :headers="headers" :items="filteredReturnedRentals" sort-by="data_devolucao" class="pa-3 ma-5 elevation-3">
        <template slot="item.acoes" slot-scope="{ item }">
          <v-tooltip bottom v-if="!item.data_devolucao">
            <template v-slot:activator="{ on, attrs }">
              <v-icon class="green--text mr-2 custom-icon" @click="ConfirmDelivery(item)" v-bind="attrs" v-on="on">mdi-book-check</v-icon>
            </template>
            <span>Devolver</span>
          </v-tooltip>
          <v-tooltip bottom v-if="!item.data_devolucao">
            <template v-slot:activator="{ on, attrs }">
              <v-icon class="red--text mr-2 custom-icon" @click="ConfirmDeletar(item)" v-bind="attrs" v-on="on">mdi-delete</v-icon>
            </template>
            <span>Excluir</span>
          </v-tooltip>
        </template>
        <template slot="item.status" slot-scope="{ item }">
          <v-chip style="background-color: transparent">
            <span class="pa-1 pl-3 pr-3" :style="getStatusStyle(item.data_previsao, item.data_devolucao)">{{ getStatusLabel(item.data_previsao, item.data_devolucao) }}</span>
          </v-chip>
        </template>
        <template v-slot:no-data>
          <div class="text-center">
            Carregando...
            <v-progress-circular indeterminate color="primary" class="ml-2" :width="2" :size="20"></v-progress-circular>
          </div>
        </template>
        <template slot="item.data_aluguel" slot-scope="{ item }">
          {{ item.data_aluguel | formatDate }}
        </template>
        <template slot="item.data_previsao" slot-scope="{ item }">
          {{ item.data_previsao | formatDate }}
        </template>
        <template slot="item.data_devolucao" slot-scope="{ item }">
          {{ item.data_devolucao | formatDate }}
        </template>
      </v-data-table>
    </v-card>
  </v-app>
</template>

<script>
import "@mdi/font/css/materialdesignicons.min.css";
import Swal from "sweetalert2";
import Rent from "../services/rent_service";

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
  name: "RentView",

  data: () => ({
    valid: true,
    minDate: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().substr(0, 10),
    maxDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substr(0, 10),
    search: "",
    dialog: false,
    modal: false,
    headers: [
      { text: "ID", value: "id", align: "start" },
      { text: "Nome Usuario", value: "usuario_id.nome" },
      { text: "Nome Livro", value: "livro_id.nome" },
      { text: "Data de Aluguel", value: "data_aluguel", sortable: false },
      { text: "Data de Previsão", value: "data_previsao", sortable: false },
      { text: "Entrega", value: "data_devolucao", sortable: false },
      { text: "Status", value: "status", sortable: false, align: "center" },
      { text: "Ações", value: "acoes", sortable: false },
    ],
    users: [],
    rents: [],
    availableBooks: [],
    editedIndex: -1,
    editedItem: {
      id: 0,
      data_aluguel: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().substr(0, 10),
      data_previsao: "",
      data_devolucao: "",
      livro_id: {
        id: null,
        nome: "",
        editora: {
          id: 0,
          nome: "",
          cidade: "",
        },
        autor: "",
        lancamento: 0,
        quantidade: 0,
        totalalugado: 0,
      },
      usuario_id: {
        id: null,
        nome: "",
        endereco: "",
        cidade: "",
        email: "",
      },
    },
    defaultItem: {
      id: null,
      data_aluguel: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().substr(0, 10),
      data_previsao: "",
      data_devolucao: "",
      livro_id: {
        id: null,
        nome: "",
        editora: {
          id: null,
          nome: "",
          cidade: "",
        },
        autor: "",
        lancamento: 0,
        quantidade: 0,
        totalalugado: 0,
      },
      usuario_id: {
        id: null,
        nome: "",
        endereco: "",
        cidade: "",
        email: "",
      },
    },
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Novo Aluguel" : "Editar Aluguel";
    },

    filteredReturnedRentals() {
      return this.rents.filter((rents) => this.matchesSearch(rents, this.search));
    },
  },
  watch: {
    dialog(val) {
      val || this.close();
    },
  },
  mounted() {
    this.getRents();
    console.log(this.rents);
    this.getAvailableBooks();
    this.getUsers();
  },
  filters: {
    formatDate: function (value) {
      if (value) {
        const todaydate = new Date(value);
        const day = String(todaydate.getDate()).padStart(2, "0");
        const month = String(todaydate.getMonth() + 1).padStart(2, "0");
        const year = todaydate.getFullYear();
        return `${day}/${month}/${year}`;
      }
      return "";
    },
  },
  methods: {
    getRents() {
      Rent.getListRents().then((result) => {
        console.log(result.data);
        this.rents = result.data;
        this.teste = result.usuario_id;
      });
    },
    getAvailableBooks() {
      Rent.getBooksAvailable().then((result) => {
        console.log(result.data);
        this.availableBooks = result.data;
      });
    },
    getUsers() {
      Rent.getListUsers().then((result) => {
        console.log(result.data);
        this.users = result.data;
      });
    },
    getStatusLabel(dataPrevisao, data_devolucao) {
      if (data_devolucao != null) {
        if (dataPrevisao >= data_devolucao) {
          return "Entregue no prazo";
        } else {
          return "Entregue com atraso";
        }
      } else {
        return "Pendente";
      }
    },
    getStatusStyle(dataPrevisao, data_devolucao) {
      const style = {};
      if (data_devolucao != null) {
        if (dataPrevisao < data_devolucao) {
          style.background = "#E65C5C";
          style.borderRadius = "100px";
        } else {
          style.background = "#5CE66A";
          style.borderRadius = "100px";
        }
      } else {
        style.background = "#F8C43E";
        style.borderRadius = "100px";
      }

      return style;
    },
    deleteItem(item) {
      console.log(item);
      Rent.deleteRent(item).then(() => {
        this.getRents();
      });
    },
    Delivery(item) {
      Rent.putRentUpdate(item)
        .then(() => {
          console.log(item);
          this.close();
          this.getRents();
        })
        .catch((error) => {
          this.AlertError(error.response.data.error);
        });
    },
    save() {
      if (this.$refs.form.validate() == true) {
        Rent.postAddRent(this.editedItem)
          .then(() => {
            this.AlertAdd();
            this.close();
            this.getRents();
            this.resetValidation();
            this.editedItem.usuario_id.id = null;
            this.editedItem.livro_id.id = null;
          })
          .catch((error) => {
            this.AlertError(error.response.data.error);
          });
      } else {
        Toast.fire({
          icon: "error",
          title: "Erro",
          text: "não foi possivel adicionar editora pois existe campos nulos",
        });
      }
    },

    ConfirmDeletar(item) {
      if (item.data_devolucao == null) {
        Swal.fire({
          title: "Deletar?",
          text: "Deseja deletar esse aluguel?",
          icon: "error",
          showCancelButton: true,
          reverseButtons: true,
          confirmButtonColor: "#43A047",
          cancelButtonColor: "#d33",
          confirmButtonText: "Confirmar",
        }).then((result) => {
          if (result.isConfirmed) {
            Toast.fire({
              icon: "success",
              title: "Sucesso!",
              text: "Aluguel deletado com sucesso!!",
            });
            this.deleteItem(item);
          }
        });
      } else {
        Toast.fire({
          icon: "error",
          title: "Não é possivel",
          text: "Não pode apagar registro que ja foi entregue",
        });
      }
    },

    async ConfirmDelivery(item) {
      console.log(item);
      if (item.data_devolucao == null) {
        Swal.fire({
          title: "Confirmação",
          text: "Deseja dar baixa nesse aluguel?",
          icon: "question",
          showCancelButton: true,
          reverseButtons: true,
          confirmButtonColor: "#43A047",
          cancelButtonColor: "#d33",
          confirmButtonText: "Confirmar",
        }).then((result) => {
          if (result.isConfirmed) {
            const today = new Date().toISOString().substr(0, 10);
            item.data_devolucao = today;
            console.log(item);
            Toast.fire({
              icon: "success",
              title: "Entregue!!",
              text: "Baixa feita com sucesso",
            });
            this.Delivery(item);
            console.log(item);
          }
        });
      } else {
        Swal.fire("Livro já foi entregue", "Esse aluguel já foi dado baixa", "error");
      }
    },

    AlertAdd() {
      Toast.fire({
        icon: "success",
        title: "Sucesso!",
        text: "Editora foi Adicionada com sucesso!",
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

    matchesSearch(rents, search) {
      const searchLower = search.toLowerCase();
      const userIdMatches = String(rents.id).toLowerCase().includes(searchLower);
      const userNameMatches = rents.usuario_id.nome.toLowerCase().includes(searchLower);
      const bookNameMatches = rents.livro_id.nome.toLowerCase().includes(searchLower);
      const statusMatches = this.getStatusLabel(rents.data_previsao, rents.data_devolucao).toLowerCase().includes(searchLower);
      const dateMatches = this.matchesDateSearch(rents.data_aluguel, searchLower) || this.matchesDateSearch(rents.data_previsao, searchLower) || this.matchesDateSearch(rents.data_devolucao, searchLower);

      return statusMatches || userIdMatches || userNameMatches || bookNameMatches || dateMatches;
    },

    matchesDateSearch(dateString, search) {
      if (!dateString) {
        return false;
      }

      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = String(date.getFullYear());

      const formattedDate = `${day}/${month}/${year}`;
      return formattedDate.includes(search);
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
.chip-custom {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80%;
  font-weight: 700;
  text-transform: uppercase;
  padding: 6px 10px;
  border-radius: 20px;
  font-size: 12px;
  background-color: #fff;
}
</style>
