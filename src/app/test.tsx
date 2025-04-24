import React, { useState } from 'react';
import { Menu, Home, Search, User, Settings, ShoppingCart } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

const MobileNavigation = () => {
  // アクティブなリンクを管理するステート
  const [activeLink, setActiveLink] = useState('home');

  // ナビゲーションリンク
  const navLinks = [
    { name: 'ホーム', icon: <Home size={20} />, id: 'home' },
    { name: '検索', icon: <Search size={20} />, id: 'search' },
    { name: 'アカウント', icon: <User size={20} />, id: 'account' },
    { name: '設定', icon: <Settings size={20} />, id: 'settings' },
    { name: 'カート', icon: <ShoppingCart size={20} />, id: 'cart' },
  ];

  // リンククリックハンドラー
  const handleLinkClick = (id: string) => {
    setActiveLink(id);
  };

  return (
    <div className="w-full">
      {/* デスクトップナビゲーション - lg(1024px)以上で表示 */}
      <nav className="hidden lg:flex justify-between items-center p-4 bg-white border-b">
        <div className="font-bold text-xl">ブランドロゴ</div>
        <div className="flex space-x-6">
          {navLinks.map((link) => (
            <Button
              key={link.id}
              variant={activeLink === link.id ? "default" : "ghost"}
              className="flex items-center gap-2"
              onClick={() => handleLinkClick(link.id)}
            >
              {link.icon}
              <span>{link.name}</span>
            </Button>
          ))}
        </div>
        <div>
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
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center py-4">
                <h2 className="text-lg font-semibold">メニュー</h2>
              </div>

              <nav className="flex flex-col gap-4 pt-4">
                {/* {navLinks.map((link) => (
                  <Button
                    key={link.id}
                    variant={activeLink === link.id ? "default" : "ghost"}
                    className="flex justify-start items-center gap-4 w-full"
                    onClick={() => handleLinkClick(link.id)}
                  >
                    {link.icon}
                    <span>{link.name}</span>
                  </Button>
                ))} */}
              </nav>

              <div className="mt-auto pt-4 pb-8">
                <Button className="w-full">ログイン</Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      {/* モバイル用フッターナビゲーション */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center p-2 z-10">
        {navLinks.map((link) => (
          <Button
            key={link.id}
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center p-2 ${activeLink === link.id ? 'text-primary' : 'text-gray-500'
              }`}
            onClick={() => handleLinkClick(link.id)}
          >
            {link.icon}
            <span className="text-xs mt-1">{link.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default MobileNavigation;