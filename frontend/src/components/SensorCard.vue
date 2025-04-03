<template>
    <div class="sensor-card">
        <h2>{{ name }}</h2>
        <p>🌡️ Temperatura: {{ temperature }}°C</p>
        <p>💧 Umidità: {{ humidity }}%</p>
        <input type="checkbox" :id="name">
        <label :for="name" class="buttonPump"></label>
    </div>
</template>

<script setup>
import { defineProps, ref } from "vue";

const props = defineProps({
    name: String,
    temperature: Number,
    humidity: Number,
});

const isPumpOn = ref(false);

const togglePump = () => {
    isPumpOn.value = !isPumpOn.value;
    console.log(`Pompa di calore in ${props.name}: ${isPumpOn.value ? "Accesa" : "Spenta"}`);
};
</script>

<style scoped >
.sensor-card {
    border: 1px solid #ccc;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
    margin: 10px;
}

.buttonPump {
    background-color:#d2d2d2;
    width: 40px;
    height: 24px;
    border-radius: 200px;
    cursor: pointer;
    /* position: relative; */
    display: block;
    margin-right: 0;
    margin-left: auto;
}

.buttonPump::before {
    position: absolute;
    content: "";
    background-color: white;
    width: 20px;
    height: 20px;
    border-radius: 200px;
    margin-left: -17px;
    margin-top: 2px;
    transition: 0.2s;
}


input:checked + .buttonPump {
    background-color: green;
} 

input:checked + .buttonPump::before {
    transform: translateX(15px);
} 

input {
    display: none;
}
</style>