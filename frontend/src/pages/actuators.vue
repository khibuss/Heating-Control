<script>
export default {
    data() {
        return {
            serverResponseCentral: '',
            serverResponseSingles: [],
            actuators: [],

        };
    },
    async mounted() {
        this.getActuators();
    },
    methods: {
        async getActuators(){
            try {
                const response = await fetch('http://localhost:8000/listActuators');
                const data = await response.json();
                this.actuators = data;
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        },
        async setSingleActuator(id, stateDesired){
            try {
                const response = await fetch('http://localhost:8000/singleActuator', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({id,stateDesired})
                });

                const data = await response.json();
                this.serverResponseSingles[id] = data.receivedData.stateDesired ? "Turned ON" : "Turned OFF";
            } catch (error) {
                console.error('Error sending data:', error);
            }
        },
        async setCentralActuator(stateDesired) {
            try {
                const response = await fetch('http://localhost:8000/centralActuators', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({stateDesired})
                });

                const data = await response.json();
                this.serverResponseCentral = data.receivedData.stateDesired ? "Turned ON" : "Turned OFF";
            } catch (error) {
                console.error('Error sending data:', error);
            }
        },
    },
};
</script>

<template>
    <h1>Actuator Control</h1>
    <div>
      <h2>Central control</h2>
      <button @click="setCentralActuator(true)">Activate all actuators</button>
      <button @click="setCentralActuator(false)">Deactivate all actuators</button>
      <p>Server Response: {{ serverResponseCentral }}</p>
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
  </style>
  