<script>
import SensorCard from "@/components/SensorCard.vue";

export default {
    components: {
        SensorCard,
    },
    data() {
        return {
            serverResponseCentral: '',
            serverResponseSingles: [],
            actuators: [],
            sensors: [   // To be retrieved from backend, JUST CHILLING LIKE MADMAN
                { name: "Salotto", temperature: 22, humidity: 55 },  
                { name: "Camera", temperature: 20, humidity: 50 },
                { name: "Cucina", temperature: 24, humidity: 60 },
                { name: "Bagno", temperature: 27, humidity: 80 },
                { name: "Stanzino", temperature: 16, humidity: 82 },
                { name: "Seminterrato", temperature: 10, humidity: 69},
            ],
        };
    },
    async mounted() {
        this.getActuators();
    },
    methods: {
        async getActuators() {
            try {
                const response = await fetch('http://localhost:8000/listActuators');
                const data = await response.json();
                this.actuators = data;
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        },
        async setSingleActuator(id, stateDesired) {
            try {
                const response = await fetch('http://localhost:8000/updateActuator', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id, stateDesired })
                });

                const data = await response.json();
                this.serverResponseSingles[id] = data.receivedData.stateDesired ? "Turned ON" : "Turned OFF";
            } catch (error) {
                console.error('Error sending data:', error);
            }
        },
        // async setCentralActuator(stateDesired) {
        //     try {
        //         const response = await fetch('http://localhost:8000/centralActuators', {
        //             method: 'POST',
        //             headers: {
        //                 'Content-Type': 'application/json'
        //             },
        //             body: JSON.stringify({stateDesired})
        //         });

        //         const data = await response.json();
        //         this.serverResponseCentral = data.receivedData.stateDesired ? "Turned ON" : "Turned OFF";
        //     } catch (error) {
        //         console.error('Error sending data:', error);
        //     }
        // },
    },
};
</script>

<template>
    <h1>Actuator Control</h1>
    <div>
        <h2>Central control</h2>
        <button @click="actuators.forEach(actuator => setSingleActuator(actuator.id, true))">New Activate All</button>
        <button @click="actuators.forEach(actuator => setSingleActuator(actuator.id, false))">New Deactivate
            All</button>


        <!-- <button @click="setCentralActuator(true)">Activate all actuators</button> -->
        <!-- <button @click="setCentralActuator(false)">Deactivate all actuators</button> -->
        <p>Server Response: {{ serverResponseSingles["actuator1"] }}</p>
        <!-- magari si itera sulla lista delle risposte e si stampano tutte, oppure si stampa OK se tutte sono OK-->
        <!-- Ma dirò che secondo me possiamo anche levarla la risposta del server -->

    </div>
    <div>
        <h2>Single Control</h2>

        <div v-for="actuator in actuators" :key="actuator.id" class="actuator">
            <span>{{ actuator.id }}(Status: {{ actuator.status ? 'ON' : 'OFF' }})</span>
            <button @click="setSingleActuator(actuator.id, true)">Activate</button>
            <button @click="setSingleActuator(actuator.id, false)">Deactivate</button>
            <p>Server Response: {{ serverResponseSingles[actuator.id] }}</p>
        </div>
    </div>
    <div class="cards-container">
        <SensorCard v-for="sensor in sensors" :key="sensor.name" 
            :name="sensor.name" 
            :temperature="sensor.temperature"
            :humidity="sensor.humidity" />
    </div>
</template>


<style>
button {
    margin: 5px;
    padding: 10px;
    background: darkorange;
    color: white;
    border: none;
    cursor: pointer;
}

.cards-container {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
}
</style>