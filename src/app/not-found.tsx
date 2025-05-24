import { useTranslations } from 'next-intl';

export default function NotFoundPage(): React.JSX.Element {
  const t = useTranslations('notFound');
  return <h1>{t('title')}</h1>;
}
