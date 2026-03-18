import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "../components/ui/button";
import {
  FlaskConical,
  ArrowRight,
  BookOpen,
  MonitorPlay,
  TrendingUp,
  ArrowRightCircle,
  Globe,
  Hexagon,
  Beaker,
  Atom,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import useLanguageStore from '../stores/useLanguageStore';
import { translations } from '../lib/translations';

const LandingPage = () => {
  const { language, setLanguage } = useLanguageStore();
  const t = translations[language];

  const scatteredIcons = [
    { Icon: FlaskConical, size: 'w-48 h-48', pos: '-top-10 -left-10', rotate: 'rotate-12', delay: '0s' },
    { Icon: Beaker, size: 'w-64 h-64', pos: 'top-20 -right-20', rotate: '-rotate-12', delay: '2s' },
    { Icon: Atom, size: 'w-40 h-40', pos: 'bottom-20 left-1/4', rotate: 'rotate-45', delay: '4s' },
    { Icon: Hexagon, size: 'w-56 h-56', pos: 'top-1/2 -right-10', rotate: '-rotate-45', delay: '1s' },
    { Icon: FlaskConical, size: 'w-32 h-32', pos: 'bottom-10 right-1/3', rotate: 'rotate-[30deg]', delay: '3s' },
    { Icon: Beaker, size: 'w-24 h-24', pos: 'top-1/4 left-1/3', rotate: 'rotate-[-20deg]', delay: '5s' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-slate-900 font-sans text-white selection:bg-purple-500/30 overflow-x-hidden">

      {/* 1. Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-indigo-950/50 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between max-w-7xl">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-cyan-400 rounded-2xl text-white group-hover:bg-cyan-500 transition-colors shadow-md shadow-cyan-500/50">
              <FlaskConical className="w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold text-white tracking-tight">
              Chem<span className="text-cyan-400">Learn</span>
            </span>
          </Link>

          {/* Desktop Links — colorful pill buttons */}
          <div className="hidden md:flex items-center space-x-2 text-sm font-bold">
            <Link to="/" className="rounded-full px-4 py-1.5 bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-sm shadow-blue-200">
              {t.nav.home}
            </Link>
            <Link to="#lessons" className="rounded-full px-4 py-1.5 bg-green-500 text-white hover:bg-green-600 transition-colors shadow-sm shadow-green-200">
              {t.nav.lessons}
            </Link>
            <Link to="/lab1" className="rounded-full px-4 py-1.5 bg-yellow-400 text-white hover:bg-yellow-500 transition-colors shadow-sm shadow-yellow-200">
              {t.nav.virtualLab}
            </Link>
            <Link to="#quizzes" className="rounded-full px-4 py-1.5 bg-orange-400 text-white hover:bg-orange-500 transition-colors shadow-sm shadow-orange-200">
              {t.nav.quizzes}
            </Link>
            <Link to="/teacher/dashboard" className="rounded-full px-4 py-1.5 bg-purple-500 text-white hover:bg-purple-600 transition-colors shadow-sm shadow-purple-200">
              {t.nav.teacherPortal}
            </Link>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full text-slate-600 hover:text-cyan-600 hover:bg-cyan-50 font-bold px-4 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>{language.toUpperCase()}</span>
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

            <Button variant="ghost" className="rounded-full text-slate-600 hover:text-cyan-600 hover:bg-cyan-50 font-bold px-6">
              {t.nav.login}
            </Button>
            <Button className="rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-500 hover:to-cyan-600 text-white font-bold px-6 shadow-md shadow-cyan-200">
              {t.nav.signUp}
            </Button>
          </div>
        </div>
      </nav>

      <main className="pt-20">

        {/* 2. Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32">
          {/* 🪄 Magic Background Icons */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {scatteredIcons.map(({ Icon, size, pos, rotate, delay }, idx) => (
              <Icon
                key={idx}
                className={`absolute ${size} ${pos} ${rotate} text-white/5 animate-[pulse_8s_ease-in-out_infinite]`}
                style={{ animationDelay: delay }}
                strokeWidth={1}
              />
            ))}
          </div>

          {/* Big colourful blobs */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="container mx-auto px-6 relative z-10 max-w-7xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">

              {/* Text Left — with floating science emojis */}
              <div className="relative max-w-2xl space-y-8">
                {/* Floating decorative science icons */}
                <div className="absolute -top-8 -left-4 text-4xl animate-bounce" style={{ animationDuration: '2.8s' }}>⚛️</div>
                <div className="absolute top-10 -right-6 text-3xl animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>🧪</div>
                <div className="absolute -bottom-6 left-12 text-3xl animate-bounce" style={{ animationDuration: '2.2s', animationDelay: '1s' }}>🔬</div>
                <div className="absolute bottom-8 right-0 text-2xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.2s' }}>💡</div>

                <div className="inline-block px-5 py-2 bg-purple-500/20 text-purple-200 text-sm font-black rounded-full shadow-sm border border-purple-400/30 backdrop-blur-md">
                  {t.hero.badge}
                </div>

                <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-white">
                  {t.hero.titleLine1} <br />
                  <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                    {t.hero.titleLine2}
                  </span>
                </h1>

                <p className="text-xl text-purple-100 leading-relaxed md:max-w-lg font-medium">
                  {t.hero.subtitle}
                </p>

                <div className="pt-4 flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="rounded-3xl bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-extrabold shadow-lg shadow-orange-500/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/60 px-8 h-14 text-base group"
                  >
                    {t.hero.btnGetStarted}
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-3xl border-2 border-purple-400/30 hover:bg-white/5 text-black px-8 h-14 text-base group shadow-sm backdrop-blur-sm font-bold"
                  >
                    <MonitorPlay className="mr-2 w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                    {t.hero.btnWatchDemo}
                  </Button>
                </div>
              </div>

              {/* Visual Right */}
              <div className="relative mt-12 md:mt-0">
                <div className="relative w-full aspect-square max-w-lg mx-auto bg-gradient-to-tr from-cyan-100 via-blue-50 to-white rounded-[3rem] shadow-2xl shadow-cyan-200/50 p-8 border border-white/80 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

                  <div className="relative z-10 animate-[bounce_4s_ease-in-out_infinite]">
                    <div className="w-48 h-48 bg-white/90 backdrop-blur shadow-xl rounded-3xl p-6 flex items-center justify-center border border-cyan-100">
                      <div className="relative">
                        <FlaskConical className="w-24 h-24 text-cyan-500" strokeWidth={1.5} />
                        <div className="absolute top-0 right-2 w-3 h-3 bg-cyan-300 rounded-full animate-[ping_2s_ease-in-out_infinite]" />
                        <div className="absolute -top-4 right-8 w-4 h-4 bg-purple-300 rounded-full animate-[ping_3s_ease-in-out_infinite] delay-300" />
                        <div className="absolute top-4 -right-2 w-2 h-2 bg-teal-300 rounded-full animate-[ping_2.5s_ease-in-out_infinite] delay-700" />
                      </div>
                    </div>
                  </div>

                  {/* Floating chemical labels — universal symbols, no translation needed */}
                  <div className="absolute top-12 left-12 w-16 h-16 bg-white shadow-lg shadow-cyan-100 rounded-2xl flex items-center justify-center animate-[pulse_5s_ease-in-out_infinite] border border-cyan-100 z-20">
                    <span className="text-2xl font-extrabold text-teal-500">H₂O</span>
                  </div>
                  <div className="absolute bottom-16 right-12 w-20 h-20 bg-white shadow-lg shadow-purple-100 rounded-full flex items-center justify-center animate-[pulse_6s_ease-in-out_infinite] delay-1000 border border-purple-100 z-20">
                    <span className="text-xl font-extrabold text-purple-500">CO₂</span>
                  </div>
                  <div className="absolute top-16 right-10 w-12 h-12 bg-yellow-100 shadow rounded-full flex items-center justify-center animate-[pulse_4s_ease-in-out_infinite] z-20">
                    <span className="text-lg font-extrabold text-yellow-600">O₂</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Features Grid */}
        <section className="py-24 bg-transparent relative z-20" id="features">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center mb-16 max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white">
                {t.features.sectionTitle}
              </h2>
              <p className="text-lg text-purple-200">
                {t.features.sectionSubtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 — Curriculum */}
              <div className="bg-sky-100 text-sky-900 rounded-3xl p-10 hover:shadow-xl hover:shadow-sky-200/60 hover:-translate-y-2 transition-all duration-300">
                <div className="w-20 h-20 rounded-full bg-sky-300 flex items-center justify-center mb-6 shadow-md shadow-sky-200">
                  <BookOpen className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-extrabold mb-3">{t.features.curriculumTitle}</h3>
                <p className="leading-relaxed text-sky-800">
                  {t.features.curriculumDesc}
                </p>
              </div>

              {/* Feature 2 — Simulations */}
              <div className="bg-emerald-100 text-emerald-900 rounded-3xl p-10 hover:shadow-xl hover:shadow-emerald-200/60 hover:-translate-y-2 transition-all duration-300">
                <div className="w-20 h-20 rounded-full bg-emerald-400 flex items-center justify-center mb-6 shadow-md shadow-emerald-200">
                  <MonitorPlay className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-extrabold mb-3">{t.features.simulationsTitle}</h3>
                <p className="leading-relaxed text-emerald-800">
                  {t.features.simulationsDesc}
                </p>
              </div>

              {/* Feature 3 — Progress */}
              <div className="bg-amber-100 text-amber-900 rounded-3xl p-10 hover:shadow-xl hover:shadow-amber-200/60 hover:-translate-y-2 transition-all duration-300">
                <div className="w-20 h-20 rounded-full bg-amber-400 flex items-center justify-center mb-6 shadow-md shadow-amber-200">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-extrabold mb-3">{t.features.progressTitle}</h3>
                <p className="leading-relaxed text-amber-800">
                  {t.features.progressDesc}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. How It Works — Abstract Concepts Visual Section */}
        <section className="py-24 bg-indigo-950/30 relative overflow-hidden" id="how-it-works">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 max-w-2xl mx-auto">
                {t.howItWorks.sectionTitle}
              </h2>
              <p className="text-lg text-purple-200 max-w-2xl mx-auto">
                {t.howItWorks.sectionSubtitle}
              </p>
            </div>

            {/* Visual Reaction Flow */}
            <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-xl rounded-[3rem] p-8 md:p-16 shadow-2xl shadow-indigo-500/10 border border-white/10 relative">
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">

                {/* Reactants */}
                <div className="flex flex-col items-center gap-4 group cursor-pointer z-10">
                  <div className="w-36 h-36 md:w-48 md:h-48 bg-teal-50 rounded-[2.5rem] border-2 border-teal-200 flex items-center justify-center shadow-md group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-teal-200 transition-all duration-300 relative overflow-hidden">
                    <div className="flex gap-3 z-10 relative">
                      <div className="w-10 h-10 rounded-full bg-teal-400 shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.1)]" />
                      <div className="w-10 h-10 rounded-full bg-teal-300 shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.1)]" />
                    </div>
                  </div>
                  <span className="text-xl font-extrabold text-teal-700">{t.howItWorks.reactantsLabel}</span>
                  <span className="text-sm font-medium text-slate-500 -mt-2">{t.howItWorks.reactantsDesc}</span>
                </div>

                {/* Arrow */}
                <div className="flex flex-col items-center text-cyan-400 animate-[pulse_2s_ease-in-out_infinite] z-10">
                  <ArrowRightCircle className="w-12 h-12 md:w-16 md:h-16 hidden md:block drop-shadow-sm" strokeWidth={1.5} />
                  <ArrowRightCircle className="w-12 h-12 rotate-90 md:hidden drop-shadow-sm" strokeWidth={1.5} />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-600 mt-3 bg-cyan-100 px-3 py-1 rounded-full">
                    {t.howItWorks.reactionLabel}
                  </span>
                </div>

                {/* Products */}
                <div className="flex flex-col items-center gap-4 group cursor-pointer z-10">
                  <div className="w-36 h-36 md:w-48 md:h-48 bg-purple-50 rounded-full border-2 border-purple-200 flex items-center justify-center shadow-md group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-purple-200 transition-all duration-300 relative overflow-hidden">
                    <div className="relative w-24 h-24 z-10 flex items-center justify-center">
                      <div className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-purple-400 shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.1)] z-20" />
                      <div className="absolute top-1 right-1 w-8 h-8 rounded-full bg-teal-400 shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.1)] z-10" />
                      <div className="absolute bottom-1 left-1 w-8 h-8 rounded-full bg-teal-400 shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.1)] z-10" />
                    </div>
                  </div>
                  <span className="text-xl font-extrabold text-purple-700">{t.howItWorks.productsLabel}</span>
                  <span className="text-sm font-medium text-slate-500 -mt-2">{t.howItWorks.productsDesc}</span>
                </div>
              </div>

              {/* Dashed connector */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 border-t-2 border-dashed border-cyan-200 -z-0 hidden md:block" />
            </div>
          </div>
        </section>

      </main>

      {/* 6. Footer */}
      <footer className="bg-slate-950/40 border-t border-white/5 pt-20 pb-8 text-white backdrop-blur-md">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-6 group inline-flex">
                <div className="p-2 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
                  <FlaskConical className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-extrabold tracking-tight text-white">ChemLearn</span>
              </Link>
              <p className="text-purple-100 max-w-sm mb-6 leading-relaxed">
                {t.footer.tagline}
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/40 transition-colors cursor-pointer">
                  <span className="font-bold text-white">in</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/40 transition-colors cursor-pointer">
                  <span className="font-bold text-white text-lg">x</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-white font-extrabold mb-6 text-lg">{t.footer.platformHeading}</h4>
              <ul className="space-y-4 text-sm font-medium text-purple-100">
                <li><Link to="#features" className="hover:text-white transition-colors">{t.footer.features}</Link></li>
                <li><Link to="/lab1" className="hover:text-white transition-colors">{t.footer.virtualLab}</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">{t.footer.pricing}</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">{t.footer.forSchools}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-extrabold mb-6 text-lg">{t.footer.companyHeading}</h4>
              <ul className="space-y-4 text-sm font-medium text-purple-100">
                <li><Link to="#" className="hover:text-white transition-colors">{t.footer.about}</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">{t.footer.contact}</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">{t.footer.privacy}</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">{t.footer.terms}</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-purple-400 pt-8 flex flex-col md:flex-row items-center justify-between text-sm font-medium text-purple-100">
            <p>{t.footer.copyright}</p>
            <div className="flex space-x-8 mt-4 md:mt-0">
              <Link to="#" className="hover:text-white transition-colors">{t.footer.support}</Link>
              <Link to="#" className="hover:text-white transition-colors">{t.footer.faq}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
