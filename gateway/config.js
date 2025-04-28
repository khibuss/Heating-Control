module.exports = {
    dynamodb_aws_SensorReadings: process.env.DYNAMODB_TABLE_SENSORREADINGS,
    dynamodb_aws_SensorRegistry: process.env.DYNAMODB_TABLE_SENSORREGISTRY,
    dynamodb_aws_ActuatorStatus: process.env.DYNAMODB_TABLE_ACTUATOR_STATUS,
    dynamodb_aws_local_config: {
      //Provide details for local configuration here
    },
    dynamodb_aws_remote_config: {
         accessKeyId: process.env.ID_ACCESS_KEY_DYNAMODB,
         secretAccessKey: process.env.SECRET_ACCES_KEY_DYNAMODB,
         region: 'eu-north-1',
    }
};