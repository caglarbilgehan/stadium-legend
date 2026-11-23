import type {
  DrumId,
  DrumMeta,
  GenreId,
  GenreTheme,
  MissionSpec,
  SpeakerId,
} from '../types/game';

/** Relative image paths so YouTube Playables bundles resolve cleanly offline */
export const STAGE_BACKDROPS: Record<'garage' | 'club' | 'arena', string> = {
  garage: './src/assets/images/stage_garage_keyart_1795476229337.jpg',
  club: './src/assets/images/stage_club_fest_1795476218967.jpg',
  arena: './src/assets/images/stage_world_arena_1795476218931.jpg',
};

export const SPEAKERS: Record<
  SpeakerId,
  { name: string; role: string; accent: string }
> = {
  batu: { name: 'Batu', role: 'Davulcu', accent: '#f59e0b' },
  ece: { name: 'Ece', role: 'Bas Gitarist', accent: '#10b981' },
  kaan: { name: 'Kaan', role: 'Gitar & Synth', accent: '#38bdf8' },
  turgut: { name: 'Turgut', role: 'Menajer', accent: '#fb7185' },
};

export const DRUMS: DrumMeta[] = [
  {
    id: 'crash',
    name: 'Crash Zil',
    shortName: 'Crash',
    keyHint: '1',
    roleTip: 'Parlak, patlayıcı vurgu zili — büyük girişlerde ve finallerde parlar.',
    colorHex: '#fbbf24',
    ringClass: 'ring-amber-400',
    badgeTextClass: 'text-amber-300',
  },
  {
    id: 'hihatOpen',
    name: 'Açık Hi-Hat',
    shortName: 'Açık HH',
    keyHint: '2',
    roleTip: 'Uzayan "tısss" sesiyle ritme nefes ve geçiş enerjisi katar.',
    colorHex: '#34d399',
    ringClass: 'ring-emerald-400',
    badgeTextClass: 'text-emerald-300',
  },
  {
    id: 'hihatClosed',
    name: 'Kapalı Hi-Hat',
    shortName: 'Kapalı HH',
    keyHint: '3',
    roleTip: 'Kısa ve net "tık" sesiyle temponun nabzını tutar.',
    colorHex: '#38bdf8',
    ringClass: 'ring-sky-400',
    badgeTextClass: 'text-sky-300',
  },
  {
    id: 'tom',
    name: 'Tom',
    shortName: 'Tom',
    keyHint: '4',
    roleTip: 'Dolgun ve melodik vuruşuyla geçiş (fill) ataklarının yıldızıdır.',
    colorHex: '#c084fc',
    ringClass: 'ring-purple-400',
    badgeTextClass: 'text-purple-300',
  },
  {
    id: 'snare',
    name: 'Trampet (Snare)',
    shortName: 'Snare',
    keyHint: '5',
    roleTip: 'Keskin ve çıtır sesiyle 2. ve 4. vuruşların (backbeat) omurgasıdır.',
    colorHex: '#fb7185',
    ringClass: 'ring-rose-400',
    badgeTextClass: 'text-rose-300',
  },
  {
    id: 'kick',
    name: 'Bas Davul (Kick)',
    shortName: 'Kick',
    keyHint: '6',
    roleTip: 'Derin ve tok "güm" sesiyle ritmin temel ağırlığını taşır.',
    colorHex: '#f97316',
    ringClass: 'ring-orange-400',
    badgeTextClass: 'text-orange-300',
  },
];

export const DRUM_BY_ID: Record<DrumId, DrumMeta> = DRUMS.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<DrumId, DrumMeta>
);

export const GENRE_THEMES: Record<GenreId, GenreTheme> = {
  rock: {
    id: 'rock',
    name: 'Rock / Alternatif',
    bandName: 'Kablo Karmaşası',
    tagline: 'Yüksek amfi, gümbürdeyen trampet ve garaj ruhu.',
    soundDescription: 'Güçlü bas davul, dolgun trampet ve parlak ziller.',
    accentHex: '#f59e0b',
    accentSoft: 'bg-amber-500/15',
    accentText: 'text-amber-300',
    accentBorder: 'border-amber-500/40',
    accentBg: 'bg-amber-500 hover:bg-amber-400 text-stone-950',
    stageTint: 'from-amber-950/55 via-stone-950/75 to-stone-950/95',
  },
  popfunk: {
    id: 'popfunk',
    name: 'Pop / Funk',
    bandName: 'Groove Bakkalı',
    tagline: 'Kıvrak bas yürüyüşleri, keskin trampet ve dans garantisi.',
    soundDescription: 'Sıkı funk trampeti, canlı açık hi-hat ve kıvrak senkop.',
    accentHex: '#fb7185',
    accentSoft: 'bg-rose-500/15',
    accentText: 'text-rose-300',
    accentBorder: 'border-rose-500/40',
    accentBg: 'bg-rose-500 hover:bg-rose-400 text-stone-950',
    stageTint: 'from-rose-950/50 via-stone-950/75 to-stone-950/95',
  },
  electronic: {
    id: 'electronic',
    name: 'Elektronik',
    bandName: '808 Komşuları',
    tagline: 'Derin sub-baslar, lazer hassasiyetinde ritimler.',
    soundDescription: '808 tarzı derin kick, keskin elektronik trampet ve synth bas.',
    accentHex: '#10b981',
    accentSoft: 'bg-emerald-500/15',
    accentText: 'text-emerald-300',
    accentBorder: 'border-emerald-500/40',
    accentBg: 'bg-emerald-500 hover:bg-emerald-400 text-stone-950',
    stageTint: 'from-emerald-950/50 via-slate-950/80 to-slate-950/95',
  },
  acoustic: {
    id: 'acoustic',
    name: 'Akustik',
    bandName: 'Tahta Kaşık Orkestrası',
    tagline: 'Sıcak ahşap tınılar, samimi sahne ve organik ritim.',
    soundDescription: 'Sıcak bas davul, yumuşak trampet ve doğal akustik denge.',
    accentHex: '#38bdf8',
    accentSoft: 'bg-sky-500/15',
    accentText: 'text-sky-300',
    accentBorder: 'border-sky-500/40',
    accentBg: 'bg-sky-400 hover:bg-sky-300 text-stone-950',
    stageTint: 'from-sky-950/45 via-stone-950/78 to-stone-950/95',
  },
};

export const GENRE_LIST: GenreTheme[] = [
  GENRE_THEMES.rock,
  GENRE_THEMES.popfunk,
  GENRE_THEMES.electronic,
  GENRE_THEMES.acoustic,
];

/**
 * Generates an educational, humorous ear-training hint when the player picks a wrong drum.
 */
export function getWrongAnswerHint(expected: DrumId, chosen: DrumId): string {
  if (expected === 'snare') {
    if (chosen === 'kick') {
      return 'Çok kalın kaçtı! Aradığımız vuruş tok değil, ortadan patlayan keskin ve çıtır bir ses.';
    }
    if (chosen === 'hihatClosed' || chosen === 'hihatOpen') {
      return 'Zil gibi tiz oldu ama eksik vuruşun gövdesi daha güçlü! Trampeti (Snare) bir dinle.';
    }
    return 'Yaklaştın ama eksik vuruş şarkının omurgasını kuran o keskin "çat" sesi — Trampet olabilir mi?';
  }

  if (expected === 'kick') {
    if (chosen === 'tom') {
      return 'Tom biraz daha melodik ve yüksek tınlıyor; aradığımız ses yerleri titreten en derin "güm" vuruşu!';
    }
    return 'Bu biraz ince kaldı! Ritimdeki en kalın, en derin ağırlığı veren Bas Davul (Kick) sesini dene.';
  }

  if (expected === 'hihatOpen') {
    if (chosen === 'hihatClosed') {
      return 'Çok yaklaştın! Aynı zil ama eksik vuruş hemen susmuyor, "tısss" diye uzayıp nefes alıyor.';
    }
    if (chosen === 'crash') {
      return 'Crash biraz fazla görkemli patladı! Daha kontrollü, uzayan bir zil sesi: Açık Hi-Hat.';
    }
    return 'Eksik vuruş metalik ve uzayan bir "tısss" tınısı taşıyor. Zillere kulak ver!';
  }

  if (expected === 'hihatClosed') {
    return 'Eksik vuruş çok kısa, tiz ve net bir tempo darbesi ("tık"). Kapalı Hi-Hat sesini test et.';
  }

  if (expected === 'tom') {
    if (chosen === 'kick') {
      return 'Bas davul kadar derin değil; daha yuvarlak, melodik bir geçiş (fill) sesi arıyoruz.';
    }
    return 'Geçişlerde yuvarlanan, gövdeli ama keskin tel sesi olmayan davul hangisiydi? Tomu dene!';
  }

  // crash
  if (chosen === 'hihatOpen') {
    return 'Açık Hi-Hat güzel ama aradığımız vuruş sahneyi parlatan çok daha büyük, patlayıcı bir zil!';
  }
  return 'Büyük vurguda sahneyi dolduran geniş, parlak metalik patlamayı arıyoruz — Crash Zili dinle!';
}

