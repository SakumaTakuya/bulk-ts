'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { routing } from '@/i18n/routing';


const languageNames: Record<string, string> = {
    en: 'English',
    ja: '日本語',
};

export default function LocaleSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();


    const handleLocaleChange = (newLocale: string) => {
        // 現在と同じ言語が選択された場合は何もしない
        if (newLocale === locale) return;

        // 新しい言語に切り替え (forcePrefix=trueでロケールCookieを更新)
        router.replace(pathname, { locale: newLocale });
    };

    return (
        <Select defaultValue={locale} onValueChange={handleLocaleChange}>
            <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="言語を選択" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    {routing.locales.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                            {languageNames[loc]}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}