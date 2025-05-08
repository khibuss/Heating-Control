<script setup>
import { defineProps, ref } from 'vue';

const props = defineProps({
    name: String,
    temperature: Number,
    humidity: Number,
    location: String,
    disconnected: Boolean
});

const isPumpOn = ref(false);

const togglePump = () => {
    console.log(`Pompa di calore in ${props.name}: ${isPumpOn.value ? 'Accesa' : 'Spenta'}`);
};
</script>

<template>
    <div class="col-span-12 lg:col-span-6 xl:col-span-3 bg-slate-100 p-2 rounded-xl shadow-md">
      <div
        class="bg-[#fdfeff] rounded-xl p-6 shadow-lg text-center transition-transform duration-200 hover:scale-[1.02]">
  
        <!-- Se sensore disconnesso -->
        <template v-if="disconnected">
          <h2 class="text-xl font-semibold text-slate-800 mb-6">{{ location }}</h2>
          <div class="text-red-500 text-lg font-semibold mb-6">⚠️ Sensore non rilevato</div>
          <div class="text-sm text-gray-500">Controllare la connessione o l'alimentazione</div>
        </template>
  
        <!-- Se sensore attivo -->
        <template v-else>
          <!-- Sensor Name -->
          <h2 class="text-xl font-semibold text-slate-800 mb-6">{{ location }}</h2>
  
          <!-- Sensor Stats -->
          <div class="flex justify-around mb-6">
            <!-- Temperature -->
            <div class="flex flex-col items-center">
              <span class="text-3xl font-bold text-[#c0392b] mb-1">🌡️ {{ temperature }}°C</span>
              <span class="text-xs text-gray-500">Temperature</span>
            </div>
  
            <!-- Humidity -->
            <div class="flex flex-col items-center">
              <span class="text-2xl font-bold text-[#2980b9] mb-1">💧 {{ humidity }}%</span>
              <span class="text-xs text-gray-500">Humidity</span>
            </div>
          </div>
  
          <!-- Pump Toggle -->
          <div class="flex items-center justify-center gap-4">
            <label class="relative inline-block w-12 h-6">
              <input type="checkbox" v-model="isPumpOn" @change="togglePump" class="opacity-0 w-0 h-0 peer" />
              <span
                class="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-300 rounded-full transition peer-checked:bg-green-500"></span>
              <span
                class="absolute left-1 bottom-1 h-4 w-4 bg-white rounded-full transition peer-checked:translate-x-6"></span>
            </label>
            <span class="text-sm font-medium text-gray-700">
              {{ isPumpOn ? 'Pompa ON' : 'Pompa OFF' }}
            </span>
          </div>
        </template>
      </div>
    </div>
  </template>
  
