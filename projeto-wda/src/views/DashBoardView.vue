<template>
  <v-app id="background">
    <v-card class="pa-6 ma-5 elevation-3">
      <v-toolbar flat>
        <v-toolbar-title class="text-h4">Dashboard</v-toolbar-title>
      </v-toolbar>

      <v-layout justify-center>
        <v-flex>
          <v-card class="pa-0 elevation-3">
            <v-container fluid grid-list-md>
              <v-toolbar flat>
                <v-toolbar-title class="mt-3 ma-0 title-cards">LIVROS MAIS ALUGADOS</v-toolbar-title>
              </v-toolbar>
            </v-container>

            <div class="card-container">
              <v-card outlined tile v-for="card in cards" :key="card.title" class="card mt-0 elevation-2">
                <div class="cardnumber">{{ card.title }}</div>
                <v-row>
                  <v-card-text class="body-3 title-books"> {{ card.text }}</v-card-text>
                </v-row>
              </v-card>
            </div>
          </v-card>
        </v-flex>
      </v-layout>
      <v-flex>
        <v-row class="mt-3">
          <v-col cols="12" sm="6">
            <v-card class="pa-3 elevation-3 card-chart">
              <v-toolbar-title class="title-cards mt-0 mb-0 ">GRÁFICO DE ALUGUÉIS</v-toolbar-title>

              <div>
                <Doughnut v-if="loaded" ref="chart" :data="chartData" :options="chartOptions" />
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6">
            <v-card class="pa-0 elevation-3">
              <v-toolbar flat>
                <v-toolbar-title class="ma-0 title-cards">CADASTROS ATUAIS</v-toolbar-title>
              </v-toolbar>

              <div class="card-cols">
                <v-card outlined tile class="card-registrations mt-0 elevation-2 mb-4">
                  <v-list-item>
                    <v-list-item-content>
                      <div class="subtitle-2 mb-2">EDITORAS</div>
                      <v-list-item-title class="text-h5 mb-1">
                        {{ listAllPublishers }}
                      </v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-avatar class="ma-0">
                      <v-icon> mdi mdi-bookshelf </v-icon>
                    </v-list-item-avatar>
                  </v-list-item>
                </v-card>
                <v-card outlined tile class="card-registrations mt-0 elevation-2 mb-4">
                  <v-list-item>
                    <v-list-item-content>
                      <div class="subtitle-2 mb-2">LIVROS</div>
                      <v-list-item-title class="text-h5 mb-1">
                        {{ listAllBooks }}
                      </v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-avatar class="ma-0">
                      <v-icon> mdi mdi-notebook-outline </v-icon>
                    </v-list-item-avatar>
                  </v-list-item>
                </v-card>
                <v-card outlined tile class="card-registrations mt-0 elevation-2 mb-4">
                  <v-list-item>
                    <v-list-item-content>
                      <div class="subtitle-2 mb-2">USUÁRIOS</div>
                      <v-list-item-title class="text-h5 mb-1">
                        {{ listAllUsers }}
                      </v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-avatar class="ma-0">
                      <v-icon> mdi mdi-account-circle </v-icon>
                    </v-list-item-avatar>
                  </v-list-item>
                </v-card>
              </div>
            </v-card>

            <v-card class="mt-3 pa-0 pt-7 pb-3 elevation-3 ">
              <v-container fluid grid-list-md class="pa-0 pl-2">
                <v-toolbar-title class="title-cards">META DE ALUGUÉIS</v-toolbar-title>
              </v-container>
              <div class="pl-4 pr-4">
                <RentalsProgressBar :total-rentals="totalRentals" />
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-flex>
    </v-card>
  </v-app>
</template>

<script>
import "@mdi/font/css/materialdesignicons.min.css";
import Dashboard from "../services/dashboardService";
import RentalsProgressBar from "../components/ProgressBar.vue";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "vue-chartjs";

