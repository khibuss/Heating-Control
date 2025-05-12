#include <pgmspace.h>

const char ssid[] = "xxxxxx";
const char pass[] = "xxxxx";

#define THINGNAME "actuator1"
#define LOCAL "Cucina"

int8_t TIME_ZONE = +1;  //ITALY +1 UTC

#define USE_SUMMER_TIME_DST
const char MQTT_HOST[] = "xxxxxxxxx.amazonaws.com";   //rest API endpoint

// Copy contents from AWS CA certificate here ▼
static const char cacert[] PROGMEM = R"EOF(
// put root_CA.pem 
)EOF";

// Copy contents from XXXXXXXX-certificate.pem.crt here ▼
static const char client_cert[] PROGMEM = R"KEY(
// put certificate.pem 

)KEY";
// Copy contents from XXXXXXXX-private.pem.key here ▼
static const char privkey[] PROGMEM = R"KEY(
// put private.pem 

)KEY";