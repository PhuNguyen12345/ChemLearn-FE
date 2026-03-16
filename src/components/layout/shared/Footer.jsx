import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full border-t bg-background py-6 px-4 md:px-6">
      <div className="flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground text-center md:text-left gap-4">
        <p>&copy; 2026 ChemLearn - FPT University. All rights reserved.</p>
        <div className="flex gap-4 sm:gap-6">
          <a href="#" className="hover:text-foreground transition-colors underline-offset-4 hover:underline">
            Privacy Policy (COPPA Compliant)
          </a>
          <a href="#" className="hover:text-foreground transition-colors underline-offset-4 hover:underline">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
