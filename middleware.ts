import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

export default createMiddleware(routing);

export const config = {
    // ルーティングの対象となるパスを定義
    matcher: ['/((?!api|_next|.*\\..*).*)']
};