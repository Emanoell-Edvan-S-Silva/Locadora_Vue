<template>
    <div class="rentals-progress">
      <div class="rental-count">
        <span class="late-rent">{{ lateAluguel }}</span>
      <span class="total-rentals">/ {{ totalRentals }}</span>
      
    </div>
      <div class="progress-bar">
        <div class="progress" :style="{ width: percentage + '%' }"></div>
      </div>
      <p>{{ percentage.toFixed(0) }}%</p>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      totalRentals: {
        type: Number,
        required: true,
        default: 0,
      },
      lateAluguel:{
      type: Number,
        required: true,
        default: 0,
      }
    },
    computed: {
      percentage() {
        if (this.lateAluguel === 0) {
          return 0;
        }
        return (this.lateAluguel / this.totalRentals) * 100;
      },
    },
  };
  </script>
  
  <style scoped>
  .rentals-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
  .rental-count {
  display: flex;
  align-items: baseline;
}

.late-rent {
  font-size: 24px;
}

.total-rentals {
  font-size: 16px;
  margin-right: 5px;
 
}
  .progress-bar {
    width: 100%;
    height: 15px;
    background-color: #f0f0f0;
    border-radius: 4px;
    overflow: hidden;
    margin: 8px;
  }
  
  .progress {
    height: 100%;
    background-color: #E53935;
    transition: width 0.3s ease;
  }
  </style>
  