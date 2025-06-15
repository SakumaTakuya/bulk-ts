import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';

const counrtyMap: { [key: string]: string } = {
  'JP': 'ja'
};

export default getRequestConfig(async () => {
  const headersList = await headers();
  const ipCountry = headersList.get('x-vercel-ip-country') || '';
  const ipTimezone = headersList.get('x-vercel-ip-timezone');

  const locale = counrtyMap[ipCountry] || 'ja';
  const timeZone = ipTimezone || 'Asia/Tokyo';

  return {
    locale,
    timeZone,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
