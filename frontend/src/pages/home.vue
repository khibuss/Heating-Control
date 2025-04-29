<script>
import SensorCard from "@/components/SensorCard.vue";

export default {
  components: {
    SensorCard,
  },
  data() {
    return {
      serverResponseCentral: '',
      serverResponseSingles: [],
      actuators: [],
      currentMode: 'individual', // NEW: active configuration display
      sensors: [
        { name: "Salotto", temperature: 22, humidity: 55 },
        { name: "Camera", temperature: 20, humidity: 50 },
        { name: "Cucina", temperature: 24, humidity: 60 },
        { name: "Bagno", temperature: 27, humidity: 80 },
        { name: "Stanzino", temperature: 16, humidity: 82 },
        { name: "Seminterrato", temperature: 10, humidity: 69 },
      ],
    };
  },
  async mounted() {
    this.getActuators();
  },
  methods: {
    async getActuators() {
      try {
        const response = await fetch('http://localhost:8000/listActuators');
        const data = await response.json();
        this.actuators = data;
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },
    async setSingleActuator(id, stateDesired) {
      try {
        const response = await fetch('http://localhost:8000/updateActuator', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id, stateDesired })
        });

        const data = await response.json();
        this.serverResponseSingles[id] = data.receivedData.stateDesired ? "Turned ON" : "Turned OFF";
        this.currentMode = 'individual';
      } catch (error) {
        console.error('Error sending data:', error);
      }
    },
    async setAllActuators(stateDesired) {
      for (const actuator of this.actuators) {
        await this.setSingleActuator(actuator.id, stateDesired);
      }
      this.currentMode = 'global';
    }
  },
};
</script>


<template>
  <div class="dashboard-container">
    <main class="main-content">
      <header class="top-bar">
        <div class="welcome">Bentornato <span class="user">Admin</span></div>
      </header>

      <h1 class="section-title">Heating System Dashboard</h1>

      <!-- Current Configuration Mode -->
      <section class="card section">
        <h2>Active Configuration</h2>
        <p>Current Mode: <strong>{{ currentMode === 'global' ? 'Global Control' : 'Individual Control' }}</strong></p>
      </section>

      <!-- Central Control -->
      <section class="card section">
        <h2>Central Control</h2>
        <div class="button-group">
          <button @click="setAllActuators(true)">Activate All</button>
          <button @click="setAllActuators(false)">Deactivate All</button>
        </div>
      </section>

      <!-- Individual Actuator Control -->
      <section class="card section">
        <h2>Individual Control</h2>
        <div v-for="actuator in actuators" :key="actuator.id" class="actuator-row">
          <div class="actuator-info">
            <span>{{ actuator.id }} (Status: {{ actuator.status ? 'ON' : 'OFF' }})</span>
          </div>
          <div class="button-group">
            <button @click="setSingleActuator(actuator.id, true)">Activate</button>
            <button @click="setSingleActuator(actuator.id, false)">Deactivate</button>
          </div>
          <div class="response-msg">{{ serverResponseSingles[actuator.id] }}</div>
        </div>
      </section>

      <!-- Sensor Cards -->
      <section class="card section">
        <h2>Sensor Dashboard</h2>
        <div class="cards-grid">
          <SensorCard v-for="sensor in sensors" :key="sensor.name" :name="sensor.name" :temperature="sensor.temperature"
            :humidity="sensor.humidity" />
        </div>
      </section>
    </main>
  </div>
</template>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  background-color: #8fbbe6;
}

.dashboard-container {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.main-content {
  width: 100%;
  max-width: 1200px;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.welcome {
  font-size: 20px;
  font-weight: 600;
}

.user {
  color: #0073e6;
}

.section-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 28px;
  color: #333;
}

.section {
  margin-bottom: 30px;
}

.card {
  background: rgb(210, 242, 249);
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.button-group {
  display: flex;
  gap: 12px;
  margin-top: 10px;
  flex-wrap: wrap;
}

button {
  padding: 10px 16px;
  background: darkorange;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease-in-out;
}

button:hover {
  background: #e69500;
}

.actuator-row {
  margin-bottom: 16px;
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.actuator-info {
  font-weight: 500;
  margin-bottom: 6px;
}

.response-msg {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}
</style>
