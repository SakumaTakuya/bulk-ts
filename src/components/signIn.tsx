'use client';

import { signIn } from "next-auth/react";
import { Button } from "./ui/button";
import { useTranslations } from "next-intl";

export default function SignInButton(): React.JSX.Element {
  const t = useTranslations();

  return (
    <Button onClick={() => signIn('google')}>{t('signIn')}</Button>
  );
}