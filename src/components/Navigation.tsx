'use client';

import React from 'react';
import { Menu, Home, Dumbbell, History } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Navigation(): React.JSX.Element {
  const pathname = usePathname();
  const t = useTranslations('navigation');
  const common = useTranslations('common');

  // 多言語化したナビゲーションリンク
  const navLinks = [
    { name: t('home'), icon: <Home size={20} />, href: '/' },
    { name: t('exercises'), icon: <Dumbbell size={20} />, href: '/exercises' },
    { name: t('history'), icon: <History size={20} />, href: '/history' },
  ];

  // 現在のパスを確認する関数
  const isActivePath = (path: string): boolean => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <div className="w-full">
      {/* デスクトップナビゲーション - lg(1024px)以上で表示 */}
      <nav className="hidden lg:flex justify-between items-center p-4 border-b">
        <Image src="/bland-image.png" alt="Brand Logo" width={64} height={64} className="w-10" />
        <div className="flex space-x-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant={isActivePath(link.href) ? 'default' : 'ghost'}
                className="flex items-center gap-2"
                aria-current={isActivePath(link.href) ? 'page' : undefined}
              >
                {link.icon}
                <span>{link.name}</span>
              </Button>
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => signOut()}>
            {common('signOut')}
          </Button>
        </div>
      </nav>

      {/* モバイルナビゲーション - lg(1024px)未満で表示 */}
      <div className="lg:hidden flex justify-between items-center p-4 border-b">
        <Image src="/bland-image.png" alt="Brand Logo" width={64} height={64} className="w-10" />
      </div>
      {/* モバイル用フッターナビゲーション */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 border-t flex justify-around items-center p-2 z-10 h-[72px]">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Button
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center justify-center h-full p-1 ${isActivePath(link.href) ? 'text-primary' : 'text-gray-500'}`}
              aria-current={isActivePath(link.href) ? 'page' : undefined}
            >
              {link.icon}
              <span className="text-xs mt-1">{link.name}</span>
            </Button>
          </Link>
        ))}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom">
            <SheetTitle className="text-lg font-semibold"></SheetTitle>
            <div className="flex flex-col h-full p-4 gap-2">
              <h2 className="text-lg font-semibold">メニュー</h2>
              <Button variant="outline" onClick={() => signOut()}>
                {common('signOut')}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
