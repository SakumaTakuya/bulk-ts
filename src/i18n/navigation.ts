import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// ナビゲーション関数をエクスポート
export const {
    Link,
    redirect,
    usePathname,
    useRouter,
    getPathname
} = createNavigation(routing);