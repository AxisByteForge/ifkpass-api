#!/usr/bin/env tsx
import 'dotenv/config';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';

import { handler } from '../src/infra/http/handlers/proxy';

// Carrega o handler da Lambda
async function runLocalLambda() {
  const payloadPath = process.argv[2];

  if (!payloadPath) {
    console.error('❌ Uso: tsx scripts/local-lambda.ts <caminho-do-payload>');
    process.exit(1);
  }

  try {
    // Lê o payload
    const fullPath = resolve(process.cwd(), payloadPath);
    const payloadContent = readFileSync(fullPath, 'utf-8');
    const event = JSON.parse(payloadContent) as APIGatewayProxyEvent;

    console.log('📦 Payload carregado:', fullPath);
    console.log('🔀 Rota:', event.httpMethod, event.path);
    console.log('');

    // Mock do Context
    const context: Context = {
      callbackWaitsForEmptyEventLoop: false,
      functionName: 'local-test',
      functionVersion: '1',
      invokedFunctionArn: 'arn:aws:lambda:local',
      memoryLimitInMB: '1024',
      awsRequestId: 'local-' + Date.now(),
      logGroupName: '/aws/lambda/local',
      logStreamName: 'local',
      getRemainingTimeInMillis: () => 900000, // 15 minutos
      done: () => {},
      fail: () => {},
      succeed: () => {},
    };

    // Importa e executa o handler

    console.log('🚀 Executando Lambda...\n');
    const startTime = Date.now();

    const result = await handler(event, context);

    const duration = Date.now() - startTime;

    console.log('\n✅ Lambda executada com sucesso!');
    console.log(`⏱️  Duração: ${duration}ms`);
    console.log('\n📤 Resposta:');
    console.log('Status:', result.statusCode);
    console.log('Headers:', JSON.stringify(result.headers || {}, null, 2));
    console.log('Body:', result.body ? JSON.parse(result.body) : null);
  } catch (error) {
    console.error('\n❌ Erro ao executar Lambda:');
    console.error(error);
    process.exit(1);
  }
}

runLocalLambda();