ChartJS.register(ArcElement, Tooltip, Legend);

export default {
  components: { RentalsProgressBar, Doughnut },
  data: () => ({
    loaded: false,

    totalRentals: 72,

    chartData: {
      labels: ["Devolvidos no prazo", "Pendente", "Devolvidos com Atraso"],
      datasets: [
        {
          backgroundColor: ["#689F38", "#FFA000", "#E64A19"],
          data: [0, 0, 0],
        },
      ],
    },
    chartOptions: {
      responsive: true,
      maintainAspectRatio: false,
    },

    listMostRented: [],
    listAllPublishers: 0,
    listAllBooks: 0,
    listAllUsers: 0,
    LateRentals: [],
    OnTimeRentals: [],
    OutsandingRental: [],

    cards: [
      { title: "1", flex: 3, text: "" },
      { title: "2", flex: 3, text: "" },
      { title: "3", flex: 3, text: "" },
      { title: "4", flex: 3, text: "" },
    ],
  }),

  mounted() {
    console.log(this.chartData);
    this.getlistMostRented();
    this.loaded = false;
    this.chartFunction();
    this.totalRentalsFunction();
    this.getlistPublisherRegistrations();
    this.getlistBookRegistrations();
    this.getlistUserRegistrations();
  },

  methods: {
    totalRentalsFunction() {
      Dashboard.findAllRentals().then((result) => {
        this.totalRentals = result.data.length;
      });
    },

    chartFunction() {
      Dashboard.findLateRentals().then((result) => {
        this.LateRentals = result.data.length;
        this.chartData.datasets[0].data[2] = this.LateRentals;
      });
      Dashboard.findOnTimeRentals().then((result) => {
        this.OnTimeRentals = result.data.length;
        this.chartData.datasets[0].data[0] = this.OnTimeRentals;
      });
      Dashboard.findOutsandingRentals().then((result) => {
        this.OutsandingRental = result.data.length;
        console.log(this.OutsandingRental);
        this.chartData.datasets[0].data[1] = this.OutsandingRental;
        this.loaded = true;
      });
    },

    async getlistMostRented() {
      Dashboard.findMostRentedBooks().then((result) => {
        this.listMostRented = result.data;
        this.cards.forEach((card, index) => {
          card.text = this.listMostRented[index].name;
        });
      });
    },

    async getlistPublisherRegistrations() {
      Dashboard.findAllPublishers().then((result) => {
        this.listAllPublishers = result.data.length;
      });
    },

    async getlistBookRegistrations() {
      Dashboard.findAllBooks().then((result) => {
        this.listAllBooks = result.data.length;
      });
    },

    async getlistUserRegistrations() {
      Dashboard.findAllUsers().then((result) => {
        this.listAllUsers = result.data.length;
      });
    },
  },
};
</script>

<style scoped>
#background {
  background: #fafafa;
}

.cardnumber {
  font-size: 32px;
}

.card-container {
  display: flex;
}
.card-cols{
  display: flex;
}

.card {
  padding: 10px;
  display: flex;
  align-items: center;
  margin: 15px;
  width: 100%;
  max-width: 100%;
  background: white;
  color: black;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
}

.card-registrations {
  width: 100%;
  max-width: 100%;
  display: flex;
  align-items: center;
  margin: 10px;
  background: white;
  color: black;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
}

.title-cards {
  font-weight: bold;
  font-size: 18px;
  margin: 0 0 0 10px;
}
.text-books {
  font-size: 15px;
  margin: 0 0 0 10px;
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
@media (max-width: 750px) {
  .card-container {
    flex-direction: column;
    margin: 15px;
  }

  .card {
    margin: 5px 0;
  }
  
}
@media (max-width: 1040px){
  .card-chart{
    height: 100%;
    max-height: 100%;
  }
  .card-cols{
    flex-direction: column;
    margin: 15px;
  }
  .card-registrations {
    margin: 5px 0;
  }
}
</style>