/**
 * Builds the 5-stage career missions customized to the player's chosen genre.
 */
export function getMissionsForGenre(genre: GenreId): MissionSpec[] {
  const genreFlavor: Record<
    GenreId,
    {
      s1Intro: string;
      s1Outro: string;
      s2Intro: string;
      s3Intro: string;
      s4Intro: string;
      s5Intro: string;
      bpmOffset: number;
    }
  > = {
    rock: {
      s1Intro: 'Amfiyi 11’e açtım ama bageti yumurta kolisine düşürdüm! 2. vuruştaki o sert darbeyi yakala.',
      s1Outro: 'Üst kattaki Cemil Amca süpürgeyle tavana vurdu — ritmi tutturmuş, bize tempo tutuyor!',
      s2Intro: 'Mahalle kafesinde espresso makinesiyle yarışıyoruz. Ritimdeki boşluğu kulakla doldur!',
      s3Intro: 'Üniversite şenliğinde sahne önü tıklım tıklım! Senkoplu vuruşu kaçırırsak gitar solosu boşa gider.',
      s4Intro: 'Canlı TV yayınındayız! Yönetmen "3, 2, 1" derken kabloya takıldım — iki vuruş birden kayıp!',
      s5Intro: 'Dünya Stadyumu finali! 50 bin kişi ışık açtı, bu efsane groove’un iki kritik vuruşunu tamamla!',
      bpmOffset: 0,
    },
    popfunk: {
      s1Intro: 'Funk yapıyoruz dedik, Ece o kadar havalı bas çaldı ki benim kafa karıştı! Eksik vuruşu kurtar.',
      s1Outro: 'Garajdaki kedi bile kafasını 2 ve 4’te sallamaya başladı. Funk resmen onaylandı!',
      s2Intro: 'Kafedeki baristalar kahve köpürtürken dans ediyor. Şu nefes aldıran zil vuruşunu bul!',
      s3Intro: 'Festivalde ışıklar disko topuna döndü! Groove’u zıplatan o gizli vuruşu yerine koy.',
      s4Intro: 'Stüdyoda canlı yayındayız ama kulaklığım tek taraftan çalıyor! İki kritik funk vuruşu eksik.',
      s5Intro: 'Dünya turnesi finali! Stadyumu zıplatacak son 16’lık funk kalıbını eksiksiz tamamla!',
      bpmOffset: 4,
    },
    electronic: {
      s1Intro: 'Drum machine’e çay döküldü, bir kanal sessize alındı! Kulakla duyup eksik vuruşu manuel tamamla.',
      s1Outro: 'Analog ruh kazandı! Çaylı devreler bile bu kadar temiz ritim üretmemişti.',
      s2Intro: 'Kafede lo-fi takılalım dedik ama millet rave bekliyor. Eksik vuruşu yakala da enerji düşmesin!',
      s3Intro: 'Üniversite şenliğinde dev LED ekranlar yanıyor. Drop öncesi eksik vuruşu tam yerine oturt!',
      s4Intro: 'Canlı yayında MIDI kablosu gevşedi! İki vuruş birden düştü, kulaklarınla kurtar bizi!',
      s5Intro: 'Dünya arenası final seti! 808 basları yeri titretirken eksik iki vuruşu hatasız yerleştir!',
      bpmOffset: 8,
    },
    acoustic: {
      s1Intro: 'Akustik takılıyoruz diye sessiz sanma — kapı gıcırtısı bile ritme girdi! Eksik vuruşu bul.',
      s1Outro: 'Komşular şikayete geldi ama melodiyi beğenip çay demlemeye gittiler. Tam isabet!',
      s2Intro: 'Mahalle kafesinde mikrofon sehpası eğildi, bir vuruş arada kaynadı. Hangi parça eksik?',
      s3Intro: 'Açık hava şenliğinde rüzgar notaları uçurdu! Şarkıyı parlatan o vurguyu kulakla yakala.',
      s4Intro: 'TV canlı akustik oturumdayız! Geçişteki iki vuruşu unutmuş gibi yapmayalım, hemen tamamla!',
      s5Intro: 'Stadyumda dev akustik final! On binlerce alkışın üstüne iki eksik vuruşu kusursuz yerleştir!',
      bpmOffset: -6,
    },
  };

  const flavor = genreFlavor[genre];

  return [
    // STAGE 1: Garage Rehearsal — 8 steps, 1 missing Snare (classic backbeat)
    {
      id: `${genre}_stage_1`,
      stageNumber: 1,
      venueName: 'Garaj Provası',
      missionTitle: 'Backbeat’in Doğuşu',
      difficultyLabel: 'Seviye 1 · Başlangıç',
      backdropKey: 'garage',
      bpm: 96 + flavor.bpmOffset,
      steps: 8,
      pattern: {
        kick: [0, 4],
        snare: [2, 6],
        hihatClosed: [0, 1, 2, 3, 4, 5, 6, 7],
      },
      bassLine: [40, null, 40, null, 43, null, 45, null],
      missingSlots: [{ step: 6, expectedDrum: 'snare' }],
      musicalLesson:
        '4. vuruştaki Trampet (Snare), modern müziğin "backbeat" dediğimiz kalp atışıdır. Dinleyicinin kafasını ve ayağını otomatik olarak ritme sokar!',
      successQuip: 'Garajın paslı kepengi bile ritimle titredi!',
      badge: {
        id: 'badge_backbeat',
        title: 'Backbeat Ustası',
        subtitle: 'Garaj provasını tek hamlede kurtardın',
        icon: 'snare',
      },
      introDialogue: [
        {
          speaker: 'batu',
          mood: 'shocked',
          text: flavor.s1Intro,
        },
        {
          speaker: 'ece',
          mood: 'grooving',
          text: 'Önce tam ritmi dinle, sonra eksik kalan vuruşu davul setinden test edip yerine koy!',
        },
      ],
      outroDialogue: [
        {
          speaker: 'kaan',
          mood: 'happy',
          text: flavor.s1Outro,
        },
        {
          speaker: 'turgut',
          mood: 'happy',
          text: 'Harika! Mahalle kafesinden ilk konser teklifini kaptım — ödeme iki tost ve sınırsız çay!',
        },
      ],
    },

    // STAGE 2: Neighborhood Cafe — 8 steps, 1 missing Open Hi-Hat (turnaround lift)
    {
      id: `${genre}_stage_2`,
      stageNumber: 2,
      venueName: 'Mahalle Kafesi',
      missionTitle: 'Nefes Alan Ziller',
      difficultyLabel: 'Seviye 2 · Kolay-Orta',
      backdropKey: 'club',
      bpm: 102 + flavor.bpmOffset,
      steps: 8,
      pattern: {
        kick: [0, 3, 4],
        snare: [2, 6],
        hihatClosed: [0, 1, 2, 3, 4, 5, 6],
        hihatOpen: [7],
      },
      bassLine: [45, null, null, 45, 48, null, 43, null],
      missingSlots: [{ step: 7, expectedDrum: 'hihatOpen' }],
      musicalLesson:
        'Ölçünün son "ve" vuruşundaki Açık Hi-Hat ("tısss"), bir sonraki ölçüye geçerken ritme ivme ve ferahlık kazandırır.',
      successQuip: 'Kafedeki herkes kahve fincanıyla tempo tutuyor!',
      badge: {
        id: 'badge_groove',
        title: 'Zil Fısıldayan',
        subtitle: 'Açık Hi-Hat geçişini kulaktan tanıdın',
        icon: 'groove',
      },
      introDialogue: [
        {
          speaker: 'turgut',
          mood: 'idle',
          text: 'Gençler, sahne 2 metrekare ama potansiyel sınırsız! Yalnız kabloya basmayın, tost makinesiyle aynı prizde.',
        },
        {
          speaker: 'batu',
          mood: 'shocked',
          text: flavor.s2Intro,
        },
      ],
      outroDialogue: [
        {
          speaker: 'ece',
          mood: 'happy',
          text: 'Ölçü sonundaki o açık hi-hat kalıbı resmen uçurdu! Barista bile bis istiyor.',
        },
        {
          speaker: 'turgut',
          mood: 'grooving',
          text: 'Telefon çaldı! Üniversite şenliği komitesi videomuzu görmüş, ana sahneye çıkıyoruz!',
        },
      ],
    },

    // STAGE 3: University Festival — 8 steps, 1 missing Syncopated Kick or Crash Accent
    {
      id: `${genre}_stage_3`,
      stageNumber: 3,
      venueName: 'Üniversite Şenliği',
      missionTitle: 'Senkop & Patlama',
      difficultyLabel: 'Seviye 3 · Orta',
      backdropKey: 'club',
      bpm: 108 + flavor.bpmOffset,
      steps: 8,
      pattern: {
        crash: [0],
        kick: [0, 3, 5],
        snare: [2, 6],
        hihatClosed: [1, 2, 3, 4, 5, 6, 7],
      },
      bassLine: [38, null, null, 38, null, 41, 43, null],
      missingSlots: [
        genre === 'rock' || genre === 'acoustic'
          ? { step: 0, expectedDrum: 'crash' }
          : { step: 5, expectedDrum: 'kick' },
      ],
      musicalLesson:
        genre === 'rock' || genre === 'acoustic'
          ? '1. vuruştaki Crash Zil, yeni bir bölümün veya nakaratın başladığını tüm dinleyicilere ilan eden görkemli vurgudur!'
          : 'Zayıf vuruşa yerleştirilen senkoplu Bas Davul (Kick), ritmi tekdüzelikten kurtarıp dinleyiciyi öne doğru çeken o dans hissini yaratır!',
      successQuip: 'Çimlerdeki binlerce öğrenci aynı anda zıpladı!',
      badge: {
        id: 'badge_sync',
        title: 'Senkop Dedektifi',
        subtitle: 'Şenlik kalabalığını tek vuruşla coşturdun',
        icon: 'sync',
      },
      introDialogue: [
        {
          speaker: 'kaan',
          mood: 'grooving',
          text: 'Şu kalabalığa bak! Garajda 3 ampulle başlamıştık, şimdi dev hoparlörler önümüzdeyiz!',
        },
        {
          speaker: 'batu',
          mood: 'shocked',
          text: flavor.s3Intro,
        },
      ],
      outroDialogue: [
        {
          speaker: 'batu',
          mood: 'happy',
          text: 'İşte bu! Kulaklık kabloma takılmadan tek parça halinde bitirdim, kişisel rekorum!',
        },
        {
          speaker: 'turgut',
          mood: 'happy',
          text: 'Sıkı durun: Yarın akşam ulusal TV’de canlı müzik programına konuğuz! Ütülü tişört bulun!',
        },
      ],
    },

    // STAGE 4: Live TV Broadcast Studio — 16 steps, 2 missing beats (Snare + Tom Fill!)
    {
      id: `${genre}_stage_4`,
      stageNumber: 4,
      venueName: 'Canlı Yayın Stüdyosu',
      missionTitle: 'Çift Vuruşlu Atak (Fill)',
      difficultyLabel: 'Seviye 4 · Zor · 2 Eksik',
      backdropKey: 'arena',
      bpm: 100 + Math.round(flavor.bpmOffset * 0.5),
      steps: 16,
      pattern: {
        kick: [0, 6, 8, 10],
        snare: [4, 12],
        hihatClosed: [0, 2, 4, 6, 8, 10, 12],
        tom: [14, 15],
      },
      bassLine: [
        40, null, null, null, 40, null, 43, null, 45, null, 43, null, 40, null,
        null, null,
      ],
      missingSlots: [
        { step: 4, expectedDrum: 'snare' },
        { step: 14, expectedDrum: 'tom' },
      ],
      musicalLesson:
        'Harika kulak! 2. vuruştaki Trampet ritmi sabitledi, ölçü sonundaki Tom atağı (fill) ise bir sonraki cümleye heyecanlı bir köprü kurdu.',
      successQuip: 'Kameraman ritme kapılıp çekimi dans ederek yaptı!',
      badge: {
        id: 'badge_fill',
        title: 'Atak Şampiyonu',
        subtitle: '16 adımlık canlı yayında iki eksik vuruşu çözdün',
        icon: 'fill',
      },
      introDialogue: [
        {
          speaker: 'turgut',
          mood: 'shocked',
          text: 'Kırmızı ışık yandı, milyonlar izliyor! Bu sefer 16’lık kalıpta İKİ ayrı vuruş eksik!',
        },
        {
          speaker: 'batu',
          mood: 'shocked',
          text: flavor.s4Intro,
        },
      ],
      outroDialogue: [
        {
          speaker: 'ece',
          mood: 'happy',
          text: 'Sosyal medyada "O tom geçişi neydi öyle?!" diye gündem olmuşuz!',
        },
        {
          speaker: 'turgut',
          mood: 'grooving',
          text: 'Hazırlanın çocuklar... Dünya Turnesi Finali için Stadyum’un ana grubu artık BİZİZ!',
        },
      ],
    },

    // STAGE 5: World Stadium Finale — 16 steps, 2 missing beats (Crash/Open HH + Syncopated Kick/Snare)
    {
      id: `${genre}_stage_5`,
      stageNumber: 5,
      venueName: 'Dünya Turnesi Finali',
      missionTitle: 'Stadyum Efsanesi',
      difficultyLabel: 'Seviye 5 · Final · 2 Eksik',
      backdropKey: 'arena',
      bpm: 106 + Math.round(flavor.bpmOffset * 0.5),
      steps: 16,
      pattern: {
        crash: [0],
        kick: [0, 3, 8, 11],
        snare: [4, 12],
        hihatClosed: [2, 4, 6, 8, 10, 12],
        hihatOpen: [14],
        tom: [15],
      },
      bassLine: [
        43, null, null, 43, null, null, 46, null, 48, null, null, 46, 43, null,
        null, null,
      ],
      missingSlots: [
        { step: 0, expectedDrum: 'crash' },
        { step: 14, expectedDrum: 'hihatOpen' },
      ],
      musicalLesson:
        'Ustalık seviyesi! 1. vuruştaki Crash Zil stadyum açılışını mühürlerken, 14. adımdaki Açık Hi-Hat tom atağından hemen önce gerilimi zirveye taşıdı!',
      successQuip: '50 bin kişi grubun adını haykırıyor — Dünya Yıldızı oldunuz!',
      badge: {
        id: 'badge_worldstar',
        title: 'Dünya Yıldızı',
        subtitle: 'Garajdan stadyuma tüm ritim görevlerini fethettin',
        icon: 'crown',
      },
      introDialogue: [
        {
          speaker: 'kaan',
          mood: 'happy',
          text: 'Garajdaki yumurta kolilerinden 50 bin kişilik stadyuma! Son büyük groove başlıyor!',
        },
        {
          speaker: 'batu',
          mood: 'grooving',
          text: flavor.s5Intro,
        },
      ],
      outroDialogue: [
        {
          speaker: 'batu',
          mood: 'happy',
          text: 'Başardık! Tek bir baget bile düşürmedim — tamam, son anda bir tane düştü ama seyirci şov sandı!',
        },
        {
          speaker: 'turgut',
          mood: 'happy',
          text: 'Efsane oldu! İstersen başka bir müzik tarzıyla yeni bir grup kurup dünya turnesini baştan fethet!',
        },
      ],
    },
  ];
}
