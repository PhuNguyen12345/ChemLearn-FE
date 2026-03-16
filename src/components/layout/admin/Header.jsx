import React, { useState } from 'react';
import { Menu, User, Settings, LogOut, FlaskConical, AlertTriangle } from 'lucide-react';
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

        {/* Right side controls */}
        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          
          <LanguageSwitcher />

          {/* Admin System Alerts */}
          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80 relative">
            <AlertTriangle className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive animate-pulse"></span>
            <span className="sr-only">System Alerts</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full border border-border">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/admin-avatar.png" alt="@admin" />
                  <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">AD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Super Admin</p>
                  <p className="text-xs leading-none text-muted-foreground">admin@chemlearn.edu</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>{t.profile || 'My Profile'}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>{t.settings || 'System Settings'}</span>
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
