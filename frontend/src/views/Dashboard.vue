<script>
import SensorCard from '@/components/dashboard/SensorCard.vue';

import api from '@/utils/api';


export default {
  components: {
    SensorCard,
  },
  data() {
    return {
      actuators: [],
      sensorsID: [],
      sensors: [],
      localsData: [],
      isLoading: true,
      sensorReg: null,
      actReg: null,
      updateInterval: null,
      avg_temp: null,
      lastAutoEvent: null,
      togglingActuators: new Set(),
      pendingActuatorStates: {},
      temperatureisLoading: true,
    };
  },
  async mounted() {
    await this.getSensorIDs();
    await this.getActuators();
    this.isLoading = false
    await this.fetchSensorData();
    this.pairSensorAct();
    await this.getLastAutoEvent();

    // Avvia aggiornamento ogni 2 secondi
    this.updateInterval = setInterval(async () => {
      await this.getActuators();
      await this.fetchSensorData();
      this.pairSensorAct();
      await this.getAverageTemp();
      this.temperatureisLoading = false;
      await this.getLastAutoEvent();
    }, 2000);
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
    pairSensorAct() {
      this.localsData = this.sensors.map(sensor => {
        const actuator = this.actuators.find(act => act.location === sensor.location);
        return {
          sensorName: sensor.name || sensor.id,
          temperature: sensor.temperature,
          humidity: sensor.humidity,
          actuatorStatus: actuator?.status ?? null,
          actuatorDisconnected: actuator?.connectionStatus === 'disconnected',
          actuatorName: actuator?.name || actuator?.id,
          location: sensor.location,
          sensorDisconnected: sensor.disconnected || false,
        };
      });
    },
    async toggleActuator(item) {
      const name = item.actuatorName;
      const desiredState = !item.actuatorStatus;
      this.togglingActuators.add(name);
      this.pendingActuatorStates[name] = desiredState;

      try {
        await this.setSingleActuator(name, desiredState);

        // Wait up to 30s for the polling to reflect the new state
        const maxWait = 10000; // 30 seconds
        const interval = 300;
        let waited = 0;

        while (waited < maxWait) {
          const currentItem = this.localsData.find(x => x.actuatorName === name);
          if (currentItem?.actuatorStatus === desiredState) break;
          await new Promise(resolve => setTimeout(resolve, interval));
          waited += interval;
        }

      } catch (err) {
        console.error("Errore nel cambio stato:", err);
      } finally {
        this.togglingActuators.delete(name);
        delete this.pendingActuatorStates[name];
      }
    },

    // Usa l'API per ottenere gli attuatori
    async getActuators() {
      try {
        const response = await api.get('/listActuators');
        this.actuators = response.data;
        this.actReg = true;
      } catch (error) {
        console.error('Error fetching actuators');
        this.actReg = false;
      }
    },
    async getSensorIDs() {
      try {
        const response = await api.get('/getSensorsId');
        this.sensorsID = response.data;
        this.sensorReg = true;
      } catch (error) {
        console.error('Error fetching sensors ID');
        this.sensorReg = false;
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
    async getAverageTemp() {
      try {
        const response = await api.get(`/getAvgTemp`);
        this.avg_temp = response.data.avg_temp;
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
      } catch (error) {
        console.error('Error sending data:', error);
      }
    },

    async setAllActuators(stateDesired) {
      const names = this.localsData.map(data => data.actuatorName);

      // Set loading state for each actuator
      names.forEach(name => {
        this.togglingActuators.add(name);
        this.pendingActuatorStates[name] = stateDesired;
      });

      try {
        // Send all requests in parallel
        await Promise.all(
          names.map(name => this.setSingleActuator(name, stateDesired))
        );

        // Wait briefly to give backend time to update
        const maxWait = 3000;
        const interval = 300;
        let waited = 0;

        while (waited < maxWait) {
          await this.getActuators(); // Refresh actuator data
          this.pairSensorAct();

          const pending = names.filter(name => {
            const item = this.localsData.find(d => d.actuatorName === name);
            return item?.actuatorStatus !== stateDesired;
          });

          if (pending.length === 0) break;

          await new Promise(resolve => setTimeout(resolve, interval));
          waited += interval;
        }

      } catch (error) {
        console.error("Errore nel settaggio collettivo:", error);
      } finally {
        // Clear toggling indicators
        names.forEach(name => {
          this.togglingActuators.delete(name);
          delete this.pendingActuatorStates[name];
        });
      }
    },

    async getLastAutoEvent() {
      try {
        const response = await api.get('/lastAutoEvent');
        this.lastAutoEvent = response.data;
      } catch (error) {
        if (error.response?.status !== 204) {
          console.error('Errore caricamento ultimo evento automatico:', error.message);
        }
      }
    },
    formatDate(isoString) {
      const date = new Date(isoString);
      return date.toLocaleString();
    },

    logout() {
      localStorage.removeItem('admin_token');  // Rimuovi il token
      this.$router.push({ name: 'login' });     // Usa Vue Router per reindirizzare al login
    }
  }
};
</script>


<template>
  <div class="card space-y-6">
    <div class="flex justify-between items-center w-full">
      <h1 class="text-2xl font-semibold text-slate-800">Locals Data</h1>
      <div class="flex space-x-4"> <!-- Added space between the buttons -->
        <button @click="setAllActuators(true)"
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow transition">
          Attiva Tutti
        </button>
        <button @click="setAllActuators(false)"
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow transition">
          Disattiva tutti
        </button>
      </div>
    </div>

    <hr class="border-t border-slate-300 my-6" />

    <div v-if="isLoading" class="space-y-3">
      <Skeleton width="50%" height="20px" />
    </div>

    <div v-else-if="sensorReg === true && localsData.length > 0">
      <div v-if="temperatureisLoading"
        class="bg-slate-50 my-5 rounded-lg p-4 text-left text-slate-800 text-xl font-medium">
        Temperatura media globale: <span class="text-2xl text-red-400 font-semibold ml-2 mr-3"> <i
            class="pi pi-spin pi-spinner text-xl"></i>
        </span>
      </div>
      <div v-else-if="avg_temp === null"
        class="bg-slate-50 my-5 rounded-lg p-4 text-left text-slate-800 text-xl font-medium">
        Temperatura media globale: <span class="text-xl text-slate-500 font-semibold ml-2 mr-3">Non disponibile</span>
      </div>
      <div v-else class="bg-slate-50 my-5 rounded-lg p-4 text-left text-slate-800 text-xl font-medium">
        Temperatura media globale: <span class="text-2xl text-red-500 font-semibold ml-2 mr-3">{{ avg_temp }}°C</span>
      </div>
      <div v-if="lastAutoEvent" class="mb-4 p-4 rounded-lg bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800">
        <p><strong>⚠ Ultimo evento automatico:</strong> {{ lastAutoEvent.event }}</p>
        <p class="text-sm text-slate-600">Orario: {{ formatDate(lastAutoEvent.timestamp) }}</p>
      </div>
      <div v-if="automatic_activation === true" class="text-green-500 font-medium">
        🔄 Last actuator change was automatic
      </div>
      <div class="grid grid-cols-12 gap-6">
        <div v-for="(item, index) in localsData" :key="index" class="col-span-12 md:col-span-6">
          <div
            class="bg-slate-50 border rounded-xl p-6 shadow-md h-full hover:scale-[1.01] transition-all duration-200 col-span-12 md:col-span-6 space-y-4">

            <!-- Room Name Centered -->
            <h2 class="text-2xl font-bold text-center text-slate-800">{{ item.location }}</h2>

            <!-- Sensor and Actuator Cards Side by Side -->
            <div class="flex flex-col md:flex-row mt-4 items-center">

              <!-- SensorCard -->
              <SensorCard :name="item.sensorName" :temperature="item.temperature" :humidity="item.humidity"
                :location="item.location" :disconnected="item.sensorDisconnected" />

              <!-- Vertical separator -->
              <div class="w-px h-16 bg-gray-200 mx-2"></div>

              <!-- Actuator Card -->
              <div class="flex-1">
                <div v-if="item.actuatorStatus !== null && !item.actuatorDisconnected">
                  <div class="rounded-xl p-4 text-center h-full transition-all"
                    :class="item.actuatorStatus ? 'border-2 border-red-500' : 'border-2 border-slate-50'">
                    <!-- Actuator Name -->
                    <h2 class="text-xl font-semibold text-slate-800 mb-4">Stato pompa di calore</h2>

                    <!-- Status Text -->
                    <div class="mb-4">
                      <i class="pi pi-bolt text-2xl text-slate-800"></i>
                      <span :class="['text-xl font-bold ml-2', item.actuatorStatus ? 'text-red-600' : 'text-gray-400']">
                        {{ item.actuatorStatus ? 'ON' : 'OFF' }}
                      </span>
                    </div>

                    <!-- Circular Switch -->
                    <!-- Circular Switch -->
                    <div class="flex items-center justify-center gap-4">
                      <button @click="toggleActuator(item)" :disabled="togglingActuators.has(item.actuatorName)"
                        class="relative w-16 h-10 flex items-center justify-center rounded-full border transition-colors"
                        :class="item.actuatorStatus
                          ? 'bg-red-500 text-white border-red-600'
                          : 'bg-gray-100 text-slate-700 border-gray-300'">
                        <i v-if="!togglingActuators.has(item.actuatorName)" class="pi pi-power-off text-xl"></i>
                        <i v-else class="pi pi-spin pi-spinner text-xl text-slate-500"></i>
                      </button>
                    </div>


                  </div>
                </div>
                <div v-else-if="item.actuatorDisconnected" class="flex items-center justify-center h-full">
                  <span class="text-red-500 text-center text-lg">Attuatore disconnesso</span>
                </div>
                <div v-else class="flex items-center justify-center h-full">
                  <span class="text-gray-500 text-center text-lg">Nessun attuatore associato</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
    <div v-else-if="sensorReg === false" class="text-gray-500">Nessun sensore registrato</div>
  </div>
</template>
