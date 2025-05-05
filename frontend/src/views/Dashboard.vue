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
      sensors: [
        { name: 'Salotto', temperature: 22, humidity: 55 },
        { name: 'Camera', temperature: 20, humidity: 50 },
        { name: 'Cucina', temperature: 24, humidity: 60 },
        { name: 'Bagno', temperature: 27, humidity: 80 },
        { name: 'Stanzino', temperature: 16, humidity: 82 },
        { name: 'Seminterrato', temperature: 10, humidity: 69 }
      ]
    };
  },
  async mounted() {
    this.getActuators();
  },
  methods: {
    // Usa l'API per ottenere gli attuatori
    async getActuators() {
      try {
        const response = await api.get('/listActuators');
        this.actuators = response.data;
      } catch (error) {
        console.error('Error fetching data:', error);
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
      <div class="font-semibold text-xl">Sensors Data</div>
      <div class="grid grid-cols-12 gap-8 mt-6">
        <SensorCard v-for="sensor in sensors" :key="sensor.name" :name="sensor.name" :temperature="sensor.temperature"
          :humidity="sensor.humidity" />
      </div>
    </div>
  </div>
</template>
