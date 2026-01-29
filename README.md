<div align="center">

# IFK Pass – Backend

API serverless construída em Node.js/TypeScript para gerenciar cadastros, autenticação e administração de praticantes do IFK. A aplicação roda em AWS Lambda, utiliza Amazon Cognito para identidade, DynamoDB como banco de dados e integrações adicionais com S3 e Resend para fluxo completo de registro e aprovação de usuários.

</div>

---

## Visão Geral

- **Domínio principal:** cadastro de usuários, upload de foto de perfil, autenticação (token JWT Cognito) e aprovação manual por administradores.
- **Fluxos suportados:**
  - Criação de usuário ou administrador (`isAdmin` na requisição).
  - Verificação de e-mail via Cognito.
  - Autenticação com JWT.
  - Criação/atualização de perfil com dados pessoais e upload de foto (pré-assinado no S3).
  - Aprovação/recusa de usuários por membros do grupo `COGNITO_ADMINS_GROUP_NAME`.
- **Padrões adotados:** Clean Architecture nos casos de uso, repositórios separados por camada (`core`, `infra`), tipagem forte com Zod para validação de payloads e Pino para observabilidade.

## Arquitetura e Stack

| Camada | Descrição |
| ------ | --------- |
| **Runtime** | Node.js ≥ 22 + TypeScript, empacotado com `tsup` |
| **Infraestrutura** | AWS Lambda + API Gateway, DynamoDB, Cognito, S3, SES/Resend |
| **Provisionamento** | AWS CDK (`lib/`) e Terraform (`terraform/`) para ambientes distintos |
| **Testes** | Vitest |
| **Lint/Qualidade** | ESLint + Prettier |

Estrutura principal de diretórios:

```
src/
 ├─ core/          # Casos de uso, entidades e contratos de domínio
 ├─ infra/         # Adapters concretos (AWS, HTTP handlers, banco, etc.)
 └─ shared/        # Utilitários, logging, config, tipos compartilhados
terraform/         # Módulos Terraform por ambiente (ex.: dev/)
lib/               # Stacks CDK (opcional, conforme estratégia de deploy)
```

## Pré-requisitos

- Node.js **22** ou superior e npm **10** ou superior.
- Credenciais AWS configuradas localmente com permissões para Cognito, DynamoDB, S3 e CDK/Terraform (ex.: `aws configure`).
- Terraform ≥ 1.6 (para os módulos em `terraform/`).
- AWS CDK ≥ 2.103 (instalada globalmente ou via `npx`).

## Configuração Inicial

1. **Instalar dependências**

   ```bash
   npm install
   ```

2. **Variáveis de ambiente**

   - Copie `env.template` para `.env` e preencha os valores reais (IDs do Cognito, segredos, chave da Resend, etc.).
   - Algumas variáveis (nomes de tabela/bucket) são derivadas automaticamente do `STAGE`.

3. **Provisionamento da infraestrutura (opcional)**

   Você pode usar Terraform ou CDK – escolha **um** dos caminhos:

   - **Terraform**

     ```bash
     cd terraform/dev
     terraform init
     terraform apply
     ```

   - **CDK**

     ```bash
     npm run cdk:bootstrap             # apenas na primeira vez
     npm run cdk:deploy:dev            # compila e faz deploy do ambiente dev
     ```

   > Ajuste os contextos/variáveis de acordo com o ambiente desejado (`dev`, `prd`, etc.).

## Scripts Úteis

| Comando | Descrição |
| ------- | --------- |
| `npm run build:dev` | Build rápido com `tsup` (watch-friendly). |
| `npm run build:prod` | Build otimizado para deploy. |
| `npm run lint` | Executa ESLint (com auto-fix). |
| `npm test` | Roda a suíte de testes com Vitest. |
| `npm run lambda:local <payload>` | Executa a Lambda HTTP localmente via `scripts/local-lambda.ts`. Há payloads de exemplo em `.vscode/payloads/`. Exemplos úteis:<br>`npm run lambda:create-user`<br>`npm run lambda:authenticate`<br>`npm run lambda:approve-user` |
| `npm run cdk:deploy:dev` | Faz deploy do stack (precisa de build prévio). |
| `npm run cdk:destroy:dev` | Remove os recursos do stack dev. |

## Handlers HTTP Disponíveis

Todos os handlers ficam em `src/infra/http/handlers` e são roteados por `proxy/index.ts`:

