<script>
import SensorCard from '@/components/dashboard/SensorCard.vue';
import api from '@/utils/api';

export default {
    components: {
        SensorCard
    },
    data() {
        return {
            serverResponseCentral: '',
            serverResponseSingles: [],
            actuators: [],
            currentMode: 'individual', // NEW: active configuration display
            sensors: [
                { name: 'Salotto', temperature: 22, humidity: 55 },
                { name: 'Camera', temperature: 20, humidity: 50 },
                { name: 'Cucina', temperature: 24, humidity: 60 },
                { name: 'Bagno', temperature: 27, humidity: 80 },
                { name: 'Stanzino', temperature: 16, humidity: 82 },
                { name: 'Seminterrato', temperature: 10, humidity: 69 }
            ]
        };
    },
    async mounted() {
        this.getActuators();
    },
    methods: {
        // Usa l'API per ottenere gli attuatori
        async getActuators() {
            try {
                const response = await api.get('/listActuators');
                this.actuators = response.data;
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        },

        // Usa l'API per aggiornare uno specifico attuatore
        async setSingleActuator(id, stateDesired) {
            try {
                const response = await api.post('/updateActuator', {
                    id, 
                    stateDesired
                });

                this.serverResponseSingles[id] = response.data.receivedData.stateDesired ? 'Turned ON' : 'Turned OFF';
                this.currentMode = 'individual';
            } catch (error) {
                console.error('Error sending data:', error);
            }
        },

        async setAllActuators(stateDesired) {
            for (const actuator of this.actuators) {
                await this.setSingleActuator(actuator.id, stateDesired);
            }
            this.currentMode = 'global';
        },
    }
};
</script>


<template>
    <div class="dashboard-container">
        <main class="main-content">
            <!-- Central Control -->
            <section class="card section">
                <h2>Central Control</h2>
                <div class="button-group">
                    <button @click="setAllActuators(true)">Activate All</button>
                    <button @click="setAllActuators(false)">Deactivate All</button>
                </div>
            </section>

            <!-- Individual Actuator Control -->
            <section class="card section">
                <h2>Individual Control</h2>
                <div v-for="actuator in actuators" :key="actuator.id" class="actuator-row">
                    <div class="actuator-info">
                        <span>{{ actuator.id }} (Status: {{ actuator.status ? 'ON' : 'OFF' }})</span>
                    </div>
                    <div class="button-group">
                        <button @click="setSingleActuator(actuator.id, true)">Activate</button>
                        <button @click="setSingleActuator(actuator.id, false)">Deactivate</button>
                    </div>
                    <div class="response-msg">{{ serverResponseSingles[actuator.id] }}</div>
                </div>
            </section>
        </main>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');

* {
    box-sizing: border-box;
}

.dashboard-container {
    display: flex;
    min-height: 100vh;
    font-family: 'Segoe UI', sans-serif;
}

.main-content {
    flex: 1;
    padding: 2rem;
    background-color: #f4f6f8;
}

.top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.welcome {
    font-size: 20px;
    font-weight: 600;
}

.user {
    color: #0073e6;
}

.section-title {
    text-align: center;
    margin-bottom: 30px;
    font-size: 28px;
    color: #333;
}

.section {
    margin-bottom: 30px;
}

.card {
    background: rgb(210, 242, 249);
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.button-group {
    display: flex;
    gap: 12px;
    margin-top: 10px;
    flex-wrap: wrap;
}

button {
    padding: 10px 16px;
    background: darkorange;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s ease-in-out;
}

button:hover {
    background: #e69500;
}

.actuator-row {
    margin-bottom: 16px;
    padding: 12px;
    border-bottom: 1px solid #eee;
}

.actuator-info {
    font-weight: 500;
    margin-bottom: 6px;
}

.response-msg {
    font-size: 14px;
    color: #666;
    margin-top: 4px;
}

.cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
}

.sidebar {
    width: 220px;
    background-color: #1f2d3d;
    color: #ecf0f1;
    display: flex;
    flex-direction: column;
    padding: 1rem;
}

.sidebar-header .logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: #ffffff;
    margin-bottom: 2rem;
    text-align: center;
}

.nav-links {
    list-style: none;
    padding: 0;
}

.nav-links li {
    margin-bottom: 1rem;
}

.nav-links a {
    color: #bdc3c7;
    text-decoration: none;
    display: flex;
    align-items: center;
    font-size: 1rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    transition:
        background-color 0.3s,
        color 0.3s;
}

.nav-links a span {
    margin-right: 10px;
}

.nav-links a:hover {
    background-color: #34495e;
    color: #ecf0f1;
}

.nav-links a.active {
    background-color: #3498db;
    color: #fff;
    font-weight: bold;
}
</style>
