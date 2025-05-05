// ルートページでlocaleに応じて/jaまたは/enにリダイレクト
import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from '../i18n/routing';

export default async function Page() {
    const locale = await getLocale();
    // hasLocaleで判定し、なければdefaultLocaleにフォールバック
    const targetLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
    redirect(`/${targetLocale}`);
}