| Método & Caminho | Handler | Descrição |
| ---------------- | ------- | --------- |
| `POST /user` | `create-user` | Cria usuário/administrador (`isAdmin` para promover no Cognito). |
| `POST /user/verify-email` | `verify-email` | Confirma o e-mail no Cognito. |
| `POST /user/auth` | `authenticate` | Autenticação, devolve JWT Cognito. |
| `POST /user/profile` | `create-profile` | Criação/atualização de perfil (dados pessoais). |
| `POST /user/profile/photo` | `send-photo` | Retorna URL pré-assinada do S3 para upload. |
| `POST /user/forgot-password` / `/reset-password` | `forgot-password` / `reset-password` | Fluxo de redefinição de senha (caso utilize). |
| `POST /user/pay-card` | `pay-card` | Gera preferência de pagamento no Mercado Pago e confirma o status da anuidade. |
| `POST /mercado-pago/webhook` | `mercado-pago/webhook` | Endpoint para receber as notificações de pagamento do Mercado Pago e atualizar `alreadyPaid`. |
| `POST /admin/approve-user` | `approve-user` | Aprova/Rejeita usuários (requer grupo Cognito de admins). |

Os handlers aplicam validações com Zod e convertem exceções de domínio para respostas HTTP consistentes usando o módulo de erros (`src/shared/types/errors/http-errors.ts`).

## Guia para o Front-end

### Base URL e Autenticação

- **Base URL**: `https://mh8vkh13sb.execute-api.us-east-1.amazonaws.com/dev`
  - Ajuste o stage (`/dev`) conforme ambiente (`/prd`, `/hml` etc.).
- **Autenticação**: use JWT do Cognito no header `Authorization: Bearer <token>` para rotas autenticadas.
- Todos os endpoints retornam JSON; envie payloads com `Content-Type: application/json`.

### 1. Cadastro de usuário / admin – `POST /user`

- **Request Body**
  ```json
  {
    "props": {
      "name": "John",
      "lastName": "Doe",
      "email": "john@ifk.com",
      "password": "Senha@123",
      "isAdmin": false
    }
  }
  ```
- `isAdmin` é opcional (default: `false`). Quando `true`, o Cognito confirma e coloca o usuário no grupo de admins.
- **Responses**
  - `201 Created`: `{ "message": "Created" }`
  - `409 Conflict`: usuário já existente.

### 2. Verificar e-mail – `POST /user/verify-email`

- **Request Body**
  ```json
  {
    "email": "john@ifk.com",
    "code": "123456"
  }
  ```
- **Responses**: `200 OK` com `{ "message": "Email verified" }` ou erro se o código estiver incorreto.

### 3. Autenticar – `POST /user/auth`

- **Request Body**
  ```json
  {
    "email": "john@ifk.com",
    "password": "Senha@123"
  }
  ```
- **Responses**
  - `201 Created`: `{ "statusCode": 200, "token": "<JWT Cognito>" }`
  - `403 Forbidden`: usuário pendente / rejeitado.
  - `404 Not Found`: usuário inexistente.

### 4. Redefinição de senha

- **Iniciar** – `POST /user/forgot-password`
  ```json
  { "email": "john@ifk.com" }
  ```
- **Confirmar** – `POST /user/reset-password`
  ```json
  {
    "email": "john@ifk.com",
    "code": "123456",
    "newPassword": "NovaSenha@321"
  }
  ```

### 5. Perfil do usuário – `POST /user/profile`

- **Requer token**.
- **Request Body (exemplo)**
  ```json
  {
    "birthDate": "1990-01-01",
    "city": "São Paulo",
    "cpf": "12345678900",
    "dojo": "Dojo Central",
    "rank": "Preta",
    "sensei": "Tanaka",
    "photoUrl": "https://.../profile-photo.jpg"
  }
  ```
- `rank` deve ser uma cor válida do enum (`Branca`, `Amarela`, `Laranja`, `Verde`, `Azul`, `Marrom`, `Preta`, `Vermelha`).
- **Responses**: `201 Created` ou `401 Unauthorized` se o token for inválido/expirado.

### 6. Upload de foto – `POST /user/profile/photo`

- **Requer token**.
- Retorna `{ "photoUrl": "https://...", "uploadUrl": "https://s3..." }` para o front subir a imagem (PUT) em S3.

### 7. Pagamento da anuidade – `POST /user/pay-card`

- **Requer token** e utiliza Mercado Pago Checkout Pro.
- **Criar preferência** (sem `paymentStatus`):
  ```json
  { "action": "create" }
  ```
  - Response inclui `amount`, `currency`, `preferenceId`, `initPoint`, `paymentDetails` e se há desconto (`discountApplied`).
  - O valor depende da faixa (`colored` x `Preta`) e da data (desconto até 08/03/2025).
- **Confirmar status** (webhook ou callback manual):
  ```json
  {
    "action": "confirm",
    "paymentStatus": "approved",
    "paymentId": "123456789"
  }
  ```
  - Atualiza `paymentDetails` e `alreadyPaid` do usuário.
  - `paymentStatus` aceita `approved`, `pending`, `rejected`.

