<script>
import SensorCard from '@/components/dashboard/SensorCard.vue';

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
        this.serverResponseSingles[id] = data.receivedData.stateDesired ? 'Turned ON' : 'Turned OFF';
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
