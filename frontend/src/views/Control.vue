<script setup>
import { ref } from 'vue';

const actuators = ref([
    { id: 1, name: 'Bagno', isOn: false },
    { id: 2, name: 'Cucina', isOn: false },
    { id: 3, name: 'Camera Letto', isOn: false },
    { id: 4, name: 'Soggiorno', isOn: false }
])

//const allOn = computed(() => actuators.value.every(actuator => actuator.isOn));

const allOn = ref(false)
const showModal = ref(false)

const toggleActuator = (actuator) => {
    actuator.isOn = !actuator.isOn
}

const confirmToggleAll = () => {
    allOn.value = !allOn.value
    actuators.value.forEach(actuator => actuator.isOn = allOn.value)
    showModal.value = false
}

</script>

<template>
    <div class="card space-y-6">
        <!-- Header and Global Toggle -->
        <div class="flex items-center justify-between">
            <h1 class="text-2xl font-semibold text-slate-800">Controllo Attuatori</h1>
            <button @click="showModal = true"
                class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow transition">
                {{ allOn ? 'Disattiva Tutti' : 'Attiva Tutti' }}
            </button>
        </div>

        <!-- Actuators Grid -->
        <div class="grid grid-cols-12 gap-6">
            <div v-for="actuator in actuators" :key="actuator.id" :class="[
                'col-span-12 md:col-span-6 xl:col-span-3 transition-all duration-300',
                'rounded-xl p-6 shadow bg-white hover:scale-[1.02] ',
                actuator.isOn ? 'border-2 border-red-500' : 'border border-gray-200'
            ]">
                <!-- Name -->
                <h2 class="text-xl font-semibold text-left text-gray-800 mb-4">{{ actuator.name }}</h2>

                <div class="flex items-center justify-between">
                    <!-- Icon + Status -->
                    <div class="flex items-center gap-2">
                        <i class="pi pi-bolt text-2xl text-slate-800"></i>
                        <span class="text-md font-semibold' 'text-red-600' 'text-gray-500">
                            Status:
                        </span>
                        <span :class="['text-md font-bold', actuator.isOn ? 'text-red-600' : 'text-gray-500']">

                            {{ actuator.isOn ? 'ON' : 'OFF' }}
                        </span>
                    </div>

                    <!-- Power Toggle Checkbox with Icon -->
                    <label class="relative cursor-pointer w-10 h-10">
                        <input type="checkbox" v-model="actuator.isOn" class="sr-only" />
                        <div :class="[
                            'w-full h-full flex items-center justify-center rounded-full border transition-colors',
                            actuator.isOn ? 'bg-red-500 text-white border-red-600' : 'bg-gray-100 text-slate-700 border-gray-300'
                        ]">

                            <i class="pi pi-power-off text-xl"></i>
                        </div>
                    </label>

                </div>
            </div>
        </div>

        <!-- Confirm Modal -->
        <div v-if="showModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl p-6 shadow-lg w-full max-w-sm">
                <h3 class="text-lg font-semibold mb-4 text-slate-800">
                    Conferma
                </h3>
                <p class="mb-6 text-slate-600">
                    Sei sicuro di voler {{ allOn ? 'disattivare' : 'attivare' }} tutti gli attuatori?
                </p>
                <div class="flex justify-end gap-4">
                    <button @click="showModal = false"
                        class="px-4 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700">
                        Annulla
                    </button>
                    <button @click="confirmToggleAll"
                        class="px-4 py-2 text-sm rounded-md bg-blue-600 hover:bg-blue-700 text-white">
                        Conferma
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
