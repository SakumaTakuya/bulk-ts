import { useTranslations } from 'next-intl';

export default function NotFoundPage(): React.JSX.Element {
  const t = useTranslations();
  return <h1>{t('notFound.title')}</h1>;
}
