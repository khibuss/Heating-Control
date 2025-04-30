<script setup>
import { defineProps, ref } from "vue";

const props = defineProps({
    name: String,
    temperature: Number,
    humidity: Number,
});

const isPumpOn = ref(false);

const togglePump = () => {
    console.log(`Pompa di calore in ${props.name}: ${isPumpOn.value ? "Accesa" : "Spenta"}`);
};
</script>

<template>
    <div class="sensor-card">
        <h2 class="sensor-name">{{ name }}</h2>

        <div class="sensor-stats">
            <span class="stat temperature">🌡️ {{ temperature }}°C</span>
            <span class="stat humidity">💧 {{ humidity }}%</span>
        </div>

        <div class="pump-control">
            <label class="switch">
                <input type="checkbox" v-model="isPumpOn" @change="togglePump" />
                <span class="slider"></span>
            </label>
            <span class="pump-status">{{ isPumpOn ? 'Pompa ON' : 'Pompa OFF' }}</span>
        </div>
    </div>
</template>



<style scoped>
.sensor-card {
    background: linear-gradient(to bottom right, #f0f9ff, #dff6fd);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    text-align: center;
    transition: transform 0.2s ease;
    width: 220px;
}

.sensor-card:hover {
    transform: scale(1.02);
}

.sensor-name {
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 10px;
    color: #2c3e50;
}

.sensor-stats {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 16px;
}

.stat {
    padding: 4px 10px;
    border-radius: 20px;
    font-weight: bold;
    font-size: 0.9rem;
}

.temperature {
    background-color: #ffe6e6;
    color: #c0392b;
}

.humidity {
    background-color: #e6f7ff;
    color: #2980b9;
}

.pump-control {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 10px;
}

.pump-status {
    font-size: 0.9rem;
    font-weight: 500;
    color: #555;
}

/* Toggle Switch */
.switch {
    position: relative;
    display: inline-block;
    width: 46px;
    height: 24px;
}

.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.3s;
    border-radius: 24px;
}

.slider::before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
}

input:checked+.slider {
    background-color: #27ae60;
}

input:checked+.slider::before {
    transform: translateX(22px);
}
</style>