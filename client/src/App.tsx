import { useState } from 'react';
import { ThemeProvider } from './components/ThemeProvider';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { TranscriptionSection } from './components/TranscriptionSection';
import { TrendingNotes } from './components/TrendingNotes';
import { ThumbnailSection } from './components/ThumbnailSection';
import { TrendingTags } from './components/TrendingTags';
import { ChatbotFullScreen } from './components/ChatbotFullScreen';
import { ChatbotButton } from './components/ChatbotButton';
import { LearningJourney } from './components/LearningJourney';
import { MarketplacePage } from './components/MarketplacePage';
import { NotesCenter } from './components/NotesCenter';
import { LearningAnalytics } from './components/LearningAnalytics';
import { ServicesPage } from './components/ServicesPage';
import { AboutPage } from './components/AboutPage';
import { ContactPage } from './components/ContactPage';
import { PremiumPage } from './components/PremiumPage';
import { AdminPanel } from './components/AdminPanel';
import { LoginPage } from './components/Auth/LoginPage';
import { RegisterPage } from './components/Auth/RegisterPage';
import { ForgotPasswordPage } from './components/Auth/ForgotPasswordPage';
import { PremiumNewsletterPopup } from './components/PremiumNewsletterPopup';
import { Footer } from './components/Footer';
import { Toaster } from './components/ui/sonner';

type Section = 'home' | 'transcribe' | 'trending' | 'thumbnail' | 'tags' | 'chatbot' | 'playlist' | 'marketplace' | 'notes' | 'analytics' | 'services' | 'about' | 'contact' | 'premium' | 'admin' | 'login' | 'register' | 'forgot' | 'profile';

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  const handleAuthNavigation = (page: Section) => {
    setActiveSection(page);
    if (page === 'home') {
      setIsAuthenticated(true);
    }
  };

  const handleUpgradeToPremium = () => {
    setActiveSection('premium');
  };

  // Auth pages don't need header/footer
  if (activeSection === 'login') {
    return (
      <ThemeProvider>
        <LoginPage onNavigate={handleAuthNavigation} />
        <Toaster />
      </ThemeProvider>
    );
  }

  if (activeSection === 'register') {
    return (
      <ThemeProvider>
        <RegisterPage onNavigate={handleAuthNavigation} />
        <Toaster />
      </ThemeProvider>
    );
  }

  if (activeSection === 'forgot') {
    return (
      <ThemeProvider>
        <ForgotPasswordPage onNavigate={handleAuthNavigation} />
        <Toaster />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 transition-colors duration-500">
        <Header activeSection={activeSection} setActiveSection={setActiveSection} />
        
        <main className="relative">
          {activeSection === 'home' && <Hero setActiveSection={setActiveSection} />}
          {activeSection === 'transcribe' && <TranscriptionSection />}
          {activeSection === 'trending' && <TrendingNotes />}
          {activeSection === 'thumbnail' && <ThumbnailSection />}
          {activeSection === 'tags' && <TrendingTags />}
          {activeSection === 'chatbot' && <ChatbotFullScreen setActiveSection={setActiveSection} />}
          {activeSection === 'playlist' && <LearningJourney />}
          {activeSection === 'marketplace' && <MarketplacePage />}
          {activeSection === 'notes' && <NotesCenter />}
          {activeSection === 'analytics' && <LearningAnalytics />}
          {activeSection === 'services' && <ServicesPage />}
          {activeSection === 'about' && <AboutPage />}
          {activeSection === 'contact' && <ContactPage />}
          {activeSection === 'premium' && <PremiumPage />}
          {activeSection === 'admin' && <AdminPanel />}
        </main>

        <Footer setActiveSection={setActiveSection} />

        {/* Floating Chatbot Button - Only show when not on chatbot or auth pages */}
        {activeSection !== 'chatbot' && <ChatbotButton setActiveSection={setActiveSection} />}

        {/* Premium Newsletter Popup */}
        <PremiumNewsletterPopup 
          onUpgrade={handleUpgradeToPremium}
          isPremium={isPremium}
        />
        
        {/* Toast Notifications */}
        <Toaster />
      </div>
    </ThemeProvider>
  );
}