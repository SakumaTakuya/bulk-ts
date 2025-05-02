import { locales } from './locale';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
    locales: locales,
    defaultLocale: locales[0],
});