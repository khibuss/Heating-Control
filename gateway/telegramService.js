const {EOL} = require('os');
const axios = require('axios');
require('dotenv').config();


const TELEGRAM_URL = 'https://api.telegram.org/bot' + process.env.BOT_TOKEN + '/sendMessage?chat_id=' + process.env.CHAT_ID + '&text=';


module.exports = {
 notify: async function(title, body) {
  axios.get(TELEGRAM_URL + encodeURIComponent(title + EOL + body))
   .then(function (response) {
    // handle success
    //console.log(response);
   })
   .catch(function (error) {
    // handle error
    console.log(error);
    //console.log(TELEGRAM_URL);
   })
 }
}