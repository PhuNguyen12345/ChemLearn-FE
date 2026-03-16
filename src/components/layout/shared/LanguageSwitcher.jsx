import React from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import useLanguageStore from '@/stores/useLanguageStore';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguageStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative">
          <Globe className="h-5 w-5" />
          <span className="sr-only">Toggle language</span>
          <span className="absolute -bottom-1 right-1 text-[10px] font-bold border rounded-sm px-0.5 bg-background text-primary">
            {language.toUpperCase()}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage('vi')} className="cursor-pointer">
          Tiếng Việt
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('en')} className="cursor-pointer">
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
