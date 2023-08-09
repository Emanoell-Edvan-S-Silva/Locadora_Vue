<template>
  <v-app id="background">
    <template>
      <v-data-table :headers="headers" :items="rents" :search="search" sort-by="id" class="pa-3 ma-5 elevation-3">
        <template v-slot:top>
          <v-toolbar flat>
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
                    <v-row>
                      <v-col cols="12">
                        <v-select :items="users" item-text="nome" item-value="id" v-model="editedItem.usuario_id.id" label="Usuário"></v-select>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12">
                        <v-select :items="availableBooks" item-text="nome" item-value="id" v-model="editedItem.livro_id.id" label="livros"></v-select>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12" sm="6">
                        <v-text-field v-model="editedItem.data_aluguel" label="Data de Aluguel" readonly></v-text-field>
                      </v-col>
                      <v-col>
                        <v-dialog ref="dialog" v-model="modal" :return-value.sync="editedItem.data_previsao" persistent width="290px">
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field v-model="editedItem.data_previsao" label="Data de previsão" readonly v-bind="attrs" v-on="on"></v-text-field>
                          </template>
                          <v-date-picker v-model="editedItem.data_previsao" scrollable :min="minDate" :max="maxDate">
                            <v-spacer></v-spacer>
                            <v-btn text color="primary" @click="modal = false"> Cancel </v-btn>
                            <v-btn text color="primary" @click="$refs.dialog.save(editedItem.data_previsao, editedItem.data_devolucao)"> OK </v-btn>
                          </v-date-picker>
                        </v-dialog>
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
          <v-icon class="green--text mr-2" @click="ConfirmDelivery(item)">mdi-book-check</v-icon>
          <v-icon class="red--text" @click="ConfirmDeletar(item)">mdi-delete</v-icon>
        </template>
        <template slot="item.status" slot-scope="{ item }">
          <span class="pa-1 pl-3 pr-3" :style="getStatusStyle(item.data_previsao, item.data_devolucao)">{{ getStatusLabel(item.data_previsao, item.data_devolucao) }}</span>
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
import Rent from "../services/rent_service";

export default {
  name: "RentView",

  data: () => ({

    minDate: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().substr(0, 10),
    maxDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substr(0, 10),
    search: "",
    dialog: false,
    modal: false,
    headers: [
      { text: "ID", value: "id", align: "start" },
      { text: "Nome Usuario", value: "usuario_id.nome" },
      { text: "Nome Livro", value: "livro_id.nome" },
      { text: "Data de Aluguel", value: "data_aluguel" },
      { text: "Data de Previsão", value: "data_previsao" },
      { text: "Entrega", value: "data_devolucao" },
      { text: "Status", value: "status" },
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
        id: 0,
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
        id: 0,
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
        nome: "string",
        editora: {
          id: null,
          nome: "string",
          cidade: "string",
        },
        autor: "string",
        lancamento: 0,
        quantidade: 0,
        totalalugado: 0,
      },
      usuario_id: {
        id: null,
        nome: "string",
        endereco: "string",
        cidade: "string",
        email: "",
      },
    },

    rules: [(value) => !!value || "Required.", (value) => (value && value.length >= 3) || "Minimo 3 caracteres"],
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Novo Item" : "Edit Item";
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
      const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().substr(0, 10);
      if (data_devolucao != null) {
        if (dataPrevisao > today) {
          return "No prazo";
        } else {
          return "Atrasado";
        }
      } else {
        return "Pendente";
      }
    },
    getStatusStyle(dataPrevisao, data_devolucao) {
      const style = {};
      const today = new Date().toISOString().substr(0, 10);
      if (data_devolucao != null) {
        if (dataPrevisao <= today) {
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
          this.AlertError(error.detail);
        });
    },
    save() {
      if (this.editedIndex > 0) {
        Object.assign(this.books[this.editedIndex], this.editedItem);
        console.log(this.formTitle);
      } else {
        if (this.editedItem.id != 0) {
          console.log("deu ruim");
        } else {
          if (this.editedIndex < -20) {
            Swal.fire("", "Insira uma quantidades caracteres validos", "error");
          } else {
            Rent.postAddRent(this.editedItem)
              .then(() => {
                this.AlertAdd();
                this.close();
                this.getRents();
              })
              .catch((error) => {
                this.AlertError(error.detail);
              });
          }
        }
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
            Swal.fire("Deleted!", "Aluguel deletado com sucesso", "success", this.deleteItem(item));
          }
        });
      } else {
        Swal.fire("Não foi possivel", "Não pode apagar registro que ja foi entregue", "error");
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
            Swal.fire("Entregue!", "Baixa feita com sucesso", "success", this.Delivery(item), console.log(item));
          }
        });
      } else {
        Swal.fire("Livro já foi entregue", "Esse aluguel já foi dado baixa", "error");
      }
    },

    AlertAdd() {
      Swal.fire("Sucesso", "O Aluguel foi adicionado com sucesso", "success");
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
