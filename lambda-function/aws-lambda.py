import boto3

client = boto3.client('dynamodb') 

def lambda_handler(event, context):
    topic = event.get('topic', '')
    if topic.startswith('sensor'):
        device_type = 'sensor'
    elif topic.startswith('actuator'):
        device_type = 'actuator'
    else:
        device_type = 'unknown'

    match device_type:
        case 'sensor':
            return handle_sensor(event, topic)
        case 'actuator':
            # Placeholder per gestione actuator
            return handle_actuator(event, topic)
        case _:
            return return_status(400, 'Invalid topic format')


def return_status(status, message):
    return {
        'statusCode': status,
        'body': message
    }

def handle_sensor(event, id_value):
    try:
        timestamp = str(event['timestamp'])
        ttl = int(timestamp) + 600 # Dopo 10 minuti verrà eliminato 
        reported = event['state']['reported']
        temperature = reported['temperature']
        humidity = reported['humidity']
    except KeyError as e:
        return return_status(400, f'Missing required field: {str(e)}')

    try:
        client.put_item(
            TableName='sensorData',
            Item={
                'id': {'S': id_value},
                'timestamp': {'S': timestamp},
                'temperature': {'S': str(temperature)},
                'humidity': {'N': str(humidity)},
                'ttl': {'N': str(ttl)}
            }
        )
        return return_status(200, 'Sensor data inserted successfully')

    except Exception as e:
        return return_status(500, f'Error inserting data: {str(e)}')

def handle_actuator(event, id_value):
    try:
        # Verifica che il messaggio contenga lo stato "reported"
        if 'reported' not in event.get('state', {}):
            print("Stato 'desired' ricevuto o messaggio non rilevante, ignorato.")
            return return_status(200, "Ignored non-reported state")

        timestamp = int(event['timestamp'])
        reported = event['state']['reported']
        status = reported['status']  # Es: "ON" o "OFF"
        location = reported['location']

    except KeyError as e:
        return return_status(400, f'Missing required field: {str(e)}')

    try:
        # Aggiorna la tabella DynamoDB
        response = client.update_item(
            TableName='ActuatorRegistry',
            Key={'id': {'S': id_value}},
            UpdateExpression='SET #s = :status, #l = :location,  #t = :lastSeen',
            ExpressionAttributeNames={
                '#s': 'status',
                '#l': 'location',
                '#t': 'lastSeen'
            },
            ExpressionAttributeValues={
                ':status': {'BOOL': status},
                ':location': {'S': location},
                ':lastSeen': {'N': str(timestamp)}
            }
        )

        print(f"Stato attuatore aggiornato: {id_value} -> {status}")
        return return_status(200, 'Actuator state updated')

    except Exception as e:
        return return_status(500, f'Error updating actuator: {str(e)}')


        