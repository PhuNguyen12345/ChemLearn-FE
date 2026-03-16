import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { 
  FlaskConical, 
  ArrowRight, 
  BookOpen, 
  MonitorPlay, 
  TrendingUp,
  ArrowRightCircle,
  Globe
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

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-sky-100">
      {/* 1. Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-sky-100">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between max-w-7xl">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-sky-100 rounded-2xl text-sky-600 group-hover:bg-sky-200 transition-colors">
              <FlaskConical className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-slate-800 tracking-tight">ChemLearn</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-sky-600 transition-colors">{t.home}</Link>
            <Link to="#lessons" className="hover:text-sky-600 transition-colors">{t.lessons}</Link>
            <Link to="/lab1" className="hover:text-sky-600 transition-colors">{t.virtualLab}</Link>
            <Link to="#quizzes" className="hover:text-sky-600 transition-colors">{t.quizzes}</Link>
            <Link to="/teacher/dashboard" className="hover:text-sky-600 transition-colors">{t.teacherPortal}</Link>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full text-slate-600 hover:text-sky-600 hover:bg-sky-50 font-medium px-4 flex items-center gap-2">
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

            <Button variant="ghost" className="rounded-full text-slate-600 hover:text-sky-600 hover:bg-sky-50 font-medium px-6">
              {t.login}
            </Button>
            <Button className="rounded-full bg-sky-500 hover:bg-sky-600 text-white font-medium px-6 shadow-sm shadow-sky-200">
              {t.signUp}
            </Button>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {/* 2. Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/50 to-white pt-24 pb-32">
          {/* Decorative background blobs */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[600px] h-[600px] bg-sky-200/30 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

          <div className="container mx-auto px-6 relative z-10 max-w-7xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Text Left */}
              <div className="max-w-2xl space-y-8">
                <div className="inline-block px-4 py-1.5 bg-sky-100 text-sky-700 text-sm font-semibold rounded-full mb-2 shadow-sm border border-sky-200/50">
                  ✨ The Future of EdTech
                </div>
                <h1 className="text-5xl md:text-6xl font-extrabold text-slate-800 leading-tight tracking-tight">
                  Easy & Effective <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-500">
                    Chemistry Learning
                  </span>
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed md:max-w-lg">
                  Master Chemistry concepts with interactive lessons, virtual labs, and quizzes designed specifically for Grades 6-9.
                </p>
                <div className="pt-4 flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="rounded-full bg-sky-500 hover:bg-sky-600 text-white shadow-md hover:shadow-lg hover:shadow-sky-200 transition-all px-8 h-14 text-base group">
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-full border-2 border-sky-100 hover:bg-sky-50 text-sky-700 hover:text-sky-800 px-8 h-14 text-base group shadow-sm bg-white/50 backdrop-blur-sm">
                    <MonitorPlay className="mr-2 w-5 h-5 text-sky-500 group-hover:scale-110 transition-transform" />
                    Watch Demo
                  </Button>
                </div>
              </div>

              {/* Visual Right */}
              <div className="relative mt-12 md:mt-0">
                <div className="relative w-full aspect-square max-w-lg mx-auto bg-gradient-to-tr from-sky-100 via-indigo-50 to-white rounded-[3rem] shadow-xl shadow-sky-100/50 p-8 border border-white/80 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                  
                  <div className="relative z-10 animate-[bounce_4s_ease-in-out_infinite]">
                    <div className="w-48 h-48 bg-white/80 backdrop-blur shadow-lg rounded-3xl p-6 flex items-center justify-center border border-sky-50">
                      <div className="relative">
                        <FlaskConical className="w-24 h-24 text-sky-500" strokeWidth={1.5} />
                        {/* Bubbles */}
                        <div className="absolute top-0 right-2 w-3 h-3 bg-sky-300 rounded-full animate-[ping_2s_ease-in-out_infinite]"></div>
                        <div className="absolute -top-4 right-8 w-4 h-4 bg-indigo-300 rounded-full animate-[ping_3s_ease-in-out_infinite] delay-300"></div>
                        <div className="absolute top-4 -right-2 w-2 h-2 bg-teal-300 rounded-full animate-[ping_2.5s_ease-in-out_infinite] delay-700"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating Elements */}
                  <div className="absolute top-12 left-12 w-16 h-16 bg-white shadow-md rounded-2xl flex items-center justify-center animate-[pulse_5s_ease-in-out_infinite] border border-sky-50 z-20">
                    <span className="text-2xl font-bold text-teal-500">H₂O</span>
                  </div>
                  <div className="absolute bottom-16 right-12 w-20 h-20 bg-white shadow-md rounded-full flex items-center justify-center animate-[pulse_6s_ease-in-out_infinite] delay-1000 border border-indigo-50 z-20">
                    <span className="text-xl font-bold text-indigo-500">CO₂</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Features Grid */}
        <section className="py-24 bg-white relative z-20" id="features">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center mb-16 max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800">Everything you need to master Chemistry</h2>
              <p className="text-lg text-slate-500">Tools designed to make learning engaging, visual, and highly effective for secondary school students.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <Card className="rounded-[2.5rem] border-none shadow-md hover:shadow-xl hover:shadow-sky-100/60 hover:-translate-y-2 transition-all duration-300 bg-slate-50/50">
                <CardContent className="p-10">
                  <div className="w-16 h-16 rounded-3xl bg-sky-100 text-sky-600 flex items-center justify-center mb-6 shadow-sm">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">Curriculum-Based Lessons</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Structured modules aligned perfectly with secondary school chemistry standards. Clear, step-by-step learning paths.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 2 */}
              <Card className="rounded-[2.5rem] border-none shadow-md hover:shadow-xl hover:shadow-indigo-100/60 hover:-translate-y-2 transition-all duration-300 bg-slate-50/50">
                <CardContent className="p-10">
                  <div className="w-16 h-16 rounded-3xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6 shadow-sm">
                    <MonitorPlay className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">Interactive Simulations</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Visualize abstract concepts through hands-on virtual experiments safely via our realistic browser-based labs.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 3 */}
              <Card className="rounded-[2.5rem] border-none shadow-md hover:shadow-xl hover:shadow-teal-100/60 hover:-translate-y-2 transition-all duration-300 bg-slate-50/50">
                <CardContent className="p-10">
                  <div className="w-16 h-16 rounded-3xl bg-teal-100 text-teal-600 flex items-center justify-center mb-6 shadow-sm">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">Progress Tracking</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Monitor your learning journey, earn badges, and easily identify areas where you need a little more practice.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* 4. Abstract Concepts Visual Section */}
        <section className="py-24 bg-sky-50/50 relative overflow-hidden" id="how-it-works">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4 max-w-2xl mx-auto">
                How ChemLearn Helps You Understand Abstract Concepts
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Our platform uses engaging visuals, animations, and interactive elements to make complex chemical processes easy to grasp.
              </p>
            </div>

            {/* Visual Reaction Flow */}
            <div className="max-w-4xl mx-auto bg-white rounded-[3rem] p-8 md:p-16 shadow-xl shadow-sky-100/50 border border-sky-50 relative">
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
                
                {/* Reactants */}
                <div className="flex flex-col items-center gap-4 group cursor-pointer z-10">
                  <div className="w-36 h-36 md:w-48 md:h-48 bg-teal-50 rounded-[2.5rem] border-2 border-teal-100 flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-sm z-0"></div>
                    <div className="flex gap-3 z-10 relative">
                       <div className="w-10 h-10 rounded-full bg-teal-400 shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.1)]"></div>
                       <div className="w-10 h-10 rounded-full bg-teal-300 shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.1)]"></div>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-teal-800">Reactants</span>
                  <span className="text-sm font-medium text-slate-500 -mt-2">Hydrogen + Oxygen</span>
                </div>

                {/* Arrow */}
                <div className="flex flex-col items-center text-sky-400 animate-[pulse_2s_ease-in-out_infinite] z-10">
                  <ArrowRightCircle className="w-12 h-12 md:w-16 md:h-16 hidden md:block drop-shadow-sm" strokeWidth={1.5} />
                  <ArrowRightCircle className="w-12 h-12 rotate-90 md:hidden drop-shadow-sm" strokeWidth={1.5} />
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-500 mt-3 bg-sky-50 px-3 py-1 rounded-full">Reaction</span>
                </div>

                {/* Products */}
                <div className="flex flex-col items-center gap-4 group cursor-pointer z-10">
                  <div className="w-36 h-36 md:w-48 md:h-48 bg-indigo-50 rounded-full border-2 border-indigo-100 flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-sm z-0"></div>
                    <div className="relative w-24 h-24 z-10 flex items-center justify-center">
                       <div className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-indigo-400 shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.1)] z-20"></div>
                       <div className="absolute top-1 right-1 w-8 h-8 rounded-full bg-teal-400 shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.1)] z-10"></div>
                       <div className="absolute bottom-1 left-1 w-8 h-8 rounded-full bg-teal-400 shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.1)] z-10"></div>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-indigo-800">Products</span>
                  <span className="text-sm font-medium text-slate-500 -mt-2">Water (H₂O)</span>
                </div>

              </div>
              
              {/* Connecting dashed line behind */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 border-t-2 border-dashed border-sky-200 -z-0 hidden md:block"></div>
            </div>
          </div>
        </section>

        {/* 5. Join Our Community */}
        <section className="py-24 bg-white" id="community">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Join Our Growing Community</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">Tailored experiences for everyone involved in the learning process.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* For Students */}
              <Card className="rounded-[2.5rem] border border-sky-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all text-center overflow-hidden bg-gradient-to-b from-white to-sky-50/30">
                <CardContent className="pt-10 pb-8 px-8 flex flex-col items-center h-full">
                  <div className="w-24 h-24 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mb-6 shadow-sm">
                    <span className="text-4xl">👨‍🎓</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-4">For Students</h3>
                  <p className="text-slate-600 mb-8 flex-grow leading-relaxed">
                    Unlock your true potential with fun, interactive lessons designed to make chemistry click.
                  </p>
                  <Button variant="secondary" className="w-full rounded-2xl bg-sky-100 hover:bg-sky-200 text-sky-700 font-bold h-14 text-[15px] shadow-sm">
                    Learn More
                  </Button>
                </CardContent>
              </Card>

              {/* For Teachers */}
              <Card className="rounded-[2.5rem] border border-indigo-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all text-center overflow-hidden bg-gradient-to-b from-white to-indigo-50/30">
                <CardContent className="pt-10 pb-8 px-8 flex flex-col items-center h-full">
                  <div className="w-24 h-24 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6 shadow-sm">
                    <span className="text-4xl">👩‍🏫</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-4">For Teachers</h3>
                  <p className="text-slate-600 mb-8 flex-grow leading-relaxed">
                    Access premium resources, seamlessly assign tasks, and track every student's progress.
                  </p>
                  <Button variant="secondary" className="w-full rounded-2xl bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold h-14 text-[15px] shadow-sm">
                    Learn More
                  </Button>
                </CardContent>
              </Card>

              {/* For Parents */}
              <Card className="rounded-[2.5rem] border border-teal-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all text-center overflow-hidden bg-gradient-to-b from-white to-teal-50/30">
                <CardContent className="pt-10 pb-8 px-8 flex flex-col items-center h-full">
                  <div className="w-24 h-24 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mb-6 shadow-sm">
                    <span className="text-4xl">👨‍👩‍👧</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-4">For Parents</h3>
                  <p className="text-slate-600 mb-8 flex-grow leading-relaxed">
                    Stay completely informed about your child's learning milestones and actionable areas to support.
                  </p>
                  <Button variant="secondary" className="w-full rounded-2xl bg-teal-100 hover:bg-teal-200 text-teal-700 font-bold h-14 text-[15px] shadow-sm">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* 6. Public Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 pt-20 pb-8 text-slate-400">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-6 text-white group inline-flex">
                <div className="p-2 bg-sky-500 rounded-xl group-hover:bg-sky-400 transition-colors">
                  <FlaskConical className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-white">ChemLearn</span>
              </Link>
              <p className="text-slate-400 max-w-sm mb-6 leading-relaxed">
                Redefining chemistry education for middle school students through interactive, visual, and highly engaging technology.
              </p>
              <div className="flex space-x-4">
                 {/* Social placeholders */}
                 <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-colors cursor-pointer">
                    <span className="font-bold">in</span>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-colors cursor-pointer">
                    <span className="font-bold text-lg">x</span>
                 </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 text-lg">Platform</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><Link to="#features" className="hover:text-sky-400 transition-colors">Features</Link></li>
                <li><Link to="/lab1" className="hover:text-sky-400 transition-colors">Virtual Lab</Link></li>
                <li><Link to="#" className="hover:text-sky-400 transition-colors">Pricing</Link></li>
                <li><Link to="#" className="hover:text-sky-400 transition-colors">For Schools</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 text-lg">Company</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><Link to="#" className="hover:text-sky-400 transition-colors">About Us</Link></li>
                <li><Link to="#" className="hover:text-sky-400 transition-colors">Contact</Link></li>
                <li><Link to="#" className="hover:text-sky-400 transition-colors">Privacy Policy</Link></li>
                <li><Link to="#" className="hover:text-sky-400 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between text-sm font-medium">
            <p>© {new Date().getFullYear()} ChemLearn. All rights reserved.</p>
            <div className="flex space-x-8 mt-4 md:mt-0">
              <Link to="#" className="hover:text-sky-400 transition-colors">Support</Link>
              <Link to="#" className="hover:text-sky-400 transition-colors">FAQ</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
