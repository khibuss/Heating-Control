require('dotenv').config();
const { getSensorsId } = require('../dbService');
const { getAverageTemperatureNew } = require('../controllerDevices');

// Configurazione condivisa per i test di integrazione
describe('Test di integrazione con DynamoDB', () => {
  // Condiviso tra tutti i test nel describe

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
      const avgTemp = await getAverageTemperatureNew();
      //console.log('Temperatura media:', avgTemp);
      
    }, 10000);
  });
});