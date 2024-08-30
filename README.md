# API de Gerenciamento de Consumo de Água e Gás

Este projeto é um serviço back-end responsável por gerenciar a leitura individualizada de consumo de água e gás. O serviço utiliza Inteligência Artificial (IA) para obter a medição através da análise de imagens dos medidores.

## Funcionalidades

A API oferece os seguintes endpoints:

### 1. POST /add_customer

Este endpoint é responsável por receber um nome de um cliente e adicionar um novo cliente com esse nome no banco de dados.

**Request Body:**

```json
{
  "name": "string"
}
```

**Response Body**

| Status Code | Descrição                      | Resposta                                                                    |
| ----------- | ------------------------------ | --------------------------------------------------------------------------- |
| 200         | Operação realizada com sucesso | `json { "success": true, "customer_code": uuid, "customer_name": string } ` |

### 2. POST /upload

Este endpoint é responsável por receber uma imagem em base64, consultar o Google Gemini (LLM) e retornar a medida lida pela API.

**Requisitos**:

- Validar o tipo de dados dos parâmetros enviados (inclusive o base64).
- Verificar se já existe uma leitura no mês para o tipo de leitura especificado.
- Integrar com uma API de LLM para extrair o valor da imagem.

**Request Body**:

```json
{
  "image": "base64",
  "customer_code": "string",
  "measure_datetime": "datetime",
  "measure_type": "WATER" ou "GAS"
}
```

**Response Body:**

| Status Code | Descrição                      | Resposta                                                                                      |
| ----------- | ------------------------------ | --------------------------------------------------------------------------------------------- |
| 200         | Operação realizada com sucesso | `json { "image_url": "string", "measure_value": integer, "measure_uuid": "string" } `         |
| 400         | Dados inválidos                | `json { "error_code": "INVALID_DATA", "error_description": "<descrição do erro>" } `          |
| 409         | Leitura do mês já realizada    | `json { "error_code": "DOUBLE_REPORT", "error_description": "Leitura do mês já realizada" } ` |

**Documentação técnicca do Google Gemnini (LLM)**

https://ai.google.dev/gemini-api/docs/api-key
https://ai.google.dev/gemini-api/docs/vision

**ATENÇÃO:** Você precisará obter uma chave de acesso para usar a funcionalidade. Ela é
gratuita. Não realize despesas financeiras para realizar esse teste.

### 3. PATCH /confirm

Responsável por confirmar ou corrigir o valor lido pelo LLM,

Esse endpoint deve:

• Validar o tipo de dados dos parâmetros enviados
• Verificar se o código de leitura informado existe
• Verificar se o código de leitura já foi confirmado
• Salvar no banco de dados o novo valor informado

Ele **NÃO** deve fazer:

• Fazer novas consultas ao LLM para validar o novo resultado recebido
Ela irá retornar:
• Resposta de OK ou ERRO dependendo do valor informado.

**Request Body**
{
"measure_uuid": "string",
"confirmed_value": integer
}

**Response Body:**

| Status Code | Descrição                      | Resposta                                                                                         |
| ----------- | ------------------------------ | ------------------------------------------------------------------------------------------------ |
| 200         | Operação realizada com sucesso | `json { "success": true } `                                                                      |
| 400         | Dados inválidos                | `json { "error_code": "INVALID_DATA", "error_description": "<descrição do erro>" } `             |
| 404         | Leitura não encontrada         | `json { "error_code": "MEASURE_NOT_FOUND", "error_description": "Leitura não encontrada" } `     |
| 409         | Leitura já confirmada          | `json { "error_code": "CONFIRMATION_DUPLICATE", "error_description": "Leitura já confirmada" } ` |

### 4. GET /<customer_code>/list

Responsável por listar as medidas realizadas por um determinado cliente

Esse endpoint deve:

• Receber o código do cliente e filtrar as medidas realizadas por ele

• Ele opcionalmente pode receber um query parameter “measure_type”, que
deve ser “WATER” ou “GAS”

▪ A validação deve ser CASE INSENSITIVE

▪ Se o parâmetro for informado, filtrar apenas os valores do tipo
especificado. Senão, retornar todos os tipos.

Ex. {base url}/<customer code>/list?measure_type=WATER

Ela irá retornar:

• Uma lista com todas as leituras realizadas.

**Response Body:**

| Status Code | Descrição                      | Resposta                                                                                                                                                                                                |
| ----------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 200         | Operação realizada com sucesso | `json { "customer_code": "string", "measures": [ { "measure_uuid": "string", "measure_datetime": "datetime", "measure_type": "string", "has_confirmed": boolean, "image_url": "string" }, { ... } ] } ` |
| 400         | Tipo de medição inválido       | `json { "error_code": "INVALID_TYPE", "error_description": "Tipo de medição não permitida" } `                                                                                                          |
| 404         | Nenhum registro encontrado     | `json { "error_code": "MEASURES_NOT_FOUND", "error_description": "Nenhuma leitura encontrada" } `                                                                                                       |

## Como executar o projeto

**1. Clone o repositório:**

git clone https://github.com/LuizGonzaga-dev/teste_shopper_server.git

**2. Tenha o Docker e rode o seguinte comando na raiz do projeto:**

docker-compose up --build
