<template>
  <div class="card space-y-6">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-800">Configurazione Riscaldamento</h1>
    </div>

    <!-- Current Config Preview -->
    <div class="bg-slate-100 rounded-xl p-4 border border-slate-200 shadow-inner">
      <p class="text-slate-700 mb-1">
        <strong>Temperatura di riferimento:</strong>
        {{ useAverage ? 'Media globale' : `Sensore specifico: ${sensor?.name || 'Nessuno'}` }}
      </p>
      <p class="text-slate-700"><strong>Soglia bassa:</strong> {{ lower }}°C</p>
      <p class="text-slate-700"><strong>Soglia alta:</strong> {{ upper }}°C</p>
    </div>
  </div>

  <div class="card">
    <ConfirmDialog />
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold text-slate-800 mb-6">Edit</h2>
    </div>
    <!-- Form -->
    <form @submit.prevent="saveConfig" class="space-y-6">
      <!-- Thresholds -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-slate-600 mb-1">Soglia bassa (°C)</label>
          <input v-model.number="formLower" type="number"
            class="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-300" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-600 mb-1">Soglia alta (°C)</label>
          <input v-model.number="formUpper" type="number"
            class="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-300" />
        </div>
      </div>

      <!-- Control Type -->
      <div>
        <label class="block text-sm font-medium text-slate-600 mb-2">Tipo controllo:</label>
        <div class="flex gap-6">
          <label class="inline-flex items-center text-slate-700">
            <input type="radio" value="average" v-model="formControlType" class="mr-2" />
            Media globale
          </label>
          <label class="inline-flex items-center text-slate-700">
            <input type="radio" value="sensor" v-model="formControlType" class="mr-2" />
            Sensore specifico
          </label>
        </div>
      </div>

      <!-- Sensor Selection -->
      <div v-if="formControlType === 'sensor'" class="mt-4">
        <label class="block text-sm font-medium text-slate-600 mb-1">Seleziona sensore:</label>
        <Dropdown v-model="formSensor" :options="listSensors" optionLabel="name" placeholder="Seleziona sensore"
          class="w-full md:w-64" />
      </div>

      <!-- Submit -->
      <div class="pt-6 text-right">
        <button type="submit"
          class="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-6 py-2 rounded-lg shadow transition">
          Salva configurazione
        </button>
      </div>
    </form>

  </div>
</template>

<script setup>
import ConfirmDialog from 'primevue/confirmdialog';
import Dropdown from 'primevue/dropdown';
import { useConfirm } from 'primevue/useconfirm';
import { computed, ref } from 'vue';

const confirm = useConfirm();

// Saved state
const lower = ref(18);
const upper = ref(24);
const controlType = ref('average');
const sensor = ref(null);

// Temporary form state
const formLower = ref(lower.value);
const formUpper = ref(upper.value);
const formControlType = ref(controlType.value);
const formSensor = ref(sensor.value);

const listSensors = ref([
  { name: 'Sensore Cucina', id: 1 },
  { name: 'Sensore Salotto', id: 2 },
  { name: 'Sensore Bagno', id: 3 },
]);

const useAverage = computed(() => controlType.value === 'average');

const saveConfig = () => {
  confirm.require({
    message: 'Confermi di voler salvare la configurazione?',
    header: 'Conferma',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Conferma',
    rejectLabel: 'Annulla',
    acceptClass: 'p-button-danger',
    accept: () => {
      lower.value = formLower.value;
      upper.value = formUpper.value;
      controlType.value = formControlType.value;
      sensor.value = formSensor.value;

      console.log('Configurazione salvata:', {
        lower: lower.value,
        upper: upper.value,
        control: useAverage.value ? 'average' : sensor.value,
      });
    },
  });
};
</script>