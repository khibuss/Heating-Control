module.exports = {
    dynamodb_aws_table_name: process.env.TABLE_NAME_DYNAMODB,
    dynamodb_aws_local_config: {
      //Provide details for local configuration here
    },
    dynamodb_aws_remote_config: {
         accessKeyId: process.env.ID_ACCESS_KEY_DYNAMODB,
         secretAccessKey: process.env.SECRET_ACCES_KEY_DYNAMODB,
         region: 'eu-north-1',
    }
};