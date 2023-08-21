<template>
  <v-app id="background">
    <v-card class="pa-3 ma-5 elevation-3">
      <v-toolbar flat>
        <v-toolbar-title class="text-h4">Dashboard</v-toolbar-title>
      </v-toolbar>

      <v-layout justify-center>
        <v-flex>
          <v-card class="pa-0 elevation-3">
            <v-container fluid grid-list-md>
              <v-toolbar flat>
                <v-toolbar-title class="text-h6 mt-3 mb-0 title-books">LIVROS MAIS ALUGADOS</v-toolbar-title>
              </v-toolbar>
            </v-container>

            <v-container>
              <div class="card-container">
                <v-card outlined tile v-for="card in cards" :key="card.title" class="card mt-0 elevation-2">
                  <v-container fluid pa-2>
                    <v-row>
                      <v-col cols="12">
                        <div class="display-1">{{ card.title }}</div>
                        <v-row>
                          <v-card-text class="body-3"> {{ card.text }}</v-card-text>
                        </v-row>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card>
              </div>
            </v-container>
          </v-card>
        </v-flex>
      </v-layout>
      <v-flex>
        <v-row class="mt-3">
          <v-col>
            <v-card class="pa-3 elevation-3">
              <v-toolbar-title class="subtitle-1 mt-0 mb-0">GRÁFICO DE SETORES</v-toolbar-title>

              <div>
                <Doughnut v-if="loaded" ref="chart" :data="chartData" :options="chartOptions" />
              </div>
            </v-card>
          </v-col>

          <v-col>
            <v-row>
              <v-col>
                <v-card class="pa-2 elevation-3">
                  <v-toolbar-title class="subtitle-1 mt-0 mb-0">META DE ALUGUÉIS</v-toolbar-title>
                  <div>
                    <RentalsProgressBar :total-rentals="totalRentals" />
                  </div>
                </v-card>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-card class="pa-2 elevation-3">
                  <v-toolbar-title class="subtitle-1 mt-0 mb-0">PORCENTAGENS DE LIVROS ATRASADOS</v-toolbar-title>
                  <div style="align-items: center">
                    <LateRentProgressBar :total-rentals="totalRentals" :late-aluguel="lateRent" />
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <v-data-table :headers="headers" :items="lastRentals" sort-by="id" class="pa-3 elevation-3" :items-per-page="5">
              <template v-slot:top>
                <v-toolbar flat>
                  <v-toolbar-title class="subtitle-1">TABELA DE ULTIMOS ALUGUÉIS</v-toolbar-title>
                </v-toolbar>
              </template>
              <template slot="item.status">
                <v-chip style="background-color: transparent">
                  <span class="pa-1 pl-3 pr-3" style="background: #f8c43e; border-radius: 50px">Pendente</span>
                </v-chip>
              </template>

              <template slot="item.acoes" slot-scope="{ item }">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon class="green--text mr-2 custom-icon" @click="ConfirmDelivery(item)" v-bind="attrs" v-on="on">mdi-book-check</v-icon>
                  </template>
                  <span>Devolver</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon class="red--text mr-2 custom-icon" @click="ConfirmDeletar(item)" v-bind="attrs" v-on="on">mdi-delete</v-icon>
                  </template>
                  <span>Excluir</span>
                </v-tooltip>
              </template>
              <template v-slot:no-data>
                <div class="text-center">Não possui aluguel Pendente</div>
              </template>
              <template slot="item.data_aluguel" slot-scope="{ item }">
                {{ item.data_aluguel | formatDate }}
              </template>
              <template slot="item.data_previsao" slot-scope="{ item }">
                {{ item.data_previsao | formatDate }}
              </template>
            </v-data-table>
          </v-col>
        </v-row>
      </v-flex>
    </v-card>
  </v-app>
</template>

<script>
import "@mdi/font/css/materialdesignicons.min.css";
import Swal from "sweetalert2";
import Dashboard from "../services/dashboard_service";
import RentalsProgressBar from "../components/ProgressBar.vue";
import LateRentProgressBar from "../components/ProgressBarLateRent.vue";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "vue-chartjs";

ChartJS.register(ArcElement, Tooltip, Legend);

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
  components: { LateRentProgressBar, RentalsProgressBar, Doughnut },
  data: () => ({
    loaded: false,
    lateRent: 0,
    outstandingRent: 0,
    RentOnTime: 0,
    totalRentals: 72,
    chartData: {
      labels: ["Devolvidos no prazo", "Pendente", "Devolvidos com Atraso"],
      datasets: [
        {
          backgroundColor: ["#689F38", "#FFA000", "#E64A19"],
          data: [],
        },
      ],
    },
    chartOptions: {
      responsive: true,
      maintainAspectRatio: false,
    },
    headers: [
      { text: "Nome Usuario", value: "usuario_id.nome" },
      { text: "Nome Livro", value: "livro_id.nome" },
      { text: "Data de Aluguel", value: "data_aluguel" },
      { text: "Data de Previsão", value: "data_previsao" },
      { text: "Status", value: "status", sortable: false, align: "center" },
      { text: "Ações", value: "acoes", sortable: false },
    ],

    listMostRented: [],
    lastRentals: [],
    Rent: [],

    cards: [
      {
        title: "1",
        flex: 1,
        text: "",
      },
      {
        title: "2",
        flex: 1,
        text: "",
      },
      {
        title: "3",
        flex: 1,
        text: "",
      },
      {
        title: "4",
        flex: 1,
        text: "",
      },
    ],

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
  }),

  mounted() {
    this.getlistMostRented();
    this.getlastRentals();
    this.loaded = false;
  },
  filters: {
    formatDate: function (value) {
      if (value) {
        const date = new Date(value);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
      return "";
    },
  },
  methods: {
    getStatusStyle() {
      const style = {
        background: "white",
        color: "black",
      };

      return style;
    },

    async getlistMostRented() {
      Dashboard.getlistMostRented().then((result) => {
        this.listMostRented = result.data;
        this.cards.forEach((card, index) => {
          card.text = this.listMostRented[index].nome;
        });
      });
    },
    getlastRentals() {
      Dashboard.getListRents().then((resultado) => {
        this.lastRentals = resultado.data.filter((item) => item.data_devolucao === null);
      });
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

            Toast.fire({
              icon: "success",
              title: "Entregue!!",
              text: "Baixa feita com sucesso",
            });
            this.Delivery(item);
          }
        });
      } else {
        Swal.fire("Livro já foi entregue", "Esse aluguel já foi dado baixa", "error");
      }
    },
    Delivery(item) {
      Dashboard.putRentUpdate(item)
        .then(() => {
          this.getlastRentals();
        })
        .catch((error) => {
          this.AlertError(error.detail);
        });
    },
    deleteItem(item) {
      Dashboard.deleteRent(item).then(() => {
        this.getlastRentals();
      });
    },
    AlertError(error) {
      Swal.fire("Ocorreu um erro", error, "error");
    },
    updateChartData() {
      this.$refs.chart.renderChart();
    },
  },
  created() {
    Dashboard.getListRents()
      .then((resultado) => {
        this.Rent = resultado.data;
        let alugueis = resultado.data;
        this.totalRentals = this.Rent.length;
        alugueis.forEach((aluguel) => {
          if (aluguel.data_devolucao != null) {
            if (aluguel.data_devolucao > aluguel.data_previsao) {
              this.lateRent++;
              this.chartData.datasets[0].data[2] = this.lateRent;
            } else {
              this.RentOnTime++;
              this.chartData.datasets[0].data[0] = this.RentOnTime;
            }
          } else {
            this.outstandingRent++;
            this.chartData.datasets[0].data[1] = this.outstandingRent;
          }
        });
        this.loaded = true;
      })
      .catch((error) => {
        console.log(error);
      });
  },
};
</script>

<style>
#background {
  background: #fafafa;
}

.card-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.card {
  flex-grow: 1;
  flex-basis: 0;
  margin: 10px;
  max-width: 100%;
  background-color: white;
  color: black;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
}
.title-books {
  width: 100%;
  text-align: center;
}
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
@media (max-width: 600px) {
  .card-container {
    flex-direction: column;
  }

  .card {
    margin: 5px 0;
  }
}
</style>