### 8. Webhook Mercado Pago – `POST /mercado-pago/webhook`

- Endpoint público configurado como `notification_url` no Mercado Pago.
- Recebe o `paymentId` (via query/body), consulta o status e chama internamente o caso de uso para confirmar pagamento.
- Não requer token (calls vindas do Mercado Pago), mas recomenda-se validar assinatura se disponível.

### 9. Aprovar/Rejeitar usuário – `POST /admin/approve-user`

- **Requer token de admin** (verificação via grupos Cognito).
- **Request Body**
  ```json
  {
    "Id": "UUID-do-usuario",
    "status": "approved"
  }
  ```
- `status`: `approved` ou `rejected` (o use case converte para enum interno).
- **Responses**: `200 OK` com mensagem ou `403` se o token não pertencer a um admin.

### 10. Headers importantes

- `Authorization`: Bearer `<JWT Cognito>` (para rotas autenticadas `/user/*` e `/admin/*`).
- `Content-Type`: `application/json` em todas as requisições.
- Os handlers retornam sempre JSON; trate erros inspecionando `statusCode` e `body`.

### 11. Estrutura de erros

- Exceções do domínio são convertidas em HTTP errors com o formato:
  ```json
  {
    "statusCode": 400,
    "message": "Validation error",
    "errors": { "email": ["E-mail inválido"] }
  }
  ```
- Tokens expirados retornam `401` com mensagem `Token expirado. Faça login novamente para continuar.`

### 12. Fluxo completo sugerido

1. `POST /user` → criar usuário/admin.
2. `POST /user/verify-email` → confirmar e-mail.
3. `POST /user/auth` → receber JWT.
4. `POST /user/profile` / `POST /user/profile/photo` → completar cadastro.
5. `POST /user/pay-card` → gerar checkout; depois o webhook confirmará o pagamento e atualizará `paymentDetails`.
6. Admin pode usar `POST /admin/approve-user` após verificar documentação do aluno.

Se restar dúvida sobre algum payload, consulte os exemplos em `.vscode/payloads` ou os schemas Zod em `src/infra/http/handlers/*/validate`.

## Fluxos-chave

1. **Cadastro de usuário/admin**
   - Criado via `POST /user`.
   - Se `isAdmin = true`, o Cognito confirma e adiciona ao grupo de admin automaticamente.

2. **Autenticação**
   - `POST /user/auth` valida status do usuário (pendente/aprovado/rejeitado) antes de chamar o Cognito (`signIn`).
   - O token é validado por `verifyToken`, que também checa o grupo configurado em `COGNITO_ADMINS_GROUP_NAME`.

3. **Aprovação de usuário**
   - Handler `approve-user` exige que o token pertença ao grupo de admins no Cognito e sincroniza o status no DynamoDB.

4. **Perfil e foto**
   - Salvamento de dados complementares e upload de foto via URL pré-assinada (`AwsS3` adapter).

5. **Pagamento da anuidade**
   - `POST /user/pay-card` calcula o valor conforme faixa/coroné e data de desconto (08/03/2025) e gera uma preferência de checkout Pro no Mercado Pago.
   - Após a confirmação (`action: "confirm"`), o campo `alreadyPaid` do usuário é atualizado, e o status pode ser consultado antes da emissão do cartão.

## Desenvolvimento Local

- Use `npm run lambda:<handler>` com os payloads de exemplo em `.vscode/payloads/` para testar cada fluxo chamando a Lambda local.
- O logger (`src/shared/lib/logger/logger.ts`) sanitiza campos sensíveis (senhas) antes de registrar request/response.
- Para debugar tokens, utilize o `verifyToken` que consulta o JWKS do Cognito e preenche `Id`, `email` e `isAdmin`.

## Boas Práticas e Convenções

- Mantenha entidades e casos de uso isolados em `src/core`.
- Toda integração externa deve estar em `src/infra` (ex.: Dynamo, Cognito, S3).
- Payloads de entrada devem ter schema Zod correspondente na camada HTTP.
- Ao criar novos handlers, lembre-se de adicioná-los à tabela de rotas em `proxy/index.ts`.
- Rode `npm run lint` e `npm test` antes de abrir PRs.

## Próximos Passos / Ideias

- Migrar autenticação para fluxo passwordless (código por e-mail) caso desejado.
- Cobrir casos de uso críticos com testes unitários (Vitest) e testes de integração (ex.: usando `aws-sdk-client-mock`).
- Configurar CI (GitHub Actions) para lint/test/build automática.
- Versionar documentação de API (OpenAPI/Swagger) a partir dos handlers atuais.

---

Feito com 💙 pelo time IFK Pass. Dúvidas ou sugestões? Abra uma issue ou contribua com um PR!

