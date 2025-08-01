import fp from 'fastify-plugin';

export default fp(async function (fastify) {
  // Rota principal de documentação - mostra ambas as opções de documentação
  fastify.get('/', async (request, reply) => {
    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flash Investing API - Documentação</title>
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
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        
        .container {
            text-align: center;
            padding: 2rem;
            max-width: 800px;
        }
        
        .logo {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            background: linear-gradient(45deg, #fff, #f0f0f0);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .subtitle {
            font-size: 1.2rem;
            margin-bottom: 3rem;
            opacity: 0.9;
        }
        
        .docs-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
        }
        
        .doc-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            padding: 2rem;
            text-decoration: none;
            color: white;
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .doc-card:hover {
            transform: translateY(-5px);
            background: rgba(255, 255, 255, 0.15);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }
        
        .doc-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        
        .doc-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }
        
        .doc-description {
            opacity: 0.8;
            line-height: 1.5;
        }
        
        .features {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            padding: 2rem;
            margin-top: 2rem;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .features h3 {
            margin-bottom: 1rem;
            font-size: 1.3rem;
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            text-align: left;
        }
        
        .feature {
            opacity: 0.9;
            font-size: 0.9rem;
        }
        
        .status {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 255, 0, 0.2);
            color: #00ff88;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.8rem;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(0, 255, 0, 0.3);
        }
    </style>
</head>
<body>
    <div class="status">🟢 API Online</div>
    
    <div class="container">
        <div class="logo">⚡ Flash Investing API</div>
        <div class="subtitle">Documentação Profissional da API - Escolha sua interface preferida</div>
        
        <div class="docs-grid">
            <a href="/scalar" class="doc-card">
                <div class="doc-icon">🚀</div>
                <div class="doc-title">Documentação Scalar</div>
                <div class="doc-description">
                    Documentação de API moderna e bonita com testes interativos, 
                    tema escuro e experiência de usuário aprimorada. Recomendado para desenvolvedores.
                </div>
            </a>
            
            <a href="/documentation" class="doc-card">
                <div class="doc-icon">📖</div>
                <div class="doc-title">Interface Swagger</div>
                <div class="doc-description">
                    Interface clássica do Swagger UI com exploração abrangente da API,
                    validação de esquemas e confiabilidade testada e aprovada.
                </div>
            </a>
            
            <a href="/errors" class="doc-card">
                <div class="doc-icon">🚨</div>
                <div class="doc-title">Códigos de Erro</div>
                <div class="doc-description">
                    Referência completa de todos os códigos de erro da API com 
                    descrições detalhadas e códigos HTTP correspondentes.
                </div>
            </a>
        </div>
        
        <div class="features">
            <h3>🏦 Recursos da API</h3>
            <div class="features-grid">
                <div class="feature">🔐 Autenticação JWT</div>
                <div class="feature">💰 Gestão Financeira</div>
                <div class="feature">💳 Rastreamento de Cartão</div>
                <div class="feature">📊 Portfólio de Investimentos</div>
                <div class="feature">📋 Gestão de Dívidas</div>
                <div class="feature">🔗 Integrações Bancárias</div>
                <div class="feature">⚙️ Planejamento Orçamentário (50/30/20)</div>
                <div class="feature">🎯 Recomendações com IA</div>
            </div>
        </div>
        
        <div style="margin-top: 2rem; opacity: 0.7; font-size: 0.9rem;">
            <p>Construído com ❤️ usando Fastify, TypeScript e Clean Architecture</p>
            <p style="margin-top: 0.5rem;">
                <a href="/scalar" style="color: rgba(255,255,255,0.8);">Docs Scalar</a> | 
                <a href="/documentation" style="color: rgba(255,255,255,0.8);">Interface Swagger</a> | 
                <a href="/errors" style="color: rgba(255,255,255,0.8);">Códigos de Erro</a> | 
                <a href="/errors.json" style="color: rgba(255,255,255,0.8);">API de Erros</a> | 
                <a href="/documentation/json" style="color: rgba(255,255,255,0.8);">Especificação OpenAPI</a>
            </p>
        </div>
    </div>
</body>
</html>
    `;
    
    reply.type('text/html');
    return html;
  });

}, {  
  name: 'docs-redirect-plugin'
});