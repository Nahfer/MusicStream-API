import jwt from 'jsonwebtoken';

export async function middleware(request: any): Promise<{ userid: string; name: string } | null> {
    const authHeader = request.headers?.get ? request.headers.get('authorization') : request.headers?.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, 'Ironclad') as any;
        return { userid: decoded.userid as string, name: decoded.name as string };
    } catch (error) {
        return null;
    }
}