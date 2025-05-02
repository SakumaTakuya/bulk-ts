'use client';

import React from 'react';
import { Menu, Home, Dumbbell, History } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

export default function Navigation() {
  const pathname = usePathname();
  const t = useTranslations('navigation');

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
      <nav className="hidden lg:flex justify-between items-center p-4 bg-white border-b">
        <div className="font-bold text-xl">ブランドロゴ</div>
        <div className="flex space-x-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant={isActivePath(link.href) ? "default" : "ghost"}
                className="flex items-center gap-2"
                aria-current={isActivePath(link.href) ? "page" : undefined}
              >
                {link.icon}
                <span>{link.name}</span>
              </Button>
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <LocaleSwitcher />
          <Button>ログイン</Button>
        </div>
      </nav>

      {/* モバイルナビゲーション - lg(1024px)未満で表示 */}
      <div className="lg:hidden flex justify-between items-center p-4 bg-white border-b">
        <div className="font-bold text-xl">ブランドロゴ</div>

        {/* ハンバーガーメニュー */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu size={24} />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <SheetTitle className="text-lg font-semibold"></SheetTitle>
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center py-4">
                <h2 className="text-lg font-semibold">メニュー</h2>
              </div>

              <nav className="flex flex-col gap-4 pt-4">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <Button
                      variant={isActivePath(link.href) ? "default" : "ghost"}
                      className="flex justify-start items-center gap-4 w-full"
                      aria-current={isActivePath(link.href) ? "page" : undefined}
                    >
                      {link.icon}
                      <span>{link.name}</span>
                    </Button>
                  </Link>
                ))}
              </nav>

              <div className="mt-auto pt-4 pb-2">
                <LocaleSwitcher />
              </div>

              <div className="pt-2 pb-8">
                <Button className="w-full">ログイン</Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      {/* モバイル用フッターナビゲーション */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center p-2 z-10 h-[72px]">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Button
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center justify-center h-full p-1 ${isActivePath(link.href) ? 'text-primary' : 'text-gray-500'}`}
              aria-current={isActivePath(link.href) ? "page" : undefined}
            >
              {link.icon}
              <span className="text-xs mt-1">{link.name}</span>
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
