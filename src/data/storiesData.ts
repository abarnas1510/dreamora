import { SleepStory } from '../types';

export const SLEEP_STORIES: SleepStory[] = [
  {
    id: 'story-pines',
    title: 'The Whispering Pines of Haven Valley',
    subtitle: 'A gentle breeze through pine needles',
    description: 'Wander down a soft mossy path beneath a silent canopy of evergreen pines as dusk softly sets in.',
    durationMinutes: 5,
    lengthCategory: 'short',
    tags: ['Nature', 'Bedtime', 'Calm'],
    bgMusicType: 'forest',
    author: 'Evelyn Hart',
    coverGradient: 'from-emerald-900 via-teal-950 to-slate-950',
    iconName: 'Trees',
    fullNarrative: `Welcome to this peaceful bedtime story. Allow your shoulders to drop and your breath to slow down naturally.

Imagine standing at the wooden entrance of Haven Valley. The air is crisp and filled with the gentle, grounding scent of pine needles and damp moss. As you step onto the soft path, every step feels cushioned and light.

Above you, a gentle evening breeze whispers through the high evergreen branches. Listen to the steady rhythm of the wind moving through the needles... In, and out.

A winding stream trickles nearby, its clear water tumbling smoothly over polished grey stones. You rest your hand against the rough bark of an ancient fir tree, feeling completely grounded and supported by the earth.

With every breath you take, your mind grows still. The shadows of twilight stretch across the valley, inviting a sense of quiet stillness into your heart. You are safe, warm, and entirely free to rest.`,
    narratives: {
      en: `Welcome to this peaceful bedtime story. Allow your shoulders to drop and your breath to slow down naturally.

Imagine standing at the wooden entrance of Haven Valley. The air is crisp and filled with the gentle, grounding scent of pine needles and damp moss. As you step onto the soft path, every step feels cushioned and light.

Above you, a gentle evening breeze whispers through the high evergreen branches. Listen to the steady rhythm of the wind moving through the needles... In, and out.

With every breath you take, your mind grows still. The shadows of twilight stretch across the valley, inviting a sense of quiet stillness into your heart. You are safe, warm, and entirely free to rest.`,
      ta: `இந்த அமைதியான இரவு கதைகளுக்கு நல்வரவு. உங்கள் தோள்களைத் தளர்த்தி, மூச்சை இயல்பாக மெதுவாக்குங்கள்.

ஹேவன் பள்ளத்தாக்கின் மர நுழைவாயிலில் நிற்பதாகக் கற்பனை செய்து பாருங்கள். காற்றில் பைன் ஊசிகளின் நறுமணமும், குளிர்ந்த தென்றலும் வீசுகிறது. மென்மையான பாதையில் நீங்கள் வைக்கும் ஒவ்வொரு அடியும் மிகவும் இலகுவாக இருக்கிறது.

உங்களுக்கு மேலே, மாலைத் தென்றல் மரக்கிளைகளின் வழியே மெதுவாக வீசுகிறது. காற்றின் சீரான ஓசையைக் கவனியுங்கள்... உள்ளே, வெளியே.

நீங்கள் எடுக்கும் ஒவ்வொரு மூச்சிலும் உங்கள் மனம் அமைதியடைகிறது. அந்தி சாயும் நேரத்தின் நிழல்கள் பள்ளத்தாக்கில் பரவி, உங்கள் இதயத்தில் அமைதியைக் கொண்டுவருகின்றன. நீங்கள் பாதுகாப்பாகவும் கதகதப்பாகவும் இருக்கிறீர்கள்.`,
      te: `ఈ ప్రశాంతమైన రాత్రి కథకి స్వాగతం. మీ భుజాలను సడలించి, శ్వాసను సహజంగా నెమ్మదింపజేయండి.

హేవెన్ వ్యాలీ మರದ ప్రవేశద్వారం వద్ద నిలబడి ఉన్నట్లు ఊహించుకోండి. గాలిలో పైన్ ఆకుల సువాసన మరియు ఆహ్లాదకరమైన చల్లదనంతో నిండి ఉంది. మెత్తటి దారిపై మీరు వేసే ప్రతి అడుగు తేలికగా అనిపిస్తుంది.

మీ పైన, సాయంత్రం వీచే గాలి పచ్చని కొమ్మల గుండా నెమ్మదిగా శబ్దం చేస్తోంది. గాలి యొక్క స్థిరమైన లయను వినండి... లోపలికి, వెలుపలికి.

మీరు తీసుకునే ప్రతి శ్వాసతో, మీ మనస్సు ప్రశాంతంగా మారుతుంది. సంధ్యా ఛాయలు లోయ అంతటా పరుచుకుని మీ హృదయానికి ప్రశాంతతను ఇస్తాయి. మీరు సురక్షితంగా, వెచ్చగా ఉన్నారు.`,
      ml: `ഈ ശാന്തമായ രാത്രി കഥയിലേക്ക് സ്വാഗതം. നിങ്ങളുടെ തോളുകൾ അയച്ച് ശ്വാസം സ്വാഭാവികമായി പതുക്കെയാക്കുക.

ഹേവൻ വാലിയുടെ മര കവാടത്തിൽ നിൽക്കുന്നത് സങ്കൽപ്പിക്കുക. പൈൻ മരങ്ങളുടെ സുഗന്ധവും തണുത്ത കാറ്റും അന്തരീക്ഷത്തിൽ നിറഞ്ഞുനിൽക്കുന്നു. മൃദുവായ വഴിയിലൂടെ നിങ്ങളെടുക്കുന്ന ഓരോ ചുവടും വളരെ ലളിതമായി തോന്നുന്നു.

നിങ്ങൾക്ക് മുകളിൽ സന്ധ്യാകാറ്റ് പച്ചമരച്ചില്ലകളിലൂടെ മെല്ലെ വീശുന്നു. കാറ്റിന്റെ ശാന്തമായ താളം ശ്രദ്ധിക്കൂ... ഉള്ളിലേക്ക്, പുറത്തേക്ക്.

ഓരോ ശ്വാസത്തിലും നിങ്ങളുടെ മനസ്സ് ശാന്തമാകുന്നു. സന്ധ്യയുടെ നിഴലുകൾ താഴ്വരയിലുടനീളം പടർന്നു നിങ്ങളുടെ ഹൃദയത്തിലേക്ക് സമാധാനം കൊണ്ടുവരുന്നു. നിങ്ങൾ സുരക്ഷിതരാണ്.`,
      kn: `ಈ ಪ್ರಶಾಂತ ರಾತ್ರಿಯ ಕಥೆಗೆ ಸುಸ್ವಾಗತ. ನಿಮ್ಮ ಹೆಗಲುಗಳನ್ನು ಸಡಿಲಗೊಳಿಸಿ ಮತ್ತು ಉಸಿರಾಟವನ್ನು ನಿಧಾನಗೊಳಿಸಿ.

ಹೇವನ್ ವ್ಯಾಲಿಯ ಮರದ ದ್ವಾರದ ಬಳಿ ನಿಂತಿರುವುದನ್ನು ಕಲ್ಪಿಸಿಕೊಳ್ಳಿ. ಗಾಳಿಯಲ್ಲಿ ಪೈನ್ ಎಲೆಗಳ ಸುವಾಸನೆ ಮತ್ತು ಹಿತಕರ ತಂಪಿದೆ. ಮೆತ್ತನೆಯ ಹಾದಿಯಲ್ಲಿ ನಿಮ್ಮ ಪ್ರತಿಯೊಂದು ಹೆಜ್ಜೆಯೂ ಹಗುರವಾಗಿದೆ.

ನಿಮ್ಮ ಮೇಲೆ, ಸಂಜೆಯ ತಂಗಾಳಿಯು ಹಸಿರು ಕೊಂಬೆಗಳ ನಡುವೆ ಮೆಲ್ಲನೆ ಬೀಸುತ್ತಿದೆ. ಗಾಳಿಯ ನಿಯಮಿತ ಶಬ್ದವನ್ನು ಆಲಿಸಿ... ಒಳಗೆ, ಹೊರಗೆ.

ನೀವು ತೆಗೆದುಕೊಳ್ಳುವ ಪ್ರತಿಯೊಂದು ಉಸಿರಿನೊಂದಿಗೆ ನಿಮ್ಮ ಮನಸ್ಸು ಶಾಂತವಾಗುತ್ತದೆ. ಸಂಜೆಯ ನೆರಳುಗಳು ಕಣಿವೆಯಾದ್ಯಂತ ಹರಡಿ ನಿಮ್ಮ ಹೃದಯಕ್ಕೆ ಪ್ರಶಾಂತತೆಯನ್ನು ತರುತ್ತವೆ. ನೀವು ಸುರಕ್ಷಿತವಾಗಿದ್ದೀರಿ.`,
      hi: `इस शांत सोने की कहानी में आपका स्वागत है। अपने कंधों को ढीला छोड़ें और अपनी सांसों को स्वाभाविक रूप से धीमा होने दें।

कल्पना कीजिए कि आप हेवन वैली के लकड़ी के प्रवेश द्वार पर खड़े हैं। हवा में देवदार के पत्तों की ताज़ा और सुखद सुगंध भरी है। जैसे ही आप नरम रास्ते पर कदम रखते हैं, हर कदम बहुत हल्का महसूस होता है।

आपके ऊपर, शाम की ठंडी हवा घने पेड़ों की शाखाओं से होकर बह रही है। हवा की शांत लय को सुनें... अंदर और बाहर।

हर सांस के साथ, आपका मन शांत होता जा रहा है। शाम की गहरी होती छाया घाटी में शांति ला रही है। आप पूरी तरह से सुरक्षित हैं और आराम करने के लिए स्वतंत्र हैं।`
    },
    titles: {
      en: 'The Whispering Pines of Haven Valley',
      ta: 'ஹேவன் பள்ளத்தாக்கின் பைன் மரங்கள்',
      te: 'హేవెన్ వ్యాలీ పైన్ వృక్షాలు',
      ml: 'ഹേവൻ വാലിയിലെ പൈൻ മരങ്ങൾ',
      kn: 'ಹೇವನ್ ವ್ಯಾಲಿಯ ಪೈನ್ ಮರಗಳು',
      hi: 'हेवन वैली के देवदार के पेड़'
    }
  },
  {
    id: 'story-lake',
    title: 'Midnight Lake & Starlight Reflections',
    subtitle: 'Still waters under starry skies',
    description: 'Rest by a secluded alpine lake reflecting the brilliant expanse of the night constellation.',
    durationMinutes: 12,
    lengthCategory: 'medium',
    tags: ['Peaceful', 'Calm', 'Bedtime'],
    bgMusicType: 'waves',
    author: 'Julian Vance',
    coverGradient: 'from-indigo-950 via-purple-950 to-slate-950',
    iconName: 'Moon',
    fullNarrative: `Find a comfortable position, release any tension in your jaw, and let your eyes rest softly.

Tonight, we journey to a quiet alpine lake hidden deep within peaceful mountains. The surface of the water is as smooth as dark glass, reflecting a million tiny silver stars floating in the night sky.

A cool, serene air rests gently around you. You sit on a smooth wooden bench by the water's edge, wrapped in a soft blanket.

Tiny ripples lap rhythmically against the shore. Shhh... Shhh... With each gentle lap of water against the pebbles, any remaining worries from your day dissolve effortlessly into the night.

Looking up, you trace the arc of a shooting star as it glides softly across the dark canopy. The universe is quiet, infinite, and calm. Sink into the cushion, close your eyes, and let the gentle lake lull you into deep, restorative sleep.`,
    narratives: {
      en: `Find a comfortable position, release any tension in your jaw, and let your eyes rest softly.

Tonight, we journey to a quiet alpine lake hidden deep within peaceful mountains. The surface of the water is as smooth as dark glass, reflecting a million tiny silver stars floating in the night sky.

A cool, serene air rests gently around you. You sit on a smooth wooden bench by the water's edge, wrapped in a soft blanket.

Tiny ripples lap rhythmically against the shore. With each gentle lap of water against the pebbles, any remaining worries dissolve into the night. Close your eyes and rest peacefully.`,
      ta: `வசதியான நிலையை அமைத்துக் கொள்ளுங்கள், உங்கள் தாடையில் உள்ள பதற்றத்தைத் தளர்த்தி, கண்களை மெதுவாக மூடுங்கள்.

இன்று இரவு, அமைதியான மலைகளின் ஆழத்தில் அமைந்துள்ள ஏரிக்கு நாம் பயணிக்கிறோம். நீரின் பரப்பு இருண்ட கண்ணாடியைப் போல மென்மையாக இருக்கிறது, இரவின் லட்சக்கணக்கான நட்சத்திரங்களை பிரதிபலிக்கிறது.

குளிர்ந்த, அமைதியான காற்று உங்களைச் சுற்றி வீசுகிறது. நீங்கள் மென்மையான கம்பளியைப் போர்த்திக்கொண்டு ஏரிக்கரையில் அமர்ந்திருக்கிறீர்கள்.

சிறிய அலைகள் கரையில் மெதுவாக மோதுகின்றன. ஒவ்வொரு அலையின் ஓசையிலும் உங்கள் கவலைகள் அனைத்தும் இரவில் கரைகின்றன. கண்களை மூடி அமைதியாக ஓய்வெடுங்கள்.`,
      te: `సౌకర్యవంతమైన స్థితిని ఎంచుకోండి, మీ ముఖంలో ఉన్న ఒత్తిడిని తొలగించి, కళ్ళను ప్రశాంతంగా మూసుకోండి.

ఈ రాత్రి, ప్రశాంతమైన కొండల నడుమ ఉన్న ఒక ఏకాంత సరస్సు వద్దకు పయనిద్దాం. నీటి ఉపరితలం నల్లని అద్దంలా ఉంది, ఆకాశంలోని నక్షత్రాలను ప్రతిబింబిస్తోంది.

చల్లని, ప్రశాంతమైన గాలి మీ చుట్టూ వీస్తోంది. మీరు ఒడ్డున ఉన్న చెక్క బల్లపై మెత్తని దుప్పటి కప్పుకుని కూర్చున్నారు.

చిన్న అలలు ఒడ్డును తాకుతున్నాయి. ప్రతి అలల శబ్దంతో మీ ఆందోళనలు కరిగిపోతాయి. కళ్ళు మూసుకుని హాయిగా నిద్రపోండి.`,
      ml: `സൗകര്യപ്രദമായ ഒരു സ്ഥാനത്ത് ഇരിക്കുക, മുഖത്തെ സംഘർഷം അയച്ചു കണ്ണുകൾ പതുക്കെ അടയ്ക്കുക.

ഇന്ന് രാത്രി, ശാന്തമായ മലനിരകൾക്ക് ഉള്ളിലെ ഒരു തടാകത്തിലേക്ക് നമ്മൾ യാത്ര ചെയ്യുന്നു. ജല ഉപരിതലം ഇരുണ്ട ഗ്ലാസ് പോലെ മിനുസമുള്ളതാണ്, ആകാശത്തിലെ നക്ഷത്രങ്ങളെ അത് പ്രതിഫലിപ്പിക്കുന്നു.

തണുത്ത ശാന്തമായ കാറ്റ് നിങ്ങളുടെ ചുറ്റും വീശുന്നു. നിങ്ങൾ തടാകക്കരയിൽ ഒരു പുതപ്പ് പുതച്ചു ഇരിക്കുന്നു.

ചെറിയ തിരമാലകൾ തീരത്ത് മെല്ലെ തട്ടുന്നു. ഓരോ തിരമാലയുടെ ശബ്ദത്തിലും നിങ്ങളുടെ സങ്കടങ്ങൾ അലിഞ്ഞുപോകുന്നു. കണ്ണുകൾ അടച്ചു പ്രശാന്തമായി ഉറങ്ങുക.`,
      kn: `ಆರಾಮದಾಯಕ ಭಂಗಿಯಲ್ಲಿ ಕುಳಿತುಕೊಳ್ಳಿ, ನಿಮ್ಮ ಮುಖದ ಒತ್ತಡವನ್ನು ಸಡಿಲಗೊಳಿಸಿ ಕಣ್ಣುಗಳನ್ನು ಮೆಲ್ಲನೆ ಮುಚ್ಚಿ.

ಈ ರಾತ್ರಿ, ಪ್ರಶಾಂತ ಬೆಟ್ಟಗಳ ನಡುವಿರುವ ಏಕಾಂತ ಸರೋವರದತ್ತ ಪ್ರಯಾಣಿಸೋಣ. నీటి ಮೇಲ್ಮೈ ಕಪ್ಪು గాಜಿನಂತೆ ನಯವಾಗಿದೆ, ಆಕಾಶದ ನಕ್ಷತ್ರಗಳನ್ನು ಪ್ರತಿಬಿಂಬಿಸುತ್ತಿದೆ.

ತಂಪಾದ, ಪ್ರಶಾಂತ ಗಾಳಿ ನಿಮ್ಮ ಸುತ್ತಲೂ ಬೀಸುತ್ತಿದೆ. ನೀವು ತೀರದ ಮರದ ಬೆಂಚ್ ಮೇಲೆ ಬೆಚ್ಚನೆಯ ಹೊದಿಕೆಯನ್ನು ಹೊದ್ದು ಕುಳಿತಿದ್ದೀರಿ.

ಸಣ್ಣ ಅಲೆಗಳು ತೀರಕ್ಕೆ ಮೆಲ್ಲನೆ ಅಪ್ಪಳಿಸುತ್ತಿವೆ. ಅಲೆಗಳ ನಯವಾದ ಶಬ್ದದೊಂದಿಗೆ ನಿಮ್ಮ ಆತಂಕಗಳು ಕರಗಿಹೋಗುತ್ತವೆ. ಕಣ್ಣು ಮುಚ್ಚಿ ಪ್ರಶಾಂತವಾಗಿ ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ.`,
      hi: `एक आरामदायक स्थिति बनाएं, अपने जबड़े और चेहरे के तनाव को छोड़ दें और आंखें धीरे से बंद कर लें।

आज रात, हम शांत पहाड़ियों के बीच छिपी एक झील की यात्रा करते हैं। पानी की सतह कांच की तरह साफ है, जो रात के आसमान के लाखों सितारों को चमका रही है।

एक ठंडी, शांत हवा आपके चारों ओर बह रही है। आप एक नरम कंबल में लिपटे झील के किनारे बैठे हैं।

छोटी लहरें किनारे से टकरा रही हैं। पानी की हर धीमी थपकी के साथ, आपकी बची हुई चिंताएं दूर हो रही हैं। अपनी आंखें बंद करें और गहरी नींद में सो जाएं।`
    },
    titles: {
      en: 'Midnight Lake & Starlight Reflections',
      ta: 'நள்ளிரவு ஏரியும் நட்சத்திர பிரதிபலிப்பும்',
      te: 'మిడ్ నైట్ లేక్ & స్టార్ లైట్ రిఫ్లెక్షన్స్',
      ml: 'പാതിരാ തടാകവും നക്ഷത്ര വെളിച്ചവും',
      kn: 'ಮಧ್ಯರಾತ್ರಿಯ ಸರೋವರ ಮತ್ತು ನಕ್ಷತ್ರಗಳು',
      hi: 'आधी रात की झील और तारों की छांव'
    }
  },
  {
    id: 'story-train',
    title: 'Journey on the Sleep Lantern Express',
    subtitle: 'A midnight train through rolling hills',
    description: 'Glide softly through dark countryside inside a warm amber carriage illuminated by lantern light.',
    durationMinutes: 22,
    lengthCategory: 'longer',
    tags: ['Bedtime', 'Stress Relief', 'Calm'],
    bgMusicType: 'ambient',
    author: 'Clara Beaumont',
    coverGradient: 'from-amber-950 via-purple-950 to-slate-950',
    iconName: 'Sparkles',
    fullNarrative: `Step inside the warm, wood-paneled carriage of the Sleep Lantern Express.

Soft brass lanterns cast a warm golden glow across deep velvet seating. As you settle into your compartment, you wrap a heavy wool blanket around your shoulders and rest your head against a plush pillow.

The train begins to glide smoothly out of the station. Outside your window, rolling green hills pass quietly under a silver crescent moon.

Click-clack... Click-clack... The steady, rhythmic hum of the steel wheels cradles your body with a gentle rocking motion. Every sway of the train carries away a layer of tiredness, replacing it with deep comfort.

The carriage is quiet and peaceful. Warm rain begins to trace delicate patterns down the glass windowpane. You close your eyes, trusting the journey ahead, and let the rhythmic cadence of the train lead you straight into dreams.`,
    narratives: {
      en: `Step inside the warm, wood-paneled carriage of the Sleep Lantern Express.

Soft brass lanterns cast a warm golden glow across velvet seating. As you settle in, wrap a heavy wool blanket around your shoulders and rest your head on a soft pillow.

The train glides smoothly through the night. Outside, rolling hills pass quietly under the silver moon.

The steady rhythm of the wheels cradles your body with a gentle rocking motion. You close your eyes, completely relaxed and ready for deep sleep.`,
      ta: `ஸ்லீப் லேண்டர்ன் எக்ஸ்பிரஸின் வெதுவெதுப்பான மரத்தாலான பெட்டிக்குள் நுழையுங்கள்.

மென்மையான விளக்குகள் வெல்வெட் இருக்கைகளில் தங்க ஒளியை வீசுகின்றன. கம்பளிப் போர்வையைப் போர்த்திக்கொண்டு உங்கள் தலையை மென்மையான தலையணையில் சாயுங்கள்.

ரயில் இரவின் அமைதியில் மென்மையாக நகர்கிறது. வெளியே, வெள்ளி நிலவின் கீழ் மரங்களும் குன்றுகளும் அமைதியாகக் கடந்து செல்கின்றன.

ரயிலின் சீரான ஓசை உங்கள் உடலைத் தாலாட்டுகிறது. உங்கள் கண்களை மூடி, முழுமையான அமைதியில் ஆழுங்கள்.`,
      te: `స్లీప్ లాంతర్న్ ఎక్స్‌ప్రెస్ వెచ్చని కలప పెట్టెలోకి అడుగు పెట్టండి.

దీపాల కాంతి వేల్వెట్ సీట్లపై బంగారు వెలుగును పరుస్తోంది. మెత్తటి దుప్పటి కప్పుకుని, దిండుపై తల వాల్చండి.

రైలు రాత్రి ప్రశాంతతలో నెమ్మదిగా సాగిపోతోంది. కిటికీ వెలుపల వెండి నెలవంక కింద కొండలు ప్రశాంతంగా కనిపిస్తున్నాయి.

రైలు యొక్క లయాత్మక శబ్దం మిమ్మల్ని జోలపాడుతున్నట్లు ఉంది. కళ్ళు మూసుకుని ప్రశాంతమైన నిద్రలోకి జారడండి.`,
      ml: `സ്ലീപ്പ് ലാന്റേൺ എക്സ്പ്രസിന്റെ തടിയുടെ കംപാർട്ട്മെന്റിലേക്ക് കടക്കുക.

ചെറിയ വിളക്കുകൾ വെൽവെറ്റ് സീറ്റുകളിൽ സ്വർണ്ണ വെളിച്ചം ചൊരിയുന്നു. പുതപ്പ് പുതച്ചു തലയിണയിൽ തല ചായ്ക്കുക.

ട്രെയിൻ രാത്രിയിലൂടെ പതുക്കെ നീങ്ങുന്നു. വെള്ളി ചന്ദ്രന്റെ വെളിച്ചത്തിൽ പുറത്തെ കുന്നുകൾ കാണാം.

ട്രെയിനിന്റെ സീരമായ താളം നിങ്ങളെ ഉറക്കുന്നു. കണ്ണുകൾ അടച്ചു സുഖമായി ഉറങ്ങുക.`,
      kn: `ಸ್ಲೀಪ್ ಲ್ಯಾಂಟರ್ನ್ ಎಕ್ಸ್ಪ್ರೆಸ್ ನ ಬೆಚ್ಚಗಿನ ಬೋಗಿಯೊಳಗೆ ಹೆಜ್ಜೆ ಹಾಕಿ.

ದೀಪಗಳ ಬೆಳಕು ಮखमಲಿ ಆಸನಗಳ ಮೇಲೆ ಚಿನ್ನದ ಕಾಂತಿಯನ್ನು ಚೆಲ್ಲುತ್ತಿದೆ. ಬೆಚ್ಚನೆಯ ಹೊದಿಕೆಯನ್ನು ಹೊದ್ದು ಮೆತ್ತನೆಯ ದಿಂಬಿನ ಮೇಲೆ ತಲೆಯಿಡಿ.

ರೈಲು ರಾತ್ರಿಯ ಪ್ರಶಾಂತತೆಯಲ್ಲಿ ಮೆಲ್ಲನೆ ಸಾಗುತ್ತಿದೆ. ಕಿಟಕಿಯ ಹೊರಗೆ ಬೆಳ್ಳಿಯ ಚಂದ್ರನ ಕೆಳಗೆ ಬೆಟ್ಟಗಳು ಶಾಂತವಾಗಿ ಕಾಣಿಸುತ್ತಿವೆ.

ರೈಲಿನ ನಯವಾದ ಶಬ್ದವು మిమ్మల్ని ತೂಗಾಡಿಸುತ್ತಿದೆ. ಕಣ್ಣು ಮುಚ್ಚಿ ಆಳವಾದ ನಿದ್ರೆಗೆ ಜಾರಿ.`,
      hi: `स्लीप लालटेन एक्सप्रेस की गर्म, लकड़ी की बोगी में कदम रखें।

दीयों की धीमी रोशनी मखमली सीटों पर सुनहरी चमक बिखेर रही है। आप एक गर्म कंबल में खुद को लपेटते हैं और अपने सिर को तकिए पर टिकाते हैं।

ट्रेन रात के अंधेरे में धीरे-धीरे आगे बढ़ रही है। खिड़की के बाहर, चांदी के चांद के नीचे पहाड़ियां शांत दिख रही हैं।

ट्रेन की धीमी लय आपको सुला रही है। अपनी आंखें बंद करें और सपनों की दुनिया में चले जाएं।`
    },
    titles: {
      en: 'Journey on the Sleep Lantern Express',
      ta: 'ஸ்லீப் லேண்டர்ன் எக்ஸ்பிரஸ் பயணம்',
      te: 'స్లీప్ లాంతర్న్ ఎక్స్‌ప్రెస్ ప్రయాణం',
      ml: 'സ്ലീപ്പ് ലാന്റേൺ എക്സ്പ്രസ് യാത്ര',
      kn: 'ಸ್ಲೀಪ್ ಲ್ಯಾಂಟರ್ನ್ ಎಕ್ಸ್ಪ್ರೆಸ್ ಪ್ರಯಾಣ',
      hi: 'स्लीप लालटेन एक्सप्रेस की यात्रा'
    }
  },
  {
    id: 'story-rain',
    title: 'Secret Garden of Warm Rain',
    subtitle: 'Soft summer raindrops on lotus leaves',
    description: 'Find shelter under a peaceful stone pavilion as a warm summer shower waters lush garden leaves.',
    durationMinutes: 10,
    lengthCategory: 'medium',
    tags: ['Nature', 'Stress Relief', 'Peaceful'],
    bgMusicType: 'rain',
    author: 'Mei Lin',
    coverGradient: 'from-slate-900 via-cyan-950 to-slate-950',
    iconName: 'CloudRain',
    fullNarrative: `Take a deep, slow breath in... and let it fall away smoothly.

You are sitting comfortably beneath the dry stone arch of a tranquil, ancient garden pavilion. Outside, a warm summer rain shower begins to fall gently upon the garden.

Listen to the steady patter of raindrops falling softly onto broad green lotus leaves and smooth river pebbles. Patter... patter... patter...

The air is cool, fresh, and sweet with the scent of wet blossoms and cedar wood. A small koi pond reflects the gentle ripples of the rainfall.

Sitting here, dry and completely protected, you watch the rain wash clean the leaves and stones. With every passing droplet, your mind lets go of thoughts, holding only peace and quiet stillness.`,
    narratives: {
      en: `Take a deep, slow breath in... and let it fall away smoothly.

You are sitting beneath the dry stone arch of an ancient garden pavilion. Outside, a warm summer rain falls gently upon green garden leaves.

Listen to the steady patter of raindrops falling softly onto lotus leaves and river pebbles.

The air is cool and fresh with the scent of wet blossoms. Dry and protected, watch the rain wash everything clean. Your mind lets go of thoughts, holding only quiet peace.`,
      ta: `ஆழ்ந்த, மெதுவான மூச்சை உள்ளே இழுத்து... மெதுவாக வெளியே விடுங்கள்.

நீங்கள் ஒரு அமைதியான தோட்டத்தில் உள்ள கல் மண்டபத்தின் கீழ் அமர்ந்திருக்கிறீர்கள். வெளியே, மென்மையான கோடை மழை இலைகளின் மீது விழுகிறது.

தாமரை இலைகளின் மீது மழைத்துளிகள் விழும் ஓசையைக் கவனியுங்கள்.

காற்றில் ஈசிய மலர்களின் நறுமணம் வீசுகிறது. பாதுகாப்பாக அமர்ந்து மழையைக் ரசியுங்கள். உங்கள் மனம் அனைத்து கவலைகளையும் விட்டு அமைதியடைகிறது.`,
      te: `దీర్ఘ ప్రశాంత శ్వాస తీసుకోండి... నెమ్మదిగా వదలండి.

మీరు ఒక అందమైన తోటలోని రాతి మండపం కింద కూర్చున్నారు. వెలుపల, లేత వర్షం ఆకులపై పడుతోంది.

తామర ఆకులపై పడే వర్షపు చుక్కల లయాత్మక శబ్దాన్ని వినండి.

గాలిలో తడిచిన పూల సువాసన నిండి ఉంది. ప్రశాంతంగా కూర్చుని వర్షాన్ని తిలకించండి. మీ మనస్సులోని ఆలోచనలు తొలగి ప్రశాంతత చేకూరుతుంది.`,
      ml: `ഒരു ദീർഘവും ശാന്തവുമായ ശ്വാസമെടുക്കുക... പതുക്കെ പുറത്തുവിടുക.

നിങ്ങൾ മനോഹരമായ ഒരു തോട്ടത്തിലെ കൽ മണ്ഡപത്തിന് താഴെ ഇരിക്കുകയാണ്. പുറത്തു പെയ്യുന്ന മഴത്തുള്ളികൾ ഇലകളിൽ വീഴുന്നു.

താമരയിലകളിൽ വീഴുന്ന മഴയുടെ താളം ശ്രദ്ധിക്കൂ.

മഴ നനഞ്ഞ പൂക്കളുടെ സുഗന്ധം അന്തരീക്ഷത്തിലുണ്ട്. സുരക്ഷിതമായി ഇരുന്നു മഴ കാണുക. നിങ്ങളുടെ മനസ്സ് ശാന്തമാകുന്നു.`,
      kn: `ದೀರ್ಘ, ನಿಧಾನ ಉಸಿರನ್ನು ತೆಗೆದುಕೊಳ್ಳಿ... ಮೆಲ್ಲನೆ ಹೊರಬಿಡಿ.

ನೀವು ಸುಂದರ ತೋಟದ ಮಂಟಪದ ಕೆಳಗೆ ಕುಳಿತಿದ್ದೀರಿ. ಹೊರಗೆ, ಮಳೆಯ ಹನಿಗಳು ಹಸಿರು ಎಲೆಗಳ ಮೇಲೆ ಬೀಳುತ್ತಿವೆ.

ತಾವರೆ ಎಲೆಗಳ ಮೇಲೆ ಬೀಳುವ ಮಳೆಹನಿಗಳ ನಯವಾದ ಶಬ್ದವನ್ನು ಆಲಿಸಿ.

ಗಾಳಿಯಲ್ಲಿ ನೆನೆದ ಹೂವುಗಳ ಸುವಾಸನೆ ಇದೆ. ಪ್ರಶಾಂತವಾಗಿ ಕುಳಿತು ಮಳೆಯನ್ನು ವೀಕ್ಷಿಸಿ. ನಿಮ್ಮ ಮನಸ್ಸಿನ ಆತಂಕಗಳು ಕರಗಿ ಶಾಂತಿ ಸಿಗುತ್ತದೆ.`,
      hi: `एक गहरी, धीमी सांस लें... और इसे धीरे-धीरे बाहर छोड़ें।

आप एक शांत बगीचे के मंडप के नीचे बैठे हैं। बाहर, नरम बारिश हरे पत्तों पर गिर रही है।

कमल के पत्तों पर गिरती बारिश की बूंदों की आवाज़ सुनें।

हवा में भीगे हुए फूलों की ताज़ा खुशबू है। सुरक्षित बैठकर बारिश का आनंद लें। आपका मन सभी चिंताओं से मुक्त होकर शांत हो रहा है।`
    },
    titles: {
      en: 'Secret Garden of Warm Rain',
      ta: 'வெதுவெதுப்பான மழையின் ரகசிய தோட்டம்',
      te: 'సీక్రెట్ గార్డెన్ ఆఫ్ వార్మ్ రైన్',
      ml: 'മഴയുടെ രഹസ്യ ഉദ്യാനം',
      kn: 'ಮಳೆಯ ರಹಸ್ಯ ಉದ್ಯಾನವನ',
      hi: 'गर्म बारिश का गुप्त बगीचा'
    }
  },
  {
    id: 'story-ocean',
    title: 'Ocean Tide at Twilight',
    subtitle: 'Rhythmic waves on soft sand',
    description: 'Watch twilight colors fade across an endless ocean horizon as gentle waves lull you to rest.',
    durationMinutes: 6,
    lengthCategory: 'short',
    tags: ['Calm', 'Peaceful', 'Nature'],
    bgMusicType: 'waves',
    author: 'Marcus Oceanus',
    coverGradient: 'from-blue-950 via-indigo-950 to-slate-950',
    iconName: 'Waves',
    fullNarrative: `Feel the soft warmth of the sand beneath you as twilight turns the sky into deep shades of rose, amber, and indigo.

In front of you, the vast ocean reaches smoothly out toward the distant horizon. The waves move in a slow, eternal, comforting rhythm.

Inhaling gently as the wave rolls smoothly onto the shore...
Exhaling softly as the water recedes back into the ocean depths...

Each wave brings a soothing wave of warmth across your legs, torso, and shoulders. Your body feels light, as if floating effortlessly on calm waters.

Match your breathing to the rhythm of the tide. Allow the ocean's song to wash away all tension, guiding you into a serene and restorative sleep.`,
    narratives: {
      en: `Feel the soft warmth of the sand beneath you as twilight turns the sky into deep colors.

The vast ocean reaches out toward the horizon. The waves move in a slow, comforting rhythm.

Inhaling gently as the wave rolls onto the shore...
Exhaling softly as the water recedes into the ocean depths...

Your body feels light, as if floating on calm waters. Match your breathing to the rhythm of the tide and fall into peaceful sleep.`,
      ta: `அந்தி சாயும் வானத்தின் கீழ் மணலின் மென்மையான கதகதப்பை உணருங்கள்.

அமைதியான கடல் பரந்து விரிந்து கிடக்கிறது. அலைகள் மெதுவான, சீரான ஓசையில் வருகின்றன.

அலை கரையைத் தொடும் போது மெதுவாக மூச்சை உள்ளே இழுக்கவும்...
அலை பின்வாங்கும் போது மெதுவாக மூச்சை வெளியே விடவும்...

உங்கள் உடல் இலகுவாக உணர்கிறது. கடலின் ஓசையோடு உங்கள் மூச்சை இணைத்து அமைதியாகத் தூங்குங்கள்.`,
      te: `సంధ్యా సమయంలో తీరంలోని ఇసుక వెచ్చదనాన్ని అనుభవించండి.

ప్రశాంతమైన సముద్రం అంతులేకుండా కనిపిస్తోంది. అలలు నెమ్మదిగా, లయాత్మకంగా వస్తున్నాయి.

అల తీరాన్ని తాకినప్పుడు ప్రశాంతంగా శ్వాస తీసుకోండి...
అల వెనక్కి వెళ్ళినప్పుడు శ్వாస వదలండి...

మీ శరీరం తేలికగా అనిపిస్తుంది. సముద్రపు శబ్దంతో శ్వాసను కలిపి హాయిగా నిద్రపోండి.`,
      ml: `സന്ധ്യാസമയത്ത് തീരത്തെ മണലിന്റെ ചൂട് അനുഭവിച്ചറിയുക.

ശാന്തമായ കടൽ പരന്നു കിടക്കുന്നു. തിരമാലകൾ പതുക്കെ വരുന്നു.

തിരമാല തീരമണിയുമ്പോൾ ശ്വാസമെടുക്കുക...
തിരമാല പിൻവാങ്ങുമ്പോൾ ശ്വാസം വിടുക...

നിങ്ങളുടെ ശരീരം ലളിതമായി തോന്നുന്നു. കടലിന്റെ താളത്തിൽ ഉറങ്ങുക.`,
      kn: `ಸಂಜೆ ಸಮುದ್ರ ತೀರದ ಮರಳಿನ ಬೆಚ್ಚಗಿನ ಸ್ಪರ್ಶವನ್ನು ಅನುಭವಿಸಿ.

ಪ್ರಶಾಂತ ಸಮುದ್ರವು ವಿಶಾಲವಾಗಿ ಹರಡಿದೆ. ಅಲೆಗಳು ನಿಧಾನವಾಗಿ, ನಯವಾಗಿ ಬರುತ್ತವೆ.

ಅಲೆ ತೀರವನ್ನು ಮುಟ್ಟಿದಾಗ ಮೆಲ್ಲನೆ ಉಸಿರೆಳೆದುಕೊಳ್ಳಿ...
ಅಲೆ ಹಿಂದೆ ಹೋದಾಗ ಉಸಿರು ಬಿಡಿ...

ನಿಮ್ಮ ದೇಹವು ಹಗುರವೆನಿಸುತ್ತದೆ. ಸಮುದ್ರದ ನಯವಾದ ಶಬ್ದಕ್ಕೆ ಮನಸೋತು ನಿದ್ರಿಸಿ.`,
      hi: `शाम ढलते ही अपने नीचे की रेत की नरम गर्माहट को महसूस करें।

विशाल समुद्र दूर तक फैला है। लहरें एक धीमी, आरामदायक लय में चल रही हैं।

जब लहर किनारे पर आए तो सांस अंदर लें...
जब लहर पीछे हटे तो सांस बाहर छोड़ें...

आपका शरीर हल्का महसूस कर रहा है। समुद्र के इस संगीत के साथ गहरी नींद में सो जाएं।`
    },
    titles: {
      en: 'Ocean Tide at Twilight',
      ta: 'அந்தி நேரக் கடல் அலைகள்',
      te: 'సంధ్యా సముద్ర తీరం',
      ml: 'സന്ധ്യാനgather അലകൾ',
      kn: 'ಸಂಜೆಯ ಸಮುದ್ರದ ಅಲೆಗಳು',
      hi: 'शाम की समुद्री लहरें'
    }
  },
  {
    id: 'story-observatory',
    title: 'The Ancient Celestial Observatory',
    subtitle: 'Distant galaxies & quiet cosmos',
    description: 'Look out through open stone arches at drifting nebulae from a peaceful mountain summit.',
    durationMinutes: 18,
    lengthCategory: 'longer',
    tags: ['Bedtime', 'Calm', 'Stress Relief'],
    bgMusicType: 'piano',
    author: 'Astrid Thorne',
    coverGradient: 'from-violet-950 via-slate-950 to-indigo-950',
    iconName: 'Compass',
    fullNarrative: `High atop a quiet, misty mountain ridge stands the Ancient Celestial Observatory.

Smooth marble arches frame a open dome looking directly into the vast cosmic expanse. Soft piano notes reverberate gently off the ancient stone walls.

Beyond the arches, swirling violet and deep blue nebulae drift slowly across infinite space. Glowing celestial constellations light up the night like cosmic lanterns.

You lie down on a plush lounge chair positioned beneath the observatory dome. A soft breeze touches your forehead with cool, soothing air.

As you gaze at the quiet majesty of the stars, you feel a deep sense of stillness. You are safe, supported, and a part of this quiet universe. Let go, close your eyes, and sleep deeply.`,
    narratives: {
      en: `High atop a quiet mountain ridge stands the Ancient Celestial Observatory.

Stone arches frame an open dome looking directly into the vast cosmic expanse. Soft notes echo gently off ancient walls.

Beyond the arches, violet nebulae drift slowly across infinite space. Constellations light up the night.

Lie back and gaze at the majesty of the stars. Feel a deep sense of stillness. You are safe and supported. Close your eyes and sleep deeply.`,
      ta: `அமைதியான மலை உச்சியில் இந்த பழங்கால விண்வெளி அரங்கம் அமைந்துள்ளது.

கற் வளைவுகள் திறந்த வெளி விண்வெளியை நோக்குகின்றன. மென்மையான இசை சுவர்களில் எதிரொலிக்கிறது.

அங்கே, ஊதா நிற விண்மீன் திரள்கள் விண்வெளியில் மெதுவாக நகர்கின்றன. நட்சத்திரங்கள் இரவை ஒளிரச் செய்கின்றன.

அமைதியாகச் சாய்ந்து நட்சத்திரங்களின் அழகை ரசியுங்கள். ஆழ்ந்த அமைதியை உணருங்கள். கண்களை மூடி ஆழமாகத் தூங்குங்கள்.`,
      te: `ప్రశాంతమైన కొండ శిఖరంపై పురాతన నక్షత్ర పరిశీలనా కేంద్రం ఉంది.

రాతి తోరణాల గుండా విశాల విశ్వం కనిపిస్తోంది. సన్నని సంగీతం ప్రశాంతంగా వినిపిస్తోంది.

అనంత విశ్వంలో నీలి రంగు నక్షత్ర రాశులు నెమ్మదిగా కదులుతున్నాయి.

హాయిగా పడుకుని నక్షత్రాల సౌందర్యాన్ని వీక్షించండి. ప్రశాంతతను అనుభవించండి. కళ్ళు మూసుకుని ప్రశాంతమైన నిద్రలోకి జారడండి.`,
      ml: `ശാന്തമായ മലമുകളിൽ പുരാതന നക്ഷത്ര നിരീക്ഷണ കേന്ദ്രം സ്ഥിതിചെയ്യുന്നു.

കൽ വളവുകളിലൂടെ ആകാശം കാണാം. മെല്ലെയുള്ള സംഗീതം പ്രതിധ്വനിക്കുന്നു.

നക്ഷത്രങ്ങൾ ആകാശത്തു ശോഭിക്കുന്നു.

കിടന്നു നക്ഷത്രങ്ങളെ കാണുക. ശാന്തത അനുഭവിക്കുക. കണ്ണുകൾ അടച്ചു ഉറങ്ങുക.`,
      kn: `ಪ್ರಶಾಂತ ಬೆಟ್ಟದ ತುದಿಯಲ್ಲಿ ಪುರಾತನ ನಕ್ಷತ್ರ ನಿರೀಕ್ಷಣಾಲಯವಿದೆ.

ಕಲ್ಲಿನ ಕಮಾನುಗಳು ವಿಶಾಲ ಆಕಾಶವನ್ನು ತೋರಿಸುತ್ತವೆ. ಮೆತ್ತನೆಯ ಸಂಗೀತವು ಪ್ರತಿಧ್ವನಿಸುತ್ತದೆ.

ಆಕಾಶದಲ್ಲಿ ನಕ್ಷತ್ರಗಳು ಹೊಳೆಯುತ್ತಿವೆ.

ಪ್ರಶಾಂತವಾಗಿ ಮಲಗಿ ನಕ್ಷತ್ರಗಳ ಸೌಂದರ್ಯವನ್ನು ವೀಕ್ಷಿಸಿ. ಆಳವಾದ ಶಾಂತಿಯನ್ನು ಅನುಭವಿಸಿ. ಕಣ್ಣು ಮುಚ್ಚಿ ನಿದ್ರಿಸಿ.`,
      hi: `शांत पहाड़ी की चोटी पर एक प्राचीन खगोलीय वेधशाला है।

पत्थर के मेहराब विशाल अंतरिक्ष को दिखाते हैं। धीमी संगीत की धुन गूंज रही है।

तारों के समूह रात को रोशन कर रहे हैं।

आराम से लेटें और तारों की सुंदरता को देखें। गहरी शांति महसूस करें। आंखें बंद करें और सो जाएं।`
    },
    titles: {
      en: 'The Ancient Celestial Observatory',
      ta: 'பழங்கால விண்வெளி அரங்கம்',
      te: 'పురాతన నక్షత్ర పరిశీలనా కేంద్రం',
      ml: 'പുരാതന നക്ഷത്ര നിരീക്ഷണ കേന്ദ്രം',
      kn: 'ಪುರಾತನ ನಕ್ಷತ್ರ ನಿರೀಕ್ಷಣಾಲಯ',
      hi: 'प्राचीन खगोलीय वेधशाला'
    }
  }
];
