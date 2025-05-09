<script>
import SensorCard from '@/components/dashboard/SensorCard.vue';

import api from '@/utils/api'; // Assicurati di importare l'istanza di axios


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
      sensorsID: [],
      sensors: [],
      localsData: [],
      isLoading: true,
      sensorReg: null,
      actReg: null,
      updateInterval: null
    };
  },
  async mounted() {
    await this.getSensorIDs();
    await this.getActuators();
    this.isLoading = false
    await this.fetchSensorData();
    this.pairSensorAct();

    // Avvia aggiornamento ogni 10 secondi
    this.updateInterval = setInterval(async () => {
      await this.fetchSensorData();
      this.pairSensorAct();
    }, 10000);
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
          actuatorName: actuator?.name || actuator?.id,
          location: sensor.location,
          sensorDisconnected: sensor.disconnected || false,
        };
      });
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
      <div class="text-2xl font-semibold text-slate-800">Locals Data</div>
      <hr class="border-t border-slate-300 my-6" />

      <div v-if="isLoading" class="space-y-3">
        <Skeleton width="50%" height="20px" />
      </div>

      <div v-else-if="sensorReg === true && localsData.length > 0" class="grid grid-cols-12 gap-6">
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
                <div v-if="item.actuatorStatus !== null">
                  <div class="rounded-xl p-4 text-center h-full transition-all"
                    :class="item.actuatorStatus ? 'border-2 border-red-500' : 'border-2 border-slate-50'">
                    <!-- Actuator Name -->
                    <h2 class="text-xl font-semibold text-slate-800 mb-4">{{ item.actuatorName }}</h2>

                    <!-- Status Text -->
                    <div class="mb-4">
                      <i class="pi pi-bolt text-2xl text-slate-800"></i>
                      <span :class="['text-xl font-bold ml-2', item.actuatorStatus ? 'text-red-600' : 'text-gray-400']">
                        {{ item.actuatorStatus ? 'ON' : 'OFF' }}
                      </span>
                    </div>

                    <!--  Circular Switch -->
                    <div class="flex items-center justify-center gap-4">

                      <label @click="setSingleActuator(item.actuatorName, !item.actuatorStatus)"
                        class="relative w-16 h-10">
                        <input type="checkbox" v-model="item.actuatorStatus" class="sr-only" />
                        <div :class="[
                          'w-full h-full flex items-center justify-center rounded-full border transition-colors',
                          item.actuatorStatus
                            ? 'bg-red-500 text-white border-red-600'
                            : 'bg-gray-100 text-slate-700 border-gray-300'
                        ]">
                          <i class="pi pi-power-off text-xl"></i>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <div v-else>
                  <span class="text-gray-500 ml-6">Nessun attuatore associato</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
      <div v-else-if="sensorReg === false" class="text-gray-500">Nessun sensore registrato</div>
    </div>
  </div>
</template>

<!-- 
<template>
  <div class="flex flex-col">
    <div class="card">
      <div class="text-2xl font-semibold text-slate-800">Sensors Data</div>
      <hr class="border-t border-slate-300 my-6" />

      <div v-if="isLoading" class="space-y-3">
        <Skeleton width="50%" height="20px" />
      </div>

      <div v-else-if="localsData.length > 0" class="grid grid-cols-12 gap-8">
        <div v-for="(item, index) in localsData" :key="index" class="card">
          <SensorCard :name="item.sensorName" :temperature="item.temperature" :humidity="item.humidity"
            :location="item.location" :disconnected="item.sensorDisconnected" />
          <p class="mt-2">
            🔌 Attuatore:
            <strong v-if="item.actuatorStatus !== null">{{ item.actuatorStatus ? 'Attivo' : 'Spento' }}</strong>
            <span v-else class="text-gray-500">Nessun attuatore associato</span>
          </p>
        </div>
      </div>
      <div v-else class="text-gray-500">
        Nessun dato disponibile per sensori o attuatori.
      </div>
      <div v-if="actReg === true" class="grid grid-cols-12 gap-8">
        ciao ci sono
      </div>
    </div>
  </div>
</template> -->

<!-- <div v-for="sensor in sensors" :key="sensor.name" class="card p-4 mb-4 border border-slate-200 rounded-xl">
  <h2 class="text-lg font-semibold">{{ sensor.name }}</h2>
  <p>🌡️ Temperatura: {{ sensor.temperature }}°C</p>

  <div v-if="actuatorMap[sensor.location]">
    <p>🔌 Attuatore: {{ actuatorMap[sensor.location].status ? 'Attivo' : 'Spento' }}</p>
  </div>
</div>
<div v-if="sensorReg === true" class="grid grid-cols-12 gap-8">
        <SensorCard v-for="(sensAct, index) in localsData" :key="index" :name="sensAct.name"
          :temperature="sensAct.temperature" :humidity="sensAct.humidity" :location="sensAct.location"
          :disconnected="sensAct.disconnected" />

      </div>  -->