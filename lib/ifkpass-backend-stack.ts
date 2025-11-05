import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface IfkpassBackendStackProps extends cdk.StackProps {
  stage: string;
}

export class IfkpassBackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: IfkpassBackendStackProps) {
    super(scope, id, props);

    const { stage } = props;

    // Configurações por ambiente
    const envConfig = {
      dev: {
        usersTableName: 'users-dev',
        profileBucketName: 'ifkpass-profile-photos-dev',
      },
      hml: {
        usersTableName: 'users-hml',
        profileBucketName: 'ifkpass-profile-photos-hml',
      },
      prd: {
        usersTableName: 'users-prd',
        profileBucketName: 'ifkpass-profile-photos-prd',
      },
    };

    const config = envConfig[stage as keyof typeof envConfig] || envConfig.dev;

    // IAM Role para a Lambda
    const lambdaRole = new iam.Role(this, 'ProxyLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: `Lambda execution role for ${stage} IFKPass Proxy`,
      roleName: `${stage}-ifkpass-backend-proxy-role`,
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSLambdaBasicExecutionRole',
        ),
      ],
    });

    // Políticas inline para serviços AWS
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
        ],
        resources: ['*'],
      }),
    );

    // CloudWatch Log Group para a Lambda
    const logGroup = new logs.LogGroup(this, 'ProxyLambdaLogGroup', {
      logGroupName: `/aws/lambda/${stage}-ifkpass-backend-${stage}-proxy`,
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Variáveis de ambiente
    const environment: { [key: string]: string } = {
      STAGE: stage,
      REGION: props.env?.region || 'us-east-1',
      ACCOUNT_ID: props.env?.account || '972210179301',
      SERVICE: `${stage}-ifkpass-backend`,
      VERSION: '1.0.0',
      BCRYPT_SALT_ROUNDS: '10',
      COGNITO_URL: 'https://cognito-idp.us-east-1.amazonaws.com',
      COGNITO_CLIENT_ID:
        process.env.COGNITO_CLIENT_ID || '5t2ev7jjncg5cgn7vaq6vpm6dg',
      COGNITO_CLIENT_SECRET:
        process.env.COGNITO_CLIENT_SECRET ||
        '4q5te8k161eppget5ffnqlgdsf6kq00stm07tj256um2bt5gc5n',
      RESEND_MAIL_API_KEY:
        process.env.RESEND_MAIL_API_KEY ||
        're_FsEgzdsJ_DNWTFiy41QSU3cXEaHpzW5dZ',
      COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID || '1_HgPECUwQR',
      USERS_TABLE_NAME: config.usersTableName,
      PROFILE_BUCKET_NAME: config.profileBucketName,
    };

    // Lambda Function - Proxy
    const proxyFunction = new lambda.Function(this, 'ProxyFunction', {
      functionName: `${stage}-ifkpass-backend-${stage}-proxy`,
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('dist'),
      timeout: cdk.Duration.seconds(900),
      memorySize: 1024,
      role: lambdaRole,
      environment,
      logGroup,
      description: `IFKPass Proxy Function - ${stage}`,
      retryAttempts: 0,
      architecture: lambda.Architecture.X86_64,
    });

    // Outputs
    new cdk.CfnOutput(this, 'ProxyFunctionName', {
      value: proxyFunction.functionName,
      description: 'Nome da função Lambda Proxy',
      exportName: `${stage}-ProxyFunctionName`,
    });

    new cdk.CfnOutput(this, 'ProxyFunctionArn', {
      value: proxyFunction.functionArn,
      description: 'ARN da função Lambda Proxy',
      exportName: `${stage}-ProxyFunctionArn`,
    });

    new cdk.CfnOutput(this, 'LambdaRoleArn', {
      value: lambdaRole.roleArn,
      description: 'ARN da role de execução da Lambda',
      exportName: `${stage}-LambdaRoleArn`,
    });
  }
}
