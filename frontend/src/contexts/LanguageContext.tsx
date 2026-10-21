import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    home: 'Home',
    demandLedger: 'Gaon Demand',
    microGigs: 'Kamao-Seekho',
    discover: 'Discover Careers',
    opportunities: 'Opportunities',
    bridgeFunding: 'Pehla Kadam Bridge',
    pravasKavach: 'Pravas Kavach',
    prepDojo: 'Prep Dojo',
    mySkills: 'Skill Passport',
    askMentor: 'Voice Mentor',
    facilitator: 'Facilitator',

    // Guided Tour Acts
    guidedTourTitle: "Priya's Journey (Guided Demo)",
    act1: 'Act 1: Village Need',
    act2: 'Act 2: Earn & Prove',
    act3: 'Act 3: ₹8,000 Barrier',
    act4: 'Act 4: Safe Transition',
    resetDemo: 'Reset Demo',
    chaupalSync: 'Chaupal Sync (Offline)',

    // Badges & Labels
    demoBadge: 'Illustrative Demo Mode',
    verified: 'Verified',
    simulatedCredits: 'Simulated Demo Credits',
  },
  hi: {
    // Navigation
    home: 'होम',
    demandLedger: 'गांव मांग लेजर',
    microGigs: 'कमाओ-सीखो',
    discover: 'करियर खोजें',
    opportunities: 'अवसर',
    bridgeFunding: 'पहला कदम ब्रिज',
    pravasKavach: 'प्रवास कवच',
    prepDojo: 'प्रिप डोजो',
    mySkills: 'स्किल पासपोर्ट',
    askMentor: 'आवाज मेंटर',
    facilitator: 'सुविधाप्रदाता',

    // Guided Tour Acts
    guidedTourTitle: 'प्रिया की यात्रा (गाइडेड डेमो)',
    act1: 'अंक 1: गांव की जरूरत',
    act2: 'अंक 2: कमाओ व साबित करो',
    act3: 'अंक 3: ₹8,000 की बाधा',
    act4: 'अंक 4: सुरक्षित प्रस्थान',
    resetDemo: 'डेमो रीसेट करें',
    chaupalSync: 'चौपाल सिंक (ऑफ़लाइन)',

    // Badges & Labels
    demoBadge: 'प्रदर्शनात्मक डेमो मोड',
    verified: 'सत्यापित',
    simulatedCredits: 'सिम्युलेटेड डेमो क्रेडिट',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (k) => k,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    return (localStorage.getItem('raahsetu_lang') as Language) || 'en';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('raahsetu_lang', newLang);
  };

  const t = (key: string): string => {
    return translations[lang][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
