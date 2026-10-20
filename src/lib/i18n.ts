export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'hi' | 'ta' | 'te' | 'bn' | 'mr' | 'gu' | 'kn' | 'ml' | 'pa';

export interface TranslationDictionary {
  nav: {
    home: string;
    cbti: string;
    monitor?: string;
    exercises: string;
    diary: string;
    daytime: string;
    profile: string;
  };
  headers: {
    daytimeTitle: string;
    sleepDiary: string;
    cbtiTherapy: string;
    exercisesTitle: string;
    profileTitle: string;
    dropThoughts: string;
    reflectOnThought: string;
    whatIsOnYourMind: string;
  };
  buttons: {
    listen: string;
    save: string;
    cancel: string;
    start: string;
    viewPlan: string;
    connectPlan: string;
    editProfile: string;
    logout: string;
  };
}

const defaultEn: TranslationDictionary = {
  nav: {
    home: 'Home',
    cbti: 'CBT-I',
    monitor: 'Monitor',
    exercises: 'Exercises',
    diary: 'Sleep Diary',
    daytime: 'Daytime',
    profile: 'Profile',
  },
  headers: {
    daytimeTitle: 'Daytime Activities',
    sleepDiary: 'Sleep Diary',
    cbtiTherapy: 'CBT-I Therapy',
    exercisesTitle: 'Exercises',
    profileTitle: 'My Profile & Preferences',
    dropThoughts: '💭 Drop Your Thoughts',
    reflectOnThought: 'Reflect on my thought',
    whatIsOnYourMind: "What's on your mind right now?",
  },
  buttons: {
    listen: 'Listen',
    save: 'Save',
    cancel: 'Cancel',
    start: 'Start',
    viewPlan: 'View Plan',
    connectPlan: 'Connect',
    editProfile: 'Edit Profile',
    logout: 'Log Out',
  },
};

export const TRANSLATIONS: Record<SupportedLanguage, TranslationDictionary> = {
  en: defaultEn,
  es: {
    ...defaultEn,
    nav: { ...defaultEn.nav, home: 'Inicio', cbti: 'TCC-I', monitor: 'Monitor', exercises: 'Ejercicios', diary: 'Diario de Sueño', daytime: 'Actividades', profile: 'Perfil' },
    headers: { ...defaultEn.headers, daytimeTitle: 'Actividades Diurnas', sleepDiary: 'Diario de Sueño', cbtiTherapy: 'Terapia TCC-I', exercisesTitle: 'Ejercicios', profileTitle: 'Mi Perfil y Preferencias', dropThoughts: '💭 Escribe tus Pensamientos', reflectOnThought: 'Reflexionar sobre mi pensamiento', whatIsOnYourMind: '¿Qué tienes en mente en este momento?' },
    buttons: { ...defaultEn.buttons, listen: 'Escuchar', save: 'Guardar', cancel: 'Cancelar', start: 'Iniciar', viewPlan: 'Ver Plan', connectPlan: 'Conectar', editProfile: 'Editar Perfil', logout: 'Cerrar Sesión' },
  },
  fr: {
    ...defaultEn,
    nav: { ...defaultEn.nav, home: 'Accueil', cbti: 'TCC-I', monitor: 'Moniteur', exercises: 'Exercices', diary: 'Journal de Sommeil', daytime: 'Activités', profile: 'Profil' },
    headers: { ...defaultEn.headers, daytimeTitle: 'Activités de Jour', sleepDiary: 'Journal de Sommeil', cbtiTherapy: 'Thérapie TCC-I', exercisesTitle: 'Exercices', profileTitle: 'Mon Profil & Préférences', dropThoughts: '💭 Déposez vos Pensées', reflectOnThought: 'Réfléchir à ma pensée', whatIsOnYourMind: "Qu'avez-vous en tête en ce moment ?" },
    buttons: { ...defaultEn.buttons, listen: 'Écouter', save: 'Enregistrer', cancel: 'Annuler', start: 'Démarrer', viewPlan: 'Voir le Plan', connectPlan: 'Connecter', editProfile: 'Modifier le Profil', logout: 'Se Déconnecter' },
  },
  de: {
    ...defaultEn,
    nav: { ...defaultEn.nav, home: 'Start', cbti: 'KBT-I', monitor: 'Monitor', exercises: 'Übungen', diary: 'Schlaftagebuch', daytime: 'Aktivitäten', profile: 'Profil' },
    headers: { ...defaultEn.headers, daytimeTitle: 'Tagesaktivitäten', sleepDiary: 'Schlaftagebuch', cbtiTherapy: 'KBT-I Therapie', exercisesTitle: 'Übungen', profileTitle: 'Mein Profil & Einstellungen', dropThoughts: '💭 Gedanken Aufschreiben', reflectOnThought: 'Über meinen Gedanken nachdenken', whatIsOnYourMind: 'Was geht Ihnen gerade durch den Kopf?' },
    buttons: { ...defaultEn.buttons, listen: 'Anhören', save: 'Speichern', cancel: 'Abbrechen', start: 'Starten', viewPlan: 'Plan Anzeigen', connectPlan: 'Verbinden', editProfile: 'Profil Bearbeiten', logout: 'Abmelden' },
  },
  zh: {
    ...defaultEn,
    nav: { ...defaultEn.nav, home: '首页', cbti: '失眠认知行为', monitor: '监测', exercises: '放松练习', diary: '睡眠日志', daytime: '日间活动', profile: '个人资料' },
  },
  ja: {
    ...defaultEn,
    nav: { ...defaultEn.nav, home: 'ホーム', cbti: 'CBT-I', monitor: 'モニター', exercises: 'エクササイズ', diary: '睡眠日誌', daytime: '日中アクティビティ', profile: 'プロフィール' },
  },
  hi: {
    ...defaultEn,
    nav: { ...defaultEn.nav, home: 'होम', cbti: 'सीबीटी-आई', monitor: 'मॉनिटर', exercises: 'व्यायाम', diary: 'स्लीप डायरी', daytime: 'दिन की गतिविधियां', profile: 'प्रोफ़ाइल' },
  },
  ta: {
    ...defaultEn,
    nav: { ...defaultEn.nav, home: 'முகப்பு', cbti: 'சிபிடி-ஐ', monitor: 'மானிட்டர்', exercises: 'பயிற்சிகள்', diary: 'தூக்க டைரி', daytime: 'பகல் நேர நடவடிக்கைகள்', profile: 'சுயவிவரம்' },
  },
  te: {
    ...defaultEn,
    nav: { ...defaultEn.nav, home: 'హోమ్', cbti: 'సిబిటి-ఐ', monitor: 'మానిటర్', exercises: 'వ్యామాలు', diary: 'నిద్ర డైరీ', daytime: 'పగటి కార్యకలాపాలు', profile: 'ప్రొఫైల్' },
  },
  bn: {
    ...defaultEn,
    nav: { ...defaultEn.nav, home: 'হোম', cbti: 'সিবিটি-আই', monitor: 'মনিটর', exercises: 'ব্যায়াম', diary: 'ঘুমের ডায়েরি', daytime: 'দিনের কার্যক্রম', profile: 'প্রোফাইল' },
  },
  mr: {
    ...defaultEn,
    nav: { ...defaultEn.nav, home: 'होम', cbti: 'सीबीटी-आय', monitor: 'मॉनिटर', exercises: 'व्यायाम', diary: 'स्लीप डायरी', daytime: 'दिवसाचे उपक्रम', profile: 'प्रोफाइल' },
  },
  gu: {
    ...defaultEn,
    nav: { ...defaultEn.nav, home: 'હોમ', cbti: 'સીબીટી-આઈ', monitor: 'મોનિટર', exercises: 'કસરતો', diary: 'સ્લીપ ડાયરી', daytime: 'દિવસની પ્રવૃત્તિઓ', profile: 'પ્રોફાઇલ' },
  },
  kn: {
    ...defaultEn,
    nav: { ...defaultEn.nav, home: 'ಹೋಮ್', cbti: 'ಸಿಬಿಟಿ-ಐ', monitor: 'ಮಾನಿಟರ್', exercises: 'ವ್ಯಾಯಾಮಗಳು', diary: 'ನಿದ್ರೆಯ ಡೈರಿ', daytime: 'ಹಗಲಿನ ಚಟುವಟಿಕೆಗಳು', profile: 'ಪ್ರೊಫೈಲ್' },
  },
  ml: {
    ...defaultEn,
    nav: { ...defaultEn.nav, home: 'ഹോം', cbti: 'സിബിടി-ഐ', monitor: 'മോണിറ്റർ', exercises: 'വ്യായാമങ്ങൾ', diary: 'സ്ലീപ്പ് ഡയറി', daytime: 'പകൽ പ്രവർത്തനങ്ങൾ', profile: 'പ്രൊഫൈൽ' },
  },
  pa: {
    ...defaultEn,
    nav: { ...defaultEn.nav, home: 'ਹੋਮ', cbti: 'ਸੀ.ਬੀ.ਟੀ-ਆਈ', monitor: 'ਮਾਨੀਟਰ', exercises: 'ਕਸਰਤਾਂ', diary: 'ਨੀਂਦ ਡਾਇਰੀ', daytime: 'ਦਿਨ ਦੀਆਂ ਗਤੀਵਿਧੀਆਂ', profile: 'ਪ੍ਰੋਫਾਈਲ' },
  },
};

