# Migração de Serverless Framework para AWS CDK

## 📋 Visão Geral

Este projeto foi migrado do Serverless Framework para AWS CDK. Esta documentação explica a nova estrutura e como usar o CDK.

## 🏗️ Estrutura do Projeto

```
ifkpass-api/
├── bin/
│   └── app.ts              # Ponto de entrada da aplicação CDK
├── lib/
│   └── ifkpass-api-stack.ts  # Definição do stack principal
├── src/                    # Código fonte das Lambdas (sem alterações)
├── dist/                   # Código compilado das Lambdas
├── cdk.json                # Configuração do CDK
├── cdk.out/                # Output do CDK synth (gerado)
├── package.json            # Dependências e scripts
└── tsconfig.json           # Configuração TypeScript
```

## 🚀 Scripts Disponíveis

### Build

```bash
# Build para desenvolvimento (com source maps)
npm run build:dev

# Build para produção
npm run build:prod
```

### CDK - Comandos Principais

```bash
# Sintetizar o CloudFormation template
npm run cdk:synth

# Sintetizar para ambiente específico
npm run cdk:synth:dev
npm run cdk:synth:prd

# Deploy (faz build automaticamente)
npm run cdk:deploy:dev
npm run cdk:deploy:prd

# Ver diferenças com o stack atual
npm run cdk:diff:dev
npm run cdk:diff:prd

# Destruir o stack
npm run cdk:destroy:dev
npm run cdk:destroy:prd

# Bootstrap da conta AWS (executar apenas uma vez)
npm run cdk:bootstrap
```

## 🐛 Debug no VS Code

O projeto inclui várias configurações de debug:

### Debug das Lambdas Localmente

As Lambdas podem ser debugadas localmente usando um script customizado:

- **Debug Lambda: CreateUser** - Debug da criação de usuário
- **Debug Lambda: CreateAdmin** - Debug da criação de admin
- **Debug Lambda: VerifyEmail** - Debug da verificação de email
- **Debug Lambda: CreateProfile** - Debug da criação de perfil
- **Debug Lambda: SendPhoto** - Debug do envio de foto
- **Debug Lambda: Authenticate** - Debug da autenticação
- **Debug Lambda: ResetPassword** - Debug do reset de senha
- **Debug Lambda: ApproveUser** - Debug da aprovação de usuário

#### Executar Lambdas Localmente (sem debug)

```bash
# Testar funções localmente sem debug
npm run lambda:create-user
npm run lambda:create-admin
npm run lambda:verify-email
npm run lambda:create-profile
npm run lambda:send-photo
npm run lambda:authenticate
npm run lambda:reset-password
npm run lambda:approve-user

# Ou usar um payload customizado
npm run lambda:local caminho/para/seu/payload.json
```

#### Como Funciona

O projeto inclui um script `scripts/local-lambda.ts` que:
- Carrega o handler da Lambda compilado
- Lê o payload JSON fornecido
- Executa a Lambda localmente com um Context mockado
- Exibe o resultado com timing e logs

Os payloads estão em `.vscode/payloads/` e podem ser personalizados conforme necessário.

### Debug do CDK

1. **CDK: Debug Synth (dev)** - Debug do processo de síntese do stack (dev)
2. **CDK: Debug Synth (prd)** - Debug do processo de síntese do stack (prd)
3. **CDK: Synth Stack** - Executar synth com debug
4. **CDK: Deploy Stack (dev)** - Executar deploy com debug
5. **CDK: Diff Stack (dev)** - Ver diferenças com debug

## 📦 Recursos Criados pelo CDK

### Lambda Function

- **Nome**: `{stage}-ifkpass-api-{stage}-proxy`
- **Runtime**: Node.js 22.x
- **Timeout**: 900 segundos (15 minutos)
- **Memory**: 1024 MB

### IAM Role

Role de execução com permissões para:
- Step Functions
- CloudWatch Logs
- S3
- Rekognition
- Bedrock
- DynamoDB
- Textract
- SQS
- EventBridge
- Step Functions

### CloudWatch Log Group

- Retenção: 1 semana
- Nome: `/aws/lambda/{stage}-ifkpass-api-{stage}-proxy`

## 🔧 Variáveis de Ambiente

As variáveis de ambiente são configuradas no stack e podem ser sobrescritas usando arquivo `.env`:

```bash
# Variáveis principais
STAGE=dev
REGION=us-east-1
ACCOUNT_ID=972210179301
COGNITO_CLIENT_ID=xxxxx
COGNITO_CLIENT_SECRET=xxxxx
COGNITO_USER_POOL_ID=xxxxx
```

### Configurações por Ambiente

#### DEV
- `USERS_TABLE_NAME`: users-dev
- `PROFILE_BUCKET_NAME`: ifkpass-profile-photos-dev

#### HML
- `USERS_TABLE_NAME`: users-hml
- `PROFILE_BUCKET_NAME`: ifkpass-profile-photos-hml

#### PRD
- `USERS_TABLE_NAME`: users-prd
- `PROFILE_BUCKET_NAME`: ifkpass-profile-photos-prd

## 🔑 Primeiro Deploy

### 1. Bootstrap da Conta AWS

Execute apenas uma vez por conta/região:

```bash
npm run cdk:bootstrap
```

### 2. Build do Código

```bash
npm run build:prod
```

### 3. Deploy

```bash
# Para desenvolvimento
npm run cdk:deploy:dev

# Para produção
npm run cdk:deploy:prd
```

## 📊 Comparação: Serverless vs CDK

### Serverless Framework

```bash
# Deploy
serverless deploy --stage dev

# Remover
serverless remove --stage dev
```

### AWS CDK

```bash
# Deploy
npm run cdk:deploy:dev

# Remover
npm run cdk:destroy:dev
```

## 💡 Vantagens da Migração para CDK

1. **Type Safety**: TypeScript nativo para infraestrutura
2. **Melhor IDE Support**: Autocomplete e validação
3. **Mais Controle**: Acesso completo às APIs do CloudFormation
4. **Reutilização**: Criação de constructs personalizados
5. **Testing**: Facilidade para testar infraestrutura
6. **Integração AWS**: Suporte oficial da AWS
7. **Evolução**: Novas features da AWS disponíveis mais rapidamente

## 🔍 Dicas

### Ver o CloudFormation Template Gerado

```bash
npm run cdk:synth:dev
# O template estará em cdk.out/dev-ifkpass-api.template.json
```

### Ver Diferenças Antes do Deploy

```bash
npm run cdk:diff:dev
```

### Deploy com Confirmação Manual

```bash
cdk deploy --context stage=dev
# Remova --require-approval never para aprovar manualmente
```

### Debug de Problemas

1. Verifique o output do synth: `npm run cdk:synth:dev`
2. Use os debuggers do VS Code
3. Verifique logs do CloudFormation no console AWS

## 📚 Recursos Adicionais

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/v2/guide/home.html)
- [AWS CDK API Reference](https://docs.aws.amazon.com/cdk/api/v2/)
- [CDK Workshop](https://cdkworkshop.com/)
- [CDK Examples](https://github.com/aws-samples/aws-cdk-examples)

## 🤝 Suporte

Para questões sobre o CDK ou a migração, consulte:
- Documentação oficial do AWS CDK
- Issues no repositório
- Time de desenvolvimento

---

**Nota**: O código das Lambdas (`src/`) não foi alterado na migração. Apenas a camada de infraestrutura foi migrada para CDK.

