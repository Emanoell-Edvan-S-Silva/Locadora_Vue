<template>
  <v-app id="background">
    <v-card class="pa-3 ma-5 elevation-3">
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
                          <v-autocomplete item-text="name" item-value="id" v-model="editedItem.user.id" :rules="[(v) => !!v || 'Usuário é obrigatório']" :items="users" label="Usuário" placeholder="Selecionar..." required></v-autocomplete>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="12">
                          <v-autocomplete item-text="name" item-value="id" v-model="editedItem.book.id" :rules="[(v) => !!v || 'Livro é obrigatório']" :items="availableBooks" label="Livro" placeholder="Selecionar..." required></v-autocomplete>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col>
                          <v-dialog ref="dialog" v-model="modal" :return-value.sync="editedItem.previsiondate" persistent width="290px">
                            <template v-slot:activator="{ on, attrs }">
                              <v-text-field :rules="[(v) => !!v || 'Data é obrigatório']" v-model="formattedPrevisionDate" label="Data de previsão" readonly v-bind="attrs" v-on="on"></v-text-field>
                            </template>
                            <v-date-picker v-model="editedItem.previsiondate" scrollable :min="minDate" :max="maxDate" locale="pt-br">
                              <v-spacer></v-spacer>
                              <v-btn text color="primary" @click="close()"> Cancelar </v-btn>
                              <v-btn text color="primary" @click="$refs.dialog.save(editedItem.previsiondate, editedItem.returndate)"> OK </v-btn>
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

      <v-row justify="space-around" class="mt-10">
        <v-col cols="10" md="4" lg="4">
          <v-btn depressed id="toggle-btn" text :class="{ active: !showReturned }" @click="toggleReturned(false)"> Pendentes </v-btn>
          <span class="separator"></span>
          <v-btn depressed id="toggle-btn" text :class="{ active: showReturned }" @click="toggleReturned(true)"> Devolvidos </v-btn>
        </v-col>
      </v-row>

      <v-data-table :headers="headers" :items="filteredRentals" :search="search" sort-by="returndate" class="pa-3 ma-5 elevation-3" :loading="loading" loading-text="Carregando..." :header-props="{ 'sort-by-text': 'Ordenar por: ' }" :footer-props="{ 'items-per-page-text': 'Itens por página' }">
        <template slot="item.actions" slot-scope="{ item }">
          <v-tooltip bottom v-if="!item.returndate">
            <template v-slot:activator="{ on, attrs }">
              <v-icon class="green--text mr-2 custom-icon" @click="ConfirmDelivery(item)" v-bind="attrs" v-on="on">mdi-book-check</v-icon>
            </template>
            <span>Devolver</span>
          </v-tooltip>
          <v-tooltip bottom v-if="item.returndate">
            <template v-slot:activator="{ on, attrs }">
              <v-icon class="red--text mr-2 custom-icon" @click="ConfirmDeletar(item)" v-bind="attrs" v-on="on">mdi-delete</v-icon>
            </template>
            <span>Excluir</span>
          </v-tooltip>
        </template>
        <template slot="item.rentaldate" slot-scope="{ item }">
          {{ item.rentaldate | formatDate }}
        </template>
        <template slot="item.previsiondate" slot-scope="{ item }">
          {{ item.previsiondate | formatDate }}
        </template>
        <template slot="item.returndate" slot-scope="{ item }">
          {{ item.returndate | formatDate }}
        </template>
        <template slot="item.status" slot-scope="{ item }">
          <v-chip style="background-color: transparent">
            <span class="chip-custom" :class="getColor(item)">
              {{ item.status }}
            </span>
          </v-chip>
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
import Rental from "../services/rentalService";

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
  name: "RentalView",

  data: () => ({
    loading: false,
    valid: true,
    showReturned: false,
    minDate: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().substr(0, 10),
    maxDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substr(0, 10),
    search: "",
    dialog: false,
    modal: false,
    headers: [
      { text: "Nome Usuario", value: "user.name" },
      { text: "Nome Livro", value: "book.name" },
      { text: "Data de Aluguel", value: "rentaldate", sortable: false },
      { text: "Data de Previsão", value: "previsiondate", sortable: false },
      { text: "Entrega", value: "returndate", sortable: false },
      { text: "Status", value: "status", sortable: false, align: "center" },
      { text: "Ações", value: "actions", sortable: false },
    ],
    users: [],
    rents: [],
    availableBooks: [],
    editedIndex: -1,
    editedItem: {
      book: {
        id: 0,
        name: "",
      },
      id: 0,
      rentaldate: "",
      returndate: "",
      previsiondate: "",
      status: "",
      user: {
        id: 0,
        name: "",
      },
    },
    defaultItem: {
      book: {
        id: 0,
        name: "",
      },
      id: 0,
      rentaldate: "",
      returndate: "",
      previsiondate: "",
      status: "",
      user: {
        id: 0,
        name: "",
      },
    },
    createRental: {
      bookId: 0,
      previsiondate: "",
      userId: 0,
    },
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Novo Aluguel" : "Editar Aluguel";
    },
    filteredRentals() {
      if (this.showReturned) {
        return this.rents.filter((rental) => rental.returndate);
      } else {
        return this.rents.filter((rental) => !rental.returndate);
      }
    },
    formattedPrevisionDate() {
      return this.formatDate(this.editedItem.previsiondate);
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
    this.resetValidation();
  },

  filters: {
    formatDate: function (value) {
      if (value) {
        const todaydate = new Date(value);
        todaydate.setDate(todaydate.getDate() + 1);
        const day = String(todaydate.getDate()).padStart(2, "0");
        const month = String(todaydate.getMonth() + 1).padStart(2, "0");
        const year = todaydate.getFullYear();
        return `${day}/${month}/${year}`;
      }
      return "";
    },
  },
  methods: {
    toggleReturned(showReturned) {
      this.showReturned = showReturned;
    },

    getColor(item) {
      if (item.status == "Pendente") {
        return "pendent";
      }
      if (item.status == "Entregue com Atraso") {
        return "late";
      }
      if (item.status == "Entregue no Prazo") {
        return "onTime";
      }
    },

    getRents() {
  this.loading = true;
  Rental.findAllOutstandingRentals()
    .then((result) => {
      const translatedRents = result.data.map(item => ({
        ...item,
        status: this.getText(item.status),
      }));
      console.log(translatedRents);
      this.rents = translatedRents;
    })
    .finally(() => {
      this.loading = false;
    });
},

getText(status) {
  const statusMap = {
    PENDENT: "Pendente",
    LATE_TIME: "Entregue com Atraso",
    ON_TIME: "Entregue no Prazo",
  };

  return statusMap[status] || status;
},

    getAvailableBooks() {
      Rental.findAllBooksAvailable().then((result) => {
        console.log(result.data);
        this.availableBooks = result.data;
      });
    },

    getUsers() {
      Rental.findAllUsers().then((result) => {
        console.log(result.data);
        this.users = result.data;
      });
    },

    save() {
      if (this.$refs.form.validate() == true) {
        this.createRental.bookId = this.editedItem.book.id;
        this.createRental.userId = this.editedItem.user.id;
        this.createRental.previsiondate = this.editedItem.previsiondate;
        Rental.createNewRental(this.createRental)
          .then(() => {
            this.AlertAdd();
            this.close();
            this.getRents();
            this.resetValidation();
            this.editedItem.user.id = null;
            this.editedItem.book.id = null;
          })
          .catch((error) => {
            this.AlertError(error.response.data.errors[0]);
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
      if (item.previsiondate != null) {
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
            this.deleteItem(item);
          }
        });
      }
    },

    async deleteItem(item) {
      console.log(item);
      await Rental.deleteRent(item.id)
        .then(() => {
          this.getRents();
          this.AlertDelete();
        })
        .catch((error) => {
          this.AlertError(error.response.data.detail);
        });
    },

    async ConfirmDelivery(item) {
      console.log(item);
      if (item.returndate == null) {
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
            console.log(item);
            Toast.fire({
              icon: "success",
              title: "Entregue!!",
              text: "Baixa feita com sucesso",
            });
            this.Delivery(item.id);
            console.log(item);
          }
        });
      } else {
        Swal.fire("Livro já foi entregue", "Esse aluguel já foi dado baixa", "error");
      }
    },

    Delivery(rentalid) {
      Rental.finalizeRental(rentalid).then(() => {
        console.log(rentalid);
        this.getRents();
      });

      console.log(rentalid);
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

    AlertDelete() {
      Toast.fire({
        icon: "success",
        title: "Deletado!",
        text: "Aluguel foi deletado com sucesso!",
      });
    },

    close() {
      this.dialog = false;
      this.resetValidation();
      this.$nextTick(() => {
        this.editedItem = this.defaultItem;
        this.editedItem.book.id = 0;
        this.editedItem.user.id = 0;
        this.editedItem.previsiondate = "";
        this.editedIndex = -1;
      });
    },
    resetValidation() {
      this.$refs.form.resetValidation();
    },
    filterDate(dateString, search) {
      if (!dateString) {
        return false;
      }

      const date = new Date(dateString);
      date.setDate(date.getDate() + 1);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = String(date.getFullYear());

      const filteredDate = `${day}/${month}/${year}`;
      return filteredDate.includes(search);
    },
    formatDate: function (value) {
      if (value) {
        const date = new Date(value);
        date.setDate(date.getDate() + 1);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
      return "";
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
  padding: 6px 10px;
  border-radius: 20px;
  font-size: 12px;
  background-color: #fff;
}

.pendent {
  background: #ffca28;
}

.late {
  background: #e62c1f;
}

.onTime {
  background: #4caf50;
}

.separator {
  margin-left: 5%;
  margin-right: 5%;
}

#toggle-btn.active {
  color: #1e88e5;
}
</style>
