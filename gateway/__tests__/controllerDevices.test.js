require('dotenv').config();
const { getSensorsId, getAllActuators, getActuatorFromId} = require('../dbService');
const { getAverageTemperature, checkTemperature} = require('../controllerDevices');

// Configurazione condivisa per i test di integrazione
describe('Test di integrazione con DynamoDB', () => {

  describe('Test per getSensorId', () => {
    it('dovrebbe restituire la lista dei sensori da DynamoDB', async () => {
      const sensors = await getSensorsId();
      expect(sensors).toBeInstanceOf(Array);
      
      if (sensors.length > 0) {
        expect(sensors[0]).toHaveProperty('id');
        expect(typeof sensors[0].id).toBe('string');
      }
    }, 10000);
  });

  describe('Test per getAverageTemperature', () => {
    it('dovrebbe restituire la temperatura media dei sensori', async () => {
      const avgTemp = await getAverageTemperature();
      console.log('Temperatura media:', avgTemp);
    }, 10000);
  });

  describe('Test per getAllActuators', () => {
    it('dovrebbe restituire la lista degli attuatori da DynamoDB', async () => {
      const actuators = await getAllActuators();
      expect(actuators).toBeInstanceOf(Array);
      console.log(actuators);
      if (actuators.length > 0) {
        expect(actuators[0]).toHaveProperty('id');
        expect(actuators[0]).toHaveProperty('location');
        expect(actuators[0]).toHaveProperty('status');
        expect(typeof actuators[0].id).toBe('string');
        expect(typeof actuators[0].location).toBe('string');
        expect(typeof actuators[0].status).toBe('boolean');
      }
    }, 10000);
  });

  describe('Test per getActuatorFromId', () => {
    it('dovrebbe restituire i dati di un attuatore con id "actuator1"', async () => {
      const actuator = await getActuatorFromId("actuator1");
      console.log(actuator);
      // Verifica che l'attuatore sia definito
      expect(actuator).toBeDefined();
  
      // Verifica i campi specifici
      expect(actuator.status).toBe(false);
      expect(actuator.location).toBe("Salotto");
    }, 10000); // timeout di 10 secondi per operazioni async
  });

  describe('Test per checkTemperature', () => {
    it('dovrebbe boh', async () => {
      await checkTemperature(9);
      //console.log('Temperatura media:', avgTemp);
    }, 10000);
  });
  
});