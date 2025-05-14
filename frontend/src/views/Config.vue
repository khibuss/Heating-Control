<template>
  <div class="space-y-10">

    <!-- Header -->
    <div class="card space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-slate-800">Configurazione Riscaldamento</h1>
      </div>

      <!-- Current Config Preview -->
      <div class="bg-slate-100 rounded-xl p-6 border border-slate-200 shadow-inner text-lg space-y-2">
        <p class="text-slate-700">
          <strong>Temperatura di riferimento:</strong><span class="text-lg ml-4 text-[#ff6666]"> {{ configPreviewText
          }}</span>
        </p>
        <p class="text-slate-700">
          <strong>Soglia bassa:</strong><span class="text-xl ml-4 text-[#ff6000]"> {{ lower
          }}°C</span>
        </p>
        <p class="text-slate-700">
          <strong>Soglia alta:</strong> <span class="text-xl ml-4 text-[#ff6000]"> {{ upper
          }}°C</span>
        </p>
      </div>
    </div>

    <!-- Form Section -->
    <div class="card space-y-8">
      <ConfirmDialog />

      <!-- Form Header -->
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-slate-800">Modifica Configurazione</h2>
      </div>

      <!-- Form -->
      <form @submit.prevent="saveConfig" class="space-y-8">

        <!-- Thresholds -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label class="block text-base font-lg text-slate-700 mb-2">Soglia bassa (°C)</label>
            <input v-model.number="formLower" type="number"
              class="w-full border border-slate-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-sky-300" />
          </div>
          <div>
            <label class="block text-base font-lg text-slate-700 mb-2">Soglia alta (°C)</label>
            <input v-model.number="formUpper" type="number"
              class="w-full border border-slate-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-sky-300" />
          </div>
        </div>

        <p v-if="isInvalidThreshold" class="text-red-500 text-base">
          ⚠️ La soglia bassa deve essere inferiore alla soglia alta.
        </p>

        <!-- Control Type -->
        <div>
          <label class="block text-base font-lg text-slate-700 mb-3">Tipo controllo:</label>
          <div class="flex flex-wrap gap-6">
            <label class="inline-flex items-center text-lg text-slate-700">
              <input type="radio" value="average" v-model="formControlType" class="mr-2" />
              Media globale
            </label>
            <label class="inline-flex items-center text-lg text-slate-700">
              <input type="radio" value="sensor" v-model="formControlType" class="mr-2" />
              Sensore specifico
            </label>
          </div>
        </div>

        <!-- Sensor Selection -->
        <div v-if="formControlType === 'sensor'">
          <label class="block text-base font-lg text-slate-700 mb-2">Seleziona sensore:</label>
          <Dropdown v-model="formSensor" :options="listSensors" optionLabel="name" placeholder="Seleziona sensore"
            class="w-full md:w-80" />
        </div>

        <!-- Submit Button -->
        <div class="pt-4 text-right">
          <button type="submit" :disabled="isInvalidThreshold"
            class="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-8 py-3 text-lg rounded-xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed">
            Salva configurazione
          </button>
        </div>

      </form>
    </div>

  </div>
</template>

<script setup>
import api from '@/utils/api';
import ConfirmDialog from 'primevue/confirmdialog';
import Dropdown from 'primevue/dropdown';
import { useConfirm } from 'primevue/useconfirm';
import { computed, onMounted, ref } from 'vue';

const confirm = useConfirm();

// Stati configurazione
const lower = ref(18);
const upper = ref(24);
const controlType = ref('average');
const sensor = ref(null);

// Stati form temporanei
const formLower = ref(lower.value);
const formUpper = ref(upper.value);
const formControlType = ref(controlType.value);
const formSensor = ref(sensor.value);

// Lista dinamica sensori
const listSensors = ref([]);

// Calcolo se si usa media
const useAverage = computed(() => controlType.value === 'average');
const isInvalidThreshold = computed(() => formLower.value >= formUpper.value);

const configPreviewText = computed(() => {
  if (formControlType.value === 'average') {
    return 'Media globale';
  } else if (formSensor.value?.name) {
    return `Sensore specifico: ${formSensor.value.name}`;
  } else {
    return 'Sensore specifico: Nessuno';
  }
});

// Caricamento sensori da backend
const loadSensors = async () => {
  try {
    const { data } = await api.get('/getSensorsId');
    listSensors.value = data.map(s => ({
      id: s.id,
      name: s.location // o s.name se il backend lo chiama così
    }));
  } catch (err) {
    console.error('Errore nel caricamento dei sensori:', err.message);
  }
};

const loadInitialConfiguration = async () => {
  try {
    const { data } = await api.get('/getConfiguration');

    // Imposta valori effettivi dal backend
    lower.value = data.lower;
    upper.value = data.upper;
    controlType.value = data.mode === 'global' ? 'average' : 'sensor';

    // Match del sensore se presente
    if (data.selectedSensor && listSensors.value.length > 0) {
      formSensor.value = listSensors.value.find(s => String(s.id) === data.selectedSensor) || null;
    }

    // Inizializza form temporanei
    formLower.value = lower.value;
    formUpper.value = upper.value;
    formControlType.value = controlType.value;

  } catch (err) {
    console.error('Errore nel caricamento configurazione:', err.message);
  }
};


// Al montaggio, carica sensori
onMounted(async () => {
  await loadSensors();             // prima i sensori
  await loadInitialConfiguration();
});

// Funzione per salvataggio configurazione (come già discusso)
const saveConfig = async () => {
  confirm.require({
    message: 'Confermi di voler salvare la configurazione?',
    header: 'Conferma',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Conferma',
    rejectLabel: 'Annulla',
    acceptClass: 'p-button-danger',
    accept: async () => {
      const payload = {
        lower: formLower.value,
        upper: formUpper.value,
        mode: formControlType.value === 'average' ? 'global' : 'single',
        selectedSensor: formControlType.value === 'sensor' ? String(formSensor.value?.id) : undefined
      };

      try {
        const { data } = await api.post('/configuration', payload);

        lower.value = formLower.value;
        upper.value = formUpper.value;
        controlType.value = formControlType.value;
        sensor.value = formSensor.value;

        console.log('Configurazione salvata:', data);
      } catch (err) {
        console.error('Errore nel salvataggio:', err.response?.data?.error || err.message);
      }
    }
  });
};


</script>