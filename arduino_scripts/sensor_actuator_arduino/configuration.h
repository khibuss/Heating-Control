#include <pgmspace.h>

const char ssid[] = "xxxxxxx";
const char pass[] = "xxxxxxxx";

#define THINGNAME_SENSOR "sensor1"
#define THINGNAME_ACTUATOR "actuator1"
#define LOCATION "Cucina"
#define PUBLISH_DELAY_ACTUATOR 1000*10
#define PUBLISH_DELAY_SENSOR 1000*2


int8_t TIME_ZONE = +1;  //ITALY +1 UTC

#define USE_SUMMER_TIME_DST
const char MQTT_HOST[] = "xxxxxxxxxxx1.amazonaws.com";   //rest API endpoint

// Copy contents from AWS CA certificate here ▼
static const char cacert[] PROGMEM = R"EOF(
xxxxxxxxxx
)EOF";

// Copy contents from XXXXXXXX-certificate.pem.crt here ▼
static const char client_cert[] PROGMEM = R"KEY(
xxxxxxxxxxxx
)KEY";
// Copy contents from XXXXXXXX-private.pem.key here ▼
static const char privkey[] PROGMEM = R"KEY(
xxxxxxxxx
)KEY";