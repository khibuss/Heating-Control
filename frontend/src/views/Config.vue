<template>
    <div class="p-6 max-w-3xl mx-auto">
      <div class="bg-white rounded-xl shadow-md p-6 space-y-6 border border-slate-200">
        <!-- Title -->
        <h2 class="text-xl font-semibold text-slate-700">Configurazione Riscaldamento</h2>
  
        <!-- Current Config Overview -->
        <div class="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <p class="text-slate-600 mb-1">
            <strong>Tipo controllo temperatura:</strong>
            {{ useAverage ? 'Media globale' : `Sensore specifico: ${selectedSensor}` }}
          </p>
          <p class="text-slate-600">
            <strong>Soglia bassa:</strong> {{ lowerThreshold }}°C
          </p>
          <p class="text-slate-600">
            <strong>Soglia alta:</strong> {{ upperThreshold }}°C
          </p>
        </div>
  
        <!-- Config Form -->
        <form @submit.prevent="saveConfig" class="space-y-4">
          <!-- Threshold Inputs -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-slate-600 mb-1">Soglia bassa (°C)</label>
              <input v-model.number="lowerThreshold" type="number" class="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-300" />
            </div>
            <div>
              <label class="block text-sm text-slate-600 mb-1">Soglia alta (°C)</label>
              <input v-model.number="upperThreshold" type="number" class="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-300" />
            </div>
          </div>
  
          <!-- Control Type -->
          <div>
            <label class="block text-sm text-slate-600 mb-2">Tipo controllo:</label>
            <div class="flex items-center gap-4">
              <label class="flex items-center gap-2 text-slate-700">
                <input type="radio" value="average" v-model="controlType" />
                Media globale
              </label>
              <label class="flex items-center gap-2 text-slate-700">
                <input type="radio" value="sensor" v-model="controlType" />
                Sensore specifico
              </label>
            </div>
          </div>
  
          <!-- Sensor Selection (Conditional) -->
          <div v-if="controlType === 'sensor'">
            <label class="block text-sm text-slate-600 mb-1 mt-2">Seleziona sensore</label>
            <select v-model="selectedSensor" class="w-full border border-slate-300 rounded-lg px-3 py-2">
              <option v-for="sensor in sensors" :key="sensor" :value="sensor">{{ sensor }}</option>
            </select>
          </div>
  
          <!-- Submit Button -->
          <div class="text-right pt-4">
            <button type="submit" class="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg">
              Salva configurazione
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
<script setup>
  import { ref } from 'vue';
  
  const lowerThreshold = ref(18);
  const upperThreshold = ref(24);
  const controlType = ref('average'); // or 'sensor'
  const selectedSensor = ref('Sala 1');
  
  // Simulated sensor list
  const sensors = ['Sala 1', 'Cucina', 'Camera da letto', 'Bagno'];
  
  const useAverage = computed(() => controlType.value === 'average');
  
  const saveConfig = () => {
    const config = {
      lower: lowerThreshold.value,
      upper: upperThreshold.value,
      control: useAverage.value ? 'average' : selectedSensor.value,
    };
    console.log('Saved configuration:', config);
    // Send config to backend here...
  };
</script>
  