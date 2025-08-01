import fp from 'fastify-plugin';

export default fp(async function (fastify) {
  // Main docs route - shows both documentation options
  fastify.get('/', async (request, reply) => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flash Investing API - Documentation</title>
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
        <div class="subtitle">Professional API Documentation - Choose your preferred interface</div>
        
        <div class="docs-grid">
            <a href="/scalar" class="doc-card">
                <div class="doc-icon">🚀</div>
                <div class="doc-title">Scalar Documentation</div>
                <div class="doc-description">
                    Modern, beautiful API documentation with interactive testing, 
                    dark theme, and enhanced user experience. Recommended for developers.
                </div>
            </a>
            
            <a href="/documentation" class="doc-card">
                <div class="doc-icon">📖</div>
                <div class="doc-title">Swagger UI</div>
                <div class="doc-description">
                    Classic Swagger UI interface with comprehensive API exploration,
                    schema validation, and tried-and-tested reliability.
                </div>
            </a>
        </div>
        
        <div class="features">
            <h3>🏦 API Features</h3>
            <div class="features-grid">
                <div class="feature">🔐 JWT Authentication</div>
                <div class="feature">💰 Financial Management</div>
                <div class="feature">💳 Credit Card Tracking</div>
                <div class="feature">📊 Investment Portfolio</div>
                <div class="feature">📋 Debt Management</div>
                <div class="feature">🔗 Bank Integrations</div>
                <div class="feature">⚙️ Budget Planning (50/30/20)</div>
                <div class="feature">🎯 AI Recommendations</div>
            </div>
        </div>
        
        <div style="margin-top: 2rem; opacity: 0.7; font-size: 0.9rem;">
            <p>Built with ❤️ using Fastify, TypeScript, and Clean Architecture</p>
            <p style="margin-top: 0.5rem;">
                <a href="/scalar" style="color: rgba(255,255,255,0.8);">Scalar Docs</a> | 
                <a href="/documentation" style="color: rgba(255,255,255,0.8);">Swagger UI</a> | 
                <a href="/documentation/json" style="color: rgba(255,255,255,0.8);">OpenAPI Spec</a>
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