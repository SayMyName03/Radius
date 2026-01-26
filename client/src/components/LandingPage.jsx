import React, { useEffect, useRef, useState } from "react";

const cn = (...inputs) => {
  return inputs.filter(Boolean).join(" ");
};

const addClickAnimation = (e) => {
  const element = e.currentTarget;
  element.style.animation = 'none';
  setTimeout(() => {
    element.style.animation = 'navbar-click-animation 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
  }, 10);
};

/* LOCAL styles only — no external requests, no globals */
const LocalStyles = () => (
  <style>{`
    /* Enable smooth scrolling for anchor links */
    html {
      scroll-behavior: smooth;
    }

    /* Click animation for navbar elements */
    @keyframes navbar-click-animation {
      0% { transform: scale(1); }
      50% { transform: scale(0.92); }
      100% { transform: scale(1); }
    }

    /* small decorative underline used in hero (keeps things self-contained) */
    .hero-underline { position: absolute; left: 0; width: 100%; top: 100%; margin-top: -5px; pointer-events: none; }

    /* fade-up animation */
    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up { animation: fade-in-up 0.6s ease-out both; }
    .animate-fade-in-up-delay-1 { animation-delay: 0.2s; }
    .animate-fade-in-up-delay-2 { animation-delay: 0.4s; }

    /* Button baseline - NO hover effects */
    .btn-base {
      transition: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    /* Keyboard-style bounce animation */
    @keyframes btn-bounce {
      0% { transform: scale(1); }
      50% { transform: scale(0.95); }
      100% { transform: scale(1); }
    }
    .btn-bounce-anim {
      animation: btn-bounce 0.3s cubic-bezier(0.36, 0, 0.66, -0.56);
    }

    .btn-focus-ring:focus-visible { outline: 2px solid #1D1D1F; outline-offset: 3px; }

    /* fallback focus outline */
    .focus-outline:focus-visible { outline: 2px solid #1D1D1F; outline-offset: 2px; }
  `}</style>
);

const Button = ({ className, variant = "default", size = "default", onClick, children, ...props }) => {
  const localRef = useRef(null);

  const handleClick = (e) => {
    const btn = localRef.current;
    if (!btn) return;

    // Add bounce animation
    btn.classList.add("btn-bounce-anim");
    window.setTimeout(() => btn.classList.remove("btn-bounce-anim"), 300);

    if (onClick) onClick(e);
  };

  const variantClasses = {
    default: "bg-gray-900 text-white",
    outline: "border-2 border-gray-900 bg-white text-gray-900",
    ghost: "bg-transparent text-gray-900",
  };

  const sizeClasses = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
  };

  const classes = cn(
    "btn-base inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  return (
    <button ref={localRef} onClick={handleClick} className={classes} {...props}>
      {children}
    </button>
  );
};

