import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const SERVICE_NAME = 'ifkpass-api';
const REGION = 'us-east-1';

export class IfkpassApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps = {}) {
    super(scope, id, props);

    // IAM Role para a Lambda
    const lambdaRole = new iam.Role(this, 'ProxyLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'Lambda execution role for IFKPass Proxy',
      roleName: `${SERVICE_NAME}-role`,
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSLambdaBasicExecutionRole',
        ),
      ],
    });

    lambdaRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'stepfunctions:*',
          'logs:*',
          's3:*',
          'rekognition:*',
          'bedrock:*',
          'dynamodb:*',
          'textract:*',
          'sqs:*',
          'events:*',
          'states:*',
          'cognito-idp:*',
        ],
        resources: ['*'],
      }),
    );

    const logGroup = new logs.LogGroup(this, 'ProxyLambdaLogGroup', {
      logGroupName: `/aws/lambda/${SERVICE_NAME}`,
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const environment: Record<string, string> = {
      STAGE: SERVICE_NAME,
      PORT: '3333',
      REGION,
      ACCOUNT_ID: '972210179301',
      SERVICE: SERVICE_NAME,
      VERSION: '1.0.0',
      COGNITO_URL: 'https://cognito-idp.us-east-1.amazonaws.com',
      COGNITO_CLIENT_ID: '6qo3c5ha69l7ecrrop64oqr5ev',
      COGNITO_CLIENT_SECRET:
        '1ukroluga9v6fchmrbuuh63hf7acsr0ts99k95um23anl2nlt5mj',
      COGNITO_USER_POOL_ID: 'us-east-1_Cz8MRAcWv',
      COGNITO_ADMINS_GROUP_NAME: 'admins',
      USERS_TABLE_NAME: 'ifkpass-users',
      PROFILE_BUCKET_NAME: 'ifkpass-profile-photos',
      MERCADO_PAGO_ACCESS_TOKEN:
        'APP_USR-6837657628161682-110618-7a696b9620c26960437502a891b70b7d-258174466',
      MERCADO_PAGO_PUBLIC_KEY: 'APP_USR-d7bbde4e-ce52-473c-85be-b2e0f9eab73e',
      MERCADO_PAGO_WEBHOOK_URL:
        'https://k3d4il4asi.execute-api.us-east-1.amazonaws.com/ifkpass-api/mercado-pago/webhook',
      MERCADO_PAGO_WEBHOOK_SECRET:
        '6abe40b6d32e4015338afd5267c3a3edaa6d7053952c08b8304ff7e3dd77b87e',
    };

    const proxyEntry = join(
      dirname(fileURLToPath(import.meta.url)),
      '../src/infra/http/handlers/proxy/index.ts',
    );

    const proxyFunction = new NodejsFunction(this, 'ProxyFunction', {
      functionName: SERVICE_NAME,
      entry: proxyEntry,
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_22_X,
      bundling: {
        format: OutputFormat.CJS,
        target: 'node22',
        keepNames: true,
        mainFields: ['module', 'main'],
      },
      timeout: cdk.Duration.seconds(900),
      memorySize: 1024,
      logGroup,
      role: lambdaRole,
      environment,
      description: 'IFKPass Proxy Function',
      retryAttempts: 0,
      architecture: lambda.Architecture.X86_64,
    });

    const api = new apigateway.LambdaRestApi(this, 'ProxyApi', {
      restApiName: SERVICE_NAME,
      handler: proxyFunction,
      proxy: true,
      deployOptions: {
        stageName: SERVICE_NAME,
      },
    });

    new cdk.CfnOutput(this, 'ProxyFunctionName', {
      value: proxyFunction.functionName,
      description: 'Nome da função Lambda Proxy',
      exportName: `${SERVICE_NAME}-ProxyFunctionName`,
    });

    new cdk.CfnOutput(this, 'ProxyFunctionArn', {
      value: proxyFunction.functionArn,
      description: 'ARN da função Lambda Proxy',
      exportName: `${SERVICE_NAME}-ProxyFunctionArn`,
    });

    new cdk.CfnOutput(this, 'LambdaRoleArn', {
      value: lambdaRole.roleArn,
      description: 'ARN da role de execução da Lambda',
      exportName: `${SERVICE_NAME}-LambdaRoleArn`,
    });

    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: api.url,
      description: 'Endpoint público do API Gateway (Lambda proxy)',
      exportName: `${SERVICE_NAME}-ApiGatewayUrl`,
    });
  }
}
