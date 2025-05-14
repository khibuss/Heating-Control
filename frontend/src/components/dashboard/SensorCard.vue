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
  <div class="flex-1">
    <div class="rounded-xl p-4 text-center h-full">

      <!-- Se sensore disconnesso -->
      <template v-if="disconnected">
        <h2 class="text-xl font-semibold text-slate-800 mb-6">Dati ambientali</h2>
        <div class="text-red-500 text-lg font-semibold mb-6">⚠️ Sensore non rilevato</div>
        <div class="text-sm text-gray-500">Controllare la connessione o l'alimentazione</div>
      </template>

      <!-- Se sensore attivo -->
      <template v-else>
        <!-- Sensor Name -->
        <h2 class="text-xl font-semibold text-slate-800 mb-6">Dati ambientali</h2>

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


      </template>
    </div>
  </div>

</template>