const Navigation = ({ brand = "Radius", onSignIn }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (menuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [menuOpen]);

  useEffect(() => {
    const onDoc = (e) => {
      if (!menuOpen) return;
      if (menuRef.current && !menuRef.current.contains(e.target) && triggerRef.current && !triggerRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen && triggerRef.current) triggerRef.current.focus();
  }, [menuOpen]);

  const navItems = [
    { id: "features", label: "Features" },
    { id: "how-it-works", label: "How It Works" },
    { id: "about", label: "About" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <a href="/" className="text-xl font-bold tracking-tight transition-opacity">
              {brand}
            </a>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a key={item.id} href={`#${item.id}`} onClick={addClickAnimation} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors focus-outline">
                {item.label}
              </a>
            ))}

            <Button size="sm" variant="default" className="focus-outline" onClick={(e) => {
              addClickAnimation(e);
              onSignIn?.();
            }}>
              Sign In
            </Button>
          </div>

          {/* Mobile */}
          <div className="md:hidden relative">
            <Button
              size="sm"
              variant="ghost"
              className="font-medium focus-outline"
              onClick={(e) => {
                addClickAnimation(e);
                setMenuOpen((s) => !s);
              }}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-haspopup="menu"
              ref={triggerRef}
            >
              {menuOpen ? "Close" : "Menu"}
            </Button>

            {menuOpen && (
              <div
                id="mobile-menu"
                ref={menuRef}
                className="absolute right-0 mt-2 w-56 rounded-md border border-gray-200 bg-white/95 backdrop-blur-md p-3 shadow-lg"
                role="menu"
                aria-label="Mobile menu"
              >
                <div className="flex flex-col space-y-2">
                  {navItems.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="block px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors rounded hover:bg-gray-50 focus-outline"
                      onClick={(e) => {
                        addClickAnimation(e);
                        setMenuOpen(false);
                      }}
                      role="menuitem"
                    >
                      {item.label}
                    </a>
                  ))}

                  <div className="pt-2 space-y-2">
                    <Button size="sm" variant="default" className="w-full justify-center focus-outline" onClick={(e) => { 
                      addClickAnimation(e);
                      setMenuOpen(false); 
                      onSignIn?.(); 
                    }}>
                      Sign In
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const Hero = ({ heroClassName, onTryForFree }) => {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 pt-32 pb-24 md:pt-40 md:pb-32" aria-labelledby="hero-heading">
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        <h1 id="hero-heading" className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter leading-tight animate-fade-in-up mb-6">
          Lead Generation For Your
          <br />
          <span className="relative inline-block">
            <span className={cn(heroClassName ?? "", "font-normal text-5xl sm:text-6xl md:text-7xl")}>
              Opportunity
            </span>
            <svg className="hero-underline" viewBox="0 0 170 30" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" aria-hidden="true">
              <path d="M2 9C32.8203 5.34032 108.769 -0.881146 166 3.51047" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.9" />
            </svg>
          </span>{" "}
          of Success
        </h1>

        <div className="max-w-2xl mx-auto mb-9 animate-fade-in-up animate-fade-in-up-delay-1">
          <p className="text-base sm:text-lg text-gray-600 leading-snug">
            Streamline your recruitment workflow with intelligent job scraping,
            AI-powered prep guides, and automated lead management.
          </p>
        </div>

        <div className="animate-fade-in-up animate-fade-in-up-delay-2">
          <Button size="lg" variant="default" className="px-8 py-6 text-base rounded-lg focus-outline" onClick={() => onTryForFree?.()}>
            Get Started Free
          </Button>
        </div>
      </div>
    </section>
  );
};


const Features = () => {
  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      title: "Smart Job Scraping",
      description: "Automatically scrape job listings from multiple platforms with intelligent parsing.",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "AI Prep Guides",
      description: "Generate personalized interview preparation guides powered by AI.",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "Analytics Dashboard",
      description: "Track your leads, conversions, and success rates in real-time.",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      title: "Lead Management",
      description: "Organize and track candidates with powerful CRM-like features.",
    },
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything you need to succeed
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to streamline your recruitment workflow
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4 text-gray-900">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Create Scrape Jobs",
      description: "Set up automated job scraping with custom search parameters and filters.",
    },
    {
      number: "02",
      title: "Collect Leads",
      description: "Let Radius automatically gather job listings and candidate information.",
    },
    {
      number: "03",
      title: "Generate Prep Guides",
      description: "Use AI to create personalized interview preparation materials instantly.",
    },
    {
      number: "04",
      title: "Track & Convert",
      description: "Manage your pipeline and convert leads with built-in CRM tools.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How Radius Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Four simple steps to transform your recruitment process
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="mb-4">
                <span className="text-5xl font-bold text-gray-200">
                  {step.number}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 -right-4 w-8 h-0.5 bg-gray-200" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const About = () => {
  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          Built for Modern Recruiters
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed mb-8">
          Radius combines cutting-edge web scraping technology with AI-powered insights
          to help you find and engage with the best candidates faster. Our platform
          automates the tedious parts of recruitment so you can focus on what matters:
          building relationships and making great hires.
        </p>
        <div className="flex flex-wrap justify-center gap-8 mt-12">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">10K+</div>
            <div className="text-gray-600">Jobs Scraped Daily</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">95%</div>
            <div className="text-gray-600">Accuracy Rate</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">24/7</div>
            <div className="text-gray-600">Automated Monitoring</div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xl font-bold text-gray-900">
            Radius
          </div>
          <div className="text-sm text-gray-600">
            © 2026 Radius. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Privacy
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Terms
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <LocalStyles />
      <Navigation brand="Radius" onSignIn={onGetStarted} />
      <Hero onTryForFree={onGetStarted} />
      <Features />
      <HowItWorks />
      <About />
      <Footer />
    </div>
  );
};

export default LandingPage;