export function getTranslations(lang: string = 'en'): TranslationDictionary {
  const code = (lang || 'en').toLowerCase().slice(0, 2) as SupportedLanguage;
  const dict = TRANSLATIONS[code] || TRANSLATIONS.en;
  return {
    ...dict,
    nav: {
      ...TRANSLATIONS.en.nav,
      ...(dict.nav || {}),
      monitor: dict.nav?.monitor || 'Monitor',
    },
  };
}

export function getBreathingPrompts(lang: string = 'en') {
  const code = (lang || 'en').toLowerCase().slice(0, 2);
  const prompts: Record<string, { breatheIn: string; hold: string; breatheOut: string }> = {
    hi: { breatheIn: 'धीरे से सांस अंदर लें...', hold: 'सांस रोकें...', breatheOut: 'धीरे से सांस बाहर छोड़ें...' },
    ta: { breatheIn: 'மெதுவாக மூச்சை உள்ளே இழுக்கவும்...', hold: 'பிடித்து வைக்கவும்...', breatheOut: 'மெதுவாக மூச்சை வெளியே விடவும்...' },
    te: { breatheIn: 'మెల్లగా ఊపిరి పీల్చుకోండి...', hold: 'అలాగే ఉంచండి...', breatheOut: 'మెల్లగా ఊపిరి వదలండి...' },
    bn: { breatheIn: 'আস্তে আস্তে শ্বাস নিন...', hold: 'ধরে রাখুন...', breatheOut: 'আস্তে আস্তে শ্বাস ছাড়ুন...' },
    mr: { breatheIn: 'हळूवार श्वास घ्या...', hold: 'श्वास रोखून ठेवा...', breatheOut: 'हळूवार श्वास सोडा...' },
    gu: { breatheIn: 'ધીમેથી શ્વાસ લો...', hold: 'શ્વાસ રોકો...', breatheOut: 'ધીમેથી શ્વાસ છોડો...' },
    kn: { breatheIn: 'ಮೆಲ್ಲನೆ ಉಸಿರೆಳೆದುಕೊಳ್ಳಿ...', hold: 'ಉಸಿರನ್ನು ತಡೆದು ಹಿಡಿಯಿರಿ...', breatheOut: 'ಮೆಲ್ಲನೆ ಉಸಿರು ಬಿಡಿ...' },
    ml: { breatheIn: 'പതിയെ ശ്വാസമെടുക്കുക...', hold: 'പിടിച്ചു വെക്കുക...', breatheOut: 'പതിയെ ശ്വാസം പുറത്തുവിടുക...' },
    pa: { breatheIn: 'ਹੌਲੀ-ਹੌਲੀ ਸਾਹ ਅੰਦਰ ਲਵੋ...', hold: 'ਸਾਹ ਰੋਕੋ...', breatheOut: 'ਹੌਲੀ-ਹੌਲੀ ਸਾਹ ਬਾਹਰ ਛੱਡੋ...' },
    es: { breatheIn: 'Inhala suavemente...', hold: 'Mantén la respiración...', breatheOut: 'Exhala lentamente...' },
    fr: { breatheIn: 'Inspirez doucement...', hold: 'Retenez votre souffle...', breatheOut: 'Expirez lentement...' },
    de: { breatheIn: 'Sanft einatmen...', hold: 'Halten...', breatheOut: 'Langsamer ausatmen...' },
    zh: { breatheIn: '缓慢深呼吸...', hold: '保持呼吸...', breatheOut: '平缓呼气...' },
    ja: { breatheIn: '息を深吸い込んで...', hold: '息を止めて...', breatheOut: 'ゆっくり息を吐き出して...' },
    en: { breatheIn: 'Breathe in gently...', hold: 'Hold...', breatheOut: 'Breathe out slowly...' },
  };
  return prompts[code] || prompts.en;
}
