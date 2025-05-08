<script>
import SensorCard from '@/components/dashboard/SensorCard.vue';
import api from '@/utils/api'; // Assicurati di importare l'istanza di axios

export default {
  components: {
    SensorCard
  },
  data() {
    return {
      serverResponseCentral: '',
      serverResponseSingles: [],
      actuators: [],
      currentMode: 'individual', // NEW: active configuration display
      sensorsID: [],
      sensors: [],
      updateInterval: null
    };
  },
  async mounted() {
    await this.getSensorIDs();
    await this.fetchSensorData();

    // 🔄 Avvia aggiornamento ogni 10 secondi
    this.updateInterval = setInterval(this.fetchSensorData, 10000);
  },
  beforeUnmount() {
    // 🧹 Pulisce l'intervallo se il componente viene distrutto
    clearInterval(this.updateInterval);
  },
  methods: {
    async fetchSensorData() {
      const sensorPromises = this.sensorsID.map(async sensor => {
        try {
          const data = await this.getSensorReading(sensor.id);
          return {
            ...data,
            location: sensor.location,
          };
        } catch (err) {
          return {
            id: sensor.id,
            location: sensor.location,
            disconnected: true
          };
        }
      });
    this.sensors = await Promise.all(sensorPromises);
    },
    // Usa l'API per ottenere gli attuatori
    async getActuators() {
      try {
        const response = await api.get('/listActuators');
        this.actuators = response.data;
      } catch (error) {
        console.error('Error fetching actuators');
      }
    },
    async getSensorIDs() {
      try {
        const response = await api.get('/getSensorsId');
        this.sensorsID = response.data;
      } catch (error){
        console.error('Error fetching sensors ID');
      }
    },
    async getSensorReading(sensorId) {
      try {
        const response = await api.get(`/temperatures/${sensorId}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching readings from ${sensorId}`);
      }
    },

    // Usa l'API per aggiornare uno specifico attuatore
    async setSingleActuator(id, stateDesired) {
      try {
        const response = await api.post('/updateActuator', {
          id,
          stateDesired
        });

        this.serverResponseSingles[id] = response.data.receivedData.stateDesired ? 'Turned ON' : 'Turned OFF';
        this.currentMode = 'individual';
      } catch (error) {
        console.error('Error sending data:', error);
      }
    },

    // Usa l'API per aggiornare tutti gli attuatori
    async setAllActuators(stateDesired) {
      for (const actuator of this.actuators) {
        await this.setSingleActuator(actuator.id, stateDesired);
      }
      this.currentMode = 'global';
    },

    logout() {
      localStorage.removeItem('admin_token');  // Rimuovi il token
      this.$router.push({ name: 'login' });     // Usa Vue Router per reindirizzare al login
    }
  }
};
</script>


<template>
  <div class="flex flex-col">
    <div class="card">
      <div class="text-2xl font-semibold text-slate-800 mb-10">Sensors Data</div>
      <div class="grid grid-cols-12 gap-8 mt-6">
        <SensorCard v-for="sensor in sensors" :key="sensor.name" :name="sensor.name" :temperature="sensor.temperature"
          :humidity="sensor.humidity" :location="sensor.location" :disconnected="sensor.disconnected"/>
      </div>
    </div>
  </div>
</template>
