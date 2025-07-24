"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jwt_provider_1 = require("../../providers/jwt-provider");
async function authMiddleware(request, reply) {
    try {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            return reply.status(401).send({
                error: 'Missing authorization header',
            });
        }
        const [bearer, token] = authHeader.split(' ');
        if (bearer !== 'Bearer' || !token) {
            return reply.status(401).send({
                error: 'Invalid authorization format',
            });
        }
        const jwtProvider = new jwt_provider_1.JwtProviderImpl();
        const payload = jwtProvider.verifyAccessToken(token);
        request.user = {
            id: payload.sub,
            name: payload.name,
            email: payload.email,
        };
    }
    catch (error) {
        return reply.status(401).send({
            error: 'Invalid or expired token',
        });
    }
}
