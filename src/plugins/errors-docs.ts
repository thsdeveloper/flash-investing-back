import fp from 'fastify-plugin';

export default fp(async function (fastify) {
  // Página de documentação de códigos de erro
  fastify.get('/errors', async (request, reply) => {
    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flash Investing API - Códigos de Erro</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        
        .header {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            padding: 2rem 0;
            color: white;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }
        
        .header p {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
            background: white;
            border-radius: 16px;
            margin-top: 2rem;
            margin-bottom: 2rem;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .toc {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .toc h2 {
            color: #495057;
            margin-bottom: 1rem;
            font-size: 1.3rem;
        }
        
        .toc ul {
            list-style: none;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 0.5rem;
        }
        
        .toc li a {
            color: #667eea;
            text-decoration: none;
            padding: 0.5rem;
            border-radius: 6px;
            display: block;
            transition: background-color 0.2s;
        }
        
        .toc li a:hover {
            background-color: #e9ecef;
        }
        
        .error-section {
            margin-bottom: 3rem;
        }
        
        .error-section h2 {
            color: #495057;
            border-bottom: 3px solid #667eea;
            padding-bottom: 0.5rem;
            margin-bottom: 1.5rem;
            font-size: 1.5rem;
        }
        
        .error-grid {
            display: grid;
            gap: 1rem;
        }
        
        .error-card {
            border: 1px solid #e9ecef;
            border-radius: 12px;
            padding: 1.5rem;
            background: #ffffff;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            transition: box-shadow 0.2s;
        }
        
        .error-card:hover {
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }
        
        .error-code {
            font-family: 'JetBrains Mono', 'Fira Code', monospace;
            background: #f8f9fa;
            color: #dc3545;
            padding: 0.25rem 0.5rem;
            border-radius: 6px;
            font-weight: 600;
            font-size: 0.9rem;
            display: inline-block;
            margin-bottom: 0.5rem;
        }
        
        .error-message {
            color: #495057;
            font-weight: 500;
            margin-bottom: 0.5rem;
        }
        
        .error-description {
            color: #6c757d;
            font-size: 0.9rem;
            line-height: 1.5;
        }
        
        .http-code {
            background: #667eea;
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 600;
            float: right;
        }
        
        .severity-critical { border-left: 4px solid #dc3545; }
        .severity-warning { border-left: 4px solid #ffc107; }
        .severity-info { border-left: 4px solid #17a2b8; }
        
        .footer {
            text-align: center;
            padding: 2rem;
            color: white;
            opacity: 0.8;
        }
        
        .footer a {
            color: rgba(255, 255, 255, 0.9);
            text-decoration: none;
        }
        
        .back-to-docs {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            padding: 0.75rem 1rem;
            border-radius: 25px;
            text-decoration: none;
            font-weight: 500;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            transition: all 0.2s;
        }
        
        .back-to-docs:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <a href="/" class="back-to-docs">← Voltar para Docs</a>
    
    <div class="header">
        <h1>📋 Códigos de Erro</h1>
        <p>Referência completa dos códigos de erro da Flash Investing API</p>
    </div>
    
    <div class="container">
        <div class="toc">
            <h2>📑 Índice</h2>
            <ul>
                <li><a href="#authentication">🔐 Autenticação</a></li>
                <li><a href="#users">👤 Usuários</a></li>
                <li><a href="#financial-accounts">🏦 Contas Financeiras</a></li>
                <li><a href="#transactions">💸 Transações</a></li>
                <li><a href="#credit-cards">💳 Cartões de Crédito</a></li>
                <li><a href="#debts">📋 Dívidas</a></li>
                <li><a href="#categories">📂 Categorias</a></li>
                <li><a href="#validation">✅ Validação</a></li>
                <li><a href="#system">⚙️ Sistema</a></li>
            </ul>
        </div>
        
        <div id="authentication" class="error-section">
            <h2>🔐 Erros de Autenticação</h2>
            <div class="error-grid">
                <div class="error-card severity-critical">
                    <div class="http-code">401</div>
                    <div class="error-code">UNAUTHORIZED</div>
                    <div class="error-message">Não autorizado</div>
                    <div class="error-description">
                        Token de acesso inválido, expirado ou não fornecido. Faça login novamente ou renove o token.
                    </div>
                </div>
                
                <div class="error-card severity-critical">
                    <div class="http-code">403</div>
                    <div class="error-code">FORBIDDEN</div>
                    <div class="error-message">Acesso negado</div>
                    <div class="error-description">
                        Usuário não tem permissão para acessar este recurso, mesmo com token válido.
                    </div>
                </div>
                
                <div class="error-card severity-warning">
                    <div class="http-code">429</div>
                    <div class="error-code">TOO_MANY_REQUESTS</div>
                    <div class="error-message">Muitas solicitações</div>
                    <div class="error-description">
                        Limite de taxa excedido. Aguarde alguns minutos antes de tentar novamente.
                    </div>
                </div>
            </div>
        </div>
        
        <div id="users" class="error-section">
            <h2>👤 Erros de Usuários</h2>
            <div class="error-grid">
                <div class="error-card severity-warning">
                    <div class="http-code">409</div>
                    <div class="error-code">USER_ALREADY_EXISTS</div>
                    <div class="error-message">Usuário já existe</div>
                    <div class="error-description">
                        Já existe um usuário cadastrado com este endereço de email.
                    </div>
                </div>
                
                <div class="error-card severity-info">
                    <div class="http-code">404</div>
                    <div class="error-code">USER_NOT_FOUND</div>
                    <div class="error-message">Usuário não encontrado</div>
                    <div class="error-description">
                        O usuário especificado não existe no sistema.
                    </div>
                </div>
                
                <div class="error-card severity-warning">
                    <div class="http-code">409</div>
                    <div class="error-code">USER_FINANCE_SETTINGS_ALREADY_EXISTS</div>
                    <div class="error-message">Configurações financeiras já existem</div>
                    <div class="error-description">
                        O usuário já possui configurações financeiras cadastradas.
                    </div>
                </div>
            </div>
        </div>
        
        <div id="financial-accounts" class="error-section">
            <h2>🏦 Erros de Contas Financeiras</h2>
            <div class="error-grid">
                <div class="error-card severity-info">
                    <div class="http-code">404</div>
                    <div class="error-code">FINANCIAL_ACCOUNT_NOT_FOUND</div>
                    <div class="error-message">Conta financeira não encontrada</div>
                    <div class="error-description">
                        A conta financeira especificada não existe ou não pertence ao usuário.
                    </div>
                </div>
                
                <div class="error-card severity-warning">
                    <div class="http-code">409</div>
                    <div class="error-code">FINANCIAL_ACCOUNT_ALREADY_EXISTS</div>
                    <div class="error-message">Conta financeira já existe</div>
                    <div class="error-description">
                        Já existe uma conta financeira com este nome para o usuário.
                    </div>
                </div>
            </div>
        </div>
        
        <div id="transactions" class="error-section">
            <h2>💸 Erros de Transações</h2>
            <div class="error-grid">
                <div class="error-card severity-info">
                    <div class="http-code">404</div>
                    <div class="error-code">TRANSACTION_NOT_FOUND</div>
                    <div class="error-message">Transação não encontrada</div>
                    <div class="error-description">
                        A transação especificada não existe ou não pertence ao usuário.
                    </div>
                </div>
                
                <div class="error-card severity-warning">
                    <div class="http-code">400</div>
                    <div class="error-code">INVALID_TRANSACTION_AMOUNT</div>
                    <div class="error-message">Valor da transação inválido</div>
                    <div class="error-description">
                        O valor da transação deve ser maior que zero.
                    </div>
                </div>
                
                <div class="error-card severity-warning">
                    <div class="http-code">400</div>
                    <div class="error-code">INVALID_TRANSACTION_TYPE</div>
                    <div class="error-message">Tipo de transação inválido</div>
                    <div class="error-description">
                        O tipo de transação especificado não é válido (deve ser RECEITA ou DESPESA).
                    </div>
                </div>
                
                <div class="error-card severity-warning">
                    <div class="http-code">409</div>
                    <div class="error-code">TRANSACTION_ALREADY_COMPLETED</div>
                    <div class="error-message">Transação já concluída</div>
                    <div class="error-description">
                        A transação já foi marcada como concluída e não pode ser alterada.
                    </div>
                </div>
                
                <div class="error-card severity-critical">
                    <div class="http-code">400</div>
                    <div class="error-code">TRANSACTION_CREATION_ERROR</div>
                    <div class="error-message">Erro na criação da transação</div>
                    <div class="error-description">
                        Erro genérico durante a criação da transação. Verifique os dados enviados.
                    </div>
                </div>
                
                <div class="error-card severity-critical">
                    <div class="http-code">400</div>
                    <div class="error-code">TRANSACTION_UPDATE_ERROR</div>
                    <div class="error-message">Erro na atualização da transação</div>
                    <div class="error-description">
                        Erro genérico durante a atualização da transação. Verifique os dados enviados.
                    </div>
                </div>
            </div>
        </div>
        
        <div id="credit-cards" class="error-section">
            <h2>💳 Erros de Cartões de Crédito</h2>
            <div class="error-grid">
                <div class="error-card severity-info">
                    <div class="http-code">404</div>
                    <div class="error-code">CREDIT_CARD_NOT_FOUND</div>
                    <div class="error-message">Cartão de crédito não encontrado</div>
                    <div class="error-description">
                        O cartão de crédito especificado não existe ou não pertence ao usuário.
                    </div>
                </div>
                
                <div class="error-card severity-info">
                    <div class="http-code">404</div>
                    <div class="error-code">CREDIT_CARD_TRANSACTION_NOT_FOUND</div>
                    <div class="error-message">Transação de cartão não encontrada</div>
                    <div class="error-description">
                        A transação de cartão de crédito especificada não existe ou não pertence ao usuário.
                    </div>
                </div>
                
                <div class="error-card severity-critical">
                    <div class="http-code">400</div>
                    <div class="error-code">CREDIT_CARD_CREATION_ERROR</div>
                    <div class="error-message">Erro na criação do cartão</div>
                    <div class="error-description">
                        Erro genérico durante a criação do cartão de crédito. Verifique os dados enviados.
                    </div>
                </div>
            </div>
        </div>
        
        <div id="debts" class="error-section">
            <h2>📋 Erros de Dívidas</h2>
            <div class="error-grid">
                <div class="error-card severity-info">
                    <div class="http-code">404</div>
                    <div class="error-code">DEBT_NOT_FOUND</div>
                    <div class="error-message">Dívida não encontrada</div>
                    <div class="error-description">
                        A dívida especificada não existe ou não pertence ao usuário.
                    </div>
                </div>
                
                <div class="error-card severity-info">
                    <div class="http-code">404</div>
                    <div class="error-code">DEBT_PAYMENT_NOT_FOUND</div>
                    <div class="error-message">Pagamento de dívida não encontrado</div>
                    <div class="error-description">
                        O pagamento de dívida especificado não existe.
                    </div>
                </div>
                
                <div class="error-card severity-info">
                    <div class="http-code">404</div>
                    <div class="error-code">DEBT_NEGOTIATION_NOT_FOUND</div>
                    <div class="error-message">Negociação de dívida não encontrada</div>
                    <div class="error-description">
                        A negociação de dívida especificada não existe.
                    </div>
                </div>
                
                <div class="error-card severity-warning">
                    <div class="http-code">409</div>
                    <div class="error-code">DEBT_ALREADY_PAID</div>
                    <div class="error-message">Dívida já quitada</div>
                    <div class="error-description">
                        A dívida já foi completamente quitada e não pode ser alterada.
                    </div>
                </div>
            </div>
        </div>
        
        <div id="categories" class="error-section">
            <h2>📂 Erros de Categorias</h2>
            <div class="error-grid">
                <div class="error-card severity-info">
                    <div class="http-code">404</div>
                    <div class="error-code">FINANCIAL_CATEGORY_NOT_FOUND</div>
                    <div class="error-message">Categoria financeira não encontrada</div>
                    <div class="error-description">
                        A categoria financeira especificada não existe ou não pertence ao usuário.
                    </div>
                </div>
            </div>
        </div>
        
        <div id="validation" class="error-section">
            <h2>✅ Erros de Validação</h2>
            <div class="error-grid">
                <div class="error-card severity-warning">
                    <div class="http-code">400</div>
                    <div class="error-code">VALIDATION_ERROR</div>
                    <div class="error-message">Erro de validação</div>
                    <div class="error-description">
                        Os dados enviados não passaram na validação. Verifique os campos obrigatórios e formatos.
                    </div>
                </div>
                
                <div class="error-card severity-warning">
                    <div class="http-code">400</div>
                    <div class="error-code">REQUIRED_FIELD_ERROR</div>
                    <div class="error-message">Campo obrigatório</div>
                    <div class="error-description">
                        Um ou mais campos obrigatórios não foram fornecidos na requisição.
                    </div>
                </div>
                
                <div class="error-card severity-warning">
                    <div class="http-code">413</div>
                    <div class="error-code">PAYLOAD_TOO_LARGE</div>
                    <div class="error-message">Payload muito grande</div>
                    <div class="error-description">
                        O tamanho da requisição excede o limite permitido.
                    </div>
                </div>
            </div>
        </div>
        
        <div id="system" class="error-section">
            <h2>⚙️ Erros de Sistema</h2>
            <div class="error-grid">
                <div class="error-card severity-critical">
                    <div class="http-code">500</div>
                    <div class="error-code">INTERNAL_SERVER_ERROR</div>
                    <div class="error-message">Erro interno do servidor</div>
                    <div class="error-description">
                        Erro inesperado no servidor. Tente novamente em alguns minutos ou contate o suporte.
                    </div>
                </div>
                
                <div class="error-card severity-warning">
                    <div class="http-code">400</div>
                    <div class="error-code">CLIENT_ERROR</div>
                    <div class="error-message">Erro do cliente</div>
                    <div class="error-description">
                        Erro genérico da requisição do cliente. Verifique os dados enviados.
                    </div>
                </div>
                
                <div class="error-card severity-critical">
                    <div class="http-code">400</div>
                    <div class="error-code">DOMAIN_ERROR</div>
                    <div class="error-message">Erro de domínio</div>
                    <div class="error-description">
                        Erro relacionado às regras de negócio da aplicação. Verifique se a operação é válida.
                    </div>
                </div>
            </div>
        </div>
        
        <div class="error-section">
            <h2>📖 Como Interpretar os Erros</h2>
            <div class="error-card">
                <h3>Estrutura de Resposta de Erro</h3>
                <pre style="background: #f8f9fa; padding: 1rem; border-radius: 8px; overflow-x: auto;"><code>{
  "success": false,
  "data": null,
  "message": "Mensagem de erro em português",
  "errors": ["CODIGO_DO_ERRO"],
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "version": "1.0.0"
  }
}</code></pre>
                
                <h3 style="margin-top: 1.5rem;">Códigos HTTP</h3>
                <ul style="margin-top: 0.5rem; padding-left: 1.5rem;">
                    <li><strong>400</strong> - Erro na requisição (dados inválidos)</li>
                    <li><strong>401</strong> - Não autorizado (token inválido/ausente)</li>
                    <li><strong>403</strong> - Acesso negado (sem permissão)</li>
                    <li><strong>404</strong> - Recurso não encontrado</li>
                    <li><strong>409</strong> - Conflito (recurso já existe)</li>
                    <li><strong>413</strong> - Payload muito grande</li>
                    <li><strong>422</strong> - Erro de validação</li>
                    <li><strong>429</strong> - Muitas requisições</li>
                    <li><strong>500</strong> - Erro interno do servidor</li>
                </ul>
            </div>
        </div>
    </div>
    
    <div class="footer">
        <p>
            <a href="/">← Voltar para Documentação</a> | 
            <a href="/documentation">Interface Swagger</a> | 
            <a href="/scalar">Docs Scalar</a>
        </p>
        <p style="margin-top: 0.5rem; font-size: 0.9rem;">
            Flash Investing API v1.0.0 - Documentação de Códigos de Erro
        </p>
    </div>
</body>
</html>
    `;
    
    reply.type('text/html');
    return html;
  });

  // Endpoint JSON com códigos de erro para consumo programático
  fastify.get('/errors.json', async (request, reply) => {
    const errorCodes = {
      "authentication": {
        "UNAUTHORIZED": {
          "httpCode": 401,
          "message": "Não autorizado",
          "description": "Token de acesso inválido, expirado ou não fornecido. Faça login novamente ou renove o token."
        },
        "FORBIDDEN": {
          "httpCode": 403,
          "message": "Acesso negado",
          "description": "Usuário não tem permissão para acessar este recurso, mesmo com token válido."
        },
        "TOO_MANY_REQUESTS": {
          "httpCode": 429,
          "message": "Muitas solicitações",
          "description": "Limite de taxa excedido. Aguarde alguns minutos antes de tentar novamente."
        }
      },
      "users": {
        "USER_ALREADY_EXISTS": {
          "httpCode": 409,
          "message": "Usuário já existe",
          "description": "Já existe um usuário cadastrado com este endereço de email."
        },
        "USER_NOT_FOUND": {
          "httpCode": 404,
          "message": "Usuário não encontrado",
          "description": "O usuário especificado não existe no sistema."
        },
        "USER_FINANCE_SETTINGS_ALREADY_EXISTS": {
          "httpCode": 409,
          "message": "Configurações financeiras já existem",
          "description": "O usuário já possui configurações financeiras cadastradas."
        }
      },
      "financial_accounts": {
        "FINANCIAL_ACCOUNT_NOT_FOUND": {
          "httpCode": 404,
          "message": "Conta financeira não encontrada",
          "description": "A conta financeira especificada não existe ou não pertence ao usuário."
        },
        "FINANCIAL_ACCOUNT_ALREADY_EXISTS": {
          "httpCode": 409,
          "message": "Conta financeira já existe",
          "description": "Já existe uma conta financeira com este nome para o usuário."
        }
      },
      "transactions": {
        "TRANSACTION_NOT_FOUND": {
          "httpCode": 404,
          "message": "Transação não encontrada",
          "description": "A transação especificada não existe ou não pertence ao usuário."
        },
        "INVALID_TRANSACTION_AMOUNT": {
          "httpCode": 400,
          "message": "Valor da transação inválido",
          "description": "O valor da transação deve ser maior que zero."
        },
        "INVALID_TRANSACTION_TYPE": {
          "httpCode": 400,
          "message": "Tipo de transação inválido",
          "description": "O tipo de transação especificado não é válido (deve ser RECEITA ou DESPESA)."
        },
        "TRANSACTION_ALREADY_COMPLETED": {
          "httpCode": 409,
          "message": "Transação já concluída",
          "description": "A transação já foi marcada como concluída e não pode ser alterada."
        },
        "TRANSACTION_CREATION_ERROR": {
          "httpCode": 400,
          "message": "Erro na criação da transação",
          "description": "Erro genérico durante a criação da transação. Verifique os dados enviados."
        },
        "TRANSACTION_UPDATE_ERROR": {
          "httpCode": 400,
          "message": "Erro na atualização da transação",
          "description": "Erro genérico durante a atualização da transação. Verifique os dados enviados."
        }
      },
      "credit_cards": {
        "CREDIT_CARD_NOT_FOUND": {
          "httpCode": 404,
          "message": "Cartão de crédito não encontrado",
          "description": "O cartão de crédito especificado não existe ou não pertence ao usuário."
        },
        "CREDIT_CARD_TRANSACTION_NOT_FOUND": {
          "httpCode": 404,
          "message": "Transação de cartão não encontrada",
          "description": "A transação de cartão de crédito especificada não existe ou não pertence ao usuário."
        },
        "CREDIT_CARD_CREATION_ERROR": {
          "httpCode": 400,
          "message": "Erro na criação do cartão",
          "description": "Erro genérico durante a criação do cartão de crédito. Verifique os dados enviados."
        }
      },
      "debts": {
        "DEBT_NOT_FOUND": {
          "httpCode": 404,
          "message": "Dívida não encontrada",
          "description": "A dívida especificada não existe ou não pertence ao usuário."
        },
        "DEBT_PAYMENT_NOT_FOUND": {
          "httpCode": 404,
          "message": "Pagamento de dívida não encontrado",
          "description": "O pagamento de dívida especificado não existe."
        },
        "DEBT_NEGOTIATION_NOT_FOUND": {
          "httpCode": 404,
          "message": "Negociação de dívida não encontrada",
          "description": "A negociação de dívida especificada não existe."
        },
        "DEBT_ALREADY_PAID": {
          "httpCode": 409,
          "message": "Dívida já quitada",
          "description": "A dívida já foi completamente quitada e não pode ser alterada."
        }
      },
      "categories": {
        "FINANCIAL_CATEGORY_NOT_FOUND": {
          "httpCode": 404,
          "message": "Categoria financeira não encontrada",
          "description": "A categoria financeira especificada não existe ou não pertence ao usuário."
        }
      },
      "validation": {
        "VALIDATION_ERROR": {
          "httpCode": 400,
          "message": "Erro de validação",
          "description": "Os dados enviados não passaram na validação. Verifique os campos obrigatórios e formatos."
        },
        "REQUIRED_FIELD_ERROR": {
          "httpCode": 400,
          "message": "Campo obrigatório",
          "description": "Um ou mais campos obrigatórios não foram fornecidos na requisição."
        },
        "PAYLOAD_TOO_LARGE": {
          "httpCode": 413,
          "message": "Payload muito grande",
          "description": "O tamanho da requisição excede o limite permitido."
        }
      },
      "system": {
        "INTERNAL_SERVER_ERROR": {
          "httpCode": 500,
          "message": "Erro interno do servidor",
          "description": "Erro inesperado no servidor. Tente novamente em alguns minutos ou contate o suporte."
        },
        "CLIENT_ERROR": {
          "httpCode": 400,
          "message": "Erro do cliente",
          "description": "Erro genérico da requisição do cliente. Verifique os dados enviados."
        },
        "DOMAIN_ERROR": {
          "httpCode": 400,
          "message": "Erro de domínio",
          "description": "Erro relacionado às regras de negócio da aplicação. Verifique se a operação é válida."
        }
      }
    };

    reply.type('application/json');
    return {
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      total_errors: Object.values(errorCodes).reduce((total, category) => total + Object.keys(category).length, 0),
      categories: Object.keys(errorCodes).length,
      errors: errorCodes
    };
  });

}, {  
  name: 'errors-docs-plugin'
});