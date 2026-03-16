import React, { useState } from 'react';
import { Menu, User, Settings, LogOut, FlaskConical, Flame, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import Sidebar from './Sidebar';
import LanguageSwitcher from '../shared/LanguageSwitcher';
import useLanguageStore from '@/stores/useLanguageStore';
import { translations } from '@/lib/translations';

const Header = () => {
  const [open, setOpen] = useState(false);
  const { language } = useLanguageStore();
  const t = translations[language] || translations['vi'];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-6">
        {/* Mobile Menu Trigger & Sheet */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <Sidebar className="border-r-0" />
          </SheetContent>
        </Sheet>

        {/* Brand (Visible on mobile) */}
        <div className="md:hidden flex items-center gap-2 font-bold text-lg text-primary mr-auto">
          <FlaskConical className="h-5 w-5" />
          <span>ChemLearn</span>
        </div>

        {/* Right side controls: Gamification & Profile */}
        <div className="ml-auto flex items-center gap-4">
          
          {/* Gamification Stats */}
          <div className="hidden sm:flex items-center gap-3 mr-2">
            <div className="flex items-center text-sm font-medium text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full">
              <Flame className="w-4 h-4 mr-1 fill-current" />
              <span>5 Day Streak</span>
            </div>
            <div className="flex items-center text-sm font-medium text-blue-500 bg-blue-500/10 px-2.5 py-1 rounded-full">
              <Star className="w-4 h-4 mr-1 fill-current" />
              <span>1,250 EXP</span>
            </div>
          </div>

          <LanguageSwitcher />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full border border-border">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/student-avatar.png" alt="@student" />
                  <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">ST</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Alex Student</p>
                  <p className="text-xs leading-none text-muted-foreground">Grade 8 • Science Explorers</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>{t.profile || 'My Profile'}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>{t.settings || 'Settings'}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t.logout || 'Log out'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
