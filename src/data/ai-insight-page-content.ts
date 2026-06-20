import type { LocaleCode } from "@/i18n";

export type AIInsightPageCopy = {
  title: string;
  subtitle: string;
  disclaimer: string;
  actions: {
    viewInsight: string;
    predictNow: string;
  };
  stats: {
    analyzedMatches: string;
    averageConfidence: string;
    upsetAlerts: string;
    communityVotes: string;
  };
  filters: {
    all: string;
    live: string;
    upcoming: string;
    highConfidence: string;
    upset: string;
  };
    labels: {
      featured: string;
      upsetAlert: string;
      confidence: string;
      heat: string;
      heatVeryLow: string;
      heatLow: string;
      heatMid: string;
      heatHigh: string;
      heatVeryHigh: string;
      likelyScore: string;
      predictedSource: string;
      predictedConfidence: string;
      expectedGoals: string;
      homeWin: string;
    draw: string;
    awayWin: string;
    form: string;
    rank: string;
    points: string;
    h2h: string;
    community: string;
    votes: string;
    keyFactors: string;
    generated: string;
    kickoff: string;
    live: string;
    upcoming: string;
    finished: string;
    postponed: string;
    cancelled: string;
    noInjuries: string;
    injuryImpact: string;
    home: string;
    away: string;
  };
  sections: {
    modelSummary: string;
    matchInsights: string;
    methodology: string;
  };
  empty: {
    title: string;
    description: string;
  };
  error: {
    title: string;
    description: string;
  };
  methodology: Array<{
    title: string;
    description: string;
  }>;
};

const aiInsightCopy: Record<LocaleCode, AIInsightPageCopy> = {
  th: {
    title: "AI Insight",
    subtitle:
      "สรุปมุมมองก่อนทายผลจากฟอร์มทีม ความน่าจะเป็น สถิติพบกัน อาการบาดเจ็บ และเสียงโหวตของชุมชน",
    disclaimer:
      "ข้อมูลนี้เป็นการวิเคราะห์เพื่อช่วยตัดสินใจ ไม่ใช่การรับประกันผลการแข่งขัน",
    actions: { viewInsight: "ดูอินไซต์", predictNow: "ไปทายผล" },
    stats: {
      analyzedMatches: "แมตช์ที่วิเคราะห์",
      averageConfidence: "ความมั่นใจเฉลี่ย",
      upsetAlerts: "แจ้งเตือนพลิกล็อก",
      communityVotes: "โหวตชุมชน",
    },
    filters: {
      all: "ทั้งหมด",
      live: "กำลังแข่ง",
      upcoming: "กำลังจะมา",
      highConfidence: "มั่นใจสูง",
      upset: "เสี่ยงพลิกล็อก",
    },
    labels: {
      featured: "แนะนำ",
      upsetAlert: "ระวังพลิกล็อก",
      confidence: "ความมั่นใจ",
      heat: "ความมันส์ของเกม",
      heatVeryLow: "💤 น่าเบื่อ — ข้างเดียว รู้ผลล่วงหน้า",
      heatLow: "😐 เบาๆ — ชัดเจนว่าใครเหนือกว่า",
      heatMid: "🤔 พอได้ — ห่างกันบ้าง มีตัวเต็ง",
      heatHigh: "⚡️ มันส์ — ใกล้เคียง ลุ้นสนุก",
      heatVeryHigh: "🔥 เดือดมาก — สูสีสุดๆ พลิกได้ทุกวินาที",
      likelyScore: "สกอร์ที่คาดว่า",
      predictedSource: "แหล่งที่มา",
      predictedConfidence: "ความมั่นใจสกอร์",
      expectedGoals: "xG",
      homeWin: "เจ้าบ้านชนะ",
      draw: "เสมอ",
      awayWin: "ทีมเยือนชนะ",
      form: "ฟอร์ม",
      rank: "อันดับ",
      points: "แต้ม",
      h2h: "สถิติเจอกัน",
      community: "เสียงชุมชน",
      votes: "โหวต",
      keyFactors: "ปัจจัยสำคัญ",
      generated: "อัปเดต",
      kickoff: "เวลาแข่ง",
      live: "สด",
      upcoming: "รอแข่ง",
      finished: "จบแล้ว",
      postponed: "เลื่อนแข่ง",
      cancelled: "ยกเลิก",
      noInjuries: "ไม่มีรายงาน",
      injuryImpact: "ผลกระทบตัวเจ็บ",
      home: "เจ้าบ้าน",
      away: "ทีมเยือน",
    },
    sections: {
      modelSummary: "ภาพรวมโมเดล",
      matchInsights: "อินไซต์การแข่งขัน",
      methodology: "AI อ่านเกมอย่างไร",
    },
    empty: {
      title: "ไม่พบอินไซต์",
      description: "ยังไม่มีบทวิเคราะห์ AI ที่มีข้อมูลครบถ้วน",
    },
    error: { title: "โหลด AI Insight ไม่สำเร็จ", description: "ระบบไม่สามารถเชื่อมต่อข้อมูล AI ได้ในขณะนี้" },
    methodology: [
      {
        title: "รวมหลายสัญญาณ",
        description: "ฟอร์มล่าสุด สถิติพบกัน ความพร้อมของผู้เล่น และความได้เปรียบสนามถูกถ่วงน้ำหนักร่วมกัน",
      },
      {
        title: "แยกความมั่นใจกับความเสี่ยง",
        description: "แมตช์ที่โอกาสสูสีหรือมีตัวแปรสูงจะแสดง heat และ upset alert ให้เห็นชัด",
      },
      {
        title: "ใช้เพื่อประกอบการทายผล",
        description: "อินไซต์ช่วยอ่านบริบท แต่ผู้ใช้ยังควรตัดสินใจจากข้อมูลและวิจารณญาณของตัวเอง",
      },
    ],
  },
  en: {
    title: "AI Insight",
    subtitle:
      "Pre-match context from team form, probabilities, head-to-head history, injury impact, and community sentiment.",
    disclaimer:
      "Insights support decision-making and do not guarantee match outcomes.",
    actions: { viewInsight: "View insight", predictNow: "Predict now" },
    stats: {
      analyzedMatches: "Analyzed matches",
      averageConfidence: "Average confidence",
      upsetAlerts: "Upset alerts",
      communityVotes: "Community votes",
    },
    filters: {
      all: "All",
      live: "Live",
      upcoming: "Upcoming",
      highConfidence: "High confidence",
      upset: "Upset risk",
    },
    labels: {
      featured: "Featured",
      upsetAlert: "Upset Alert",
      confidence: "Confidence",
      heat: "Match excitement",
      heatVeryLow: "💤 Boring — one-sided, outcome feels decided",
      heatLow: "😐 Light — clearly one side is stronger",
      heatMid: "🤔 Decent — some gap with a favorite",
      heatHigh: "⚡️ Exciting — close enough to be fun",
      heatVeryHigh: "🔥 Very heated — can flip any second",
      likelyScore: "Projected score",
      predictedSource: "Source",
      predictedConfidence: "Score confidence",
      expectedGoals: "xG",
      homeWin: "Home win",
      draw: "Draw",
      awayWin: "Away win",
      form: "Form",
      rank: "Rank",
      points: "Pts",
      h2h: "Head-to-head",
      community: "Community",
      votes: "votes",
      keyFactors: "Key factors",
      generated: "Updated",
      kickoff: "Kickoff",
      live: "Live",
      upcoming: "Upcoming",
      finished: "Finished",
      postponed: "Postponed",
      cancelled: "Cancelled",
      noInjuries: "No reports",
      injuryImpact: "Injury impact",
      home: "Home",
      away: "Away",
    },
    sections: {
      modelSummary: "Model Summary",
      matchInsights: "Match Insights",
      methodology: "How AI Reads the Match",
    },
    empty: {
      title: "No insights found",
      description: "No AI analyses with complete data are available yet.",
    },
    error: { title: "Unable to load AI Insight", description: "The AI data service is currently unavailable." },
    methodology: [
      {
        title: "Blends multiple signals",
        description: "Recent form, head-to-head history, player availability, and home advantage are weighted together.",
      },
      {
        title: "Separates confidence and risk",
        description: "Tight matches and volatile fixtures show stronger heat and upset warnings.",
      },
      {
        title: "Built for prediction context",
        description: "The model adds context, while final prediction choices remain with the user.",
      },
    ],
  },
  lo: {
    title: "AI Insight",
    subtitle:
      "ສະຫຼຸບກ່ອນທາຍຜົນຈາກຟອມທີມ ຄວາມເປັນໄປໄດ້ ສະຖິຕິພົບກັນ ຜົນກະທົບອາການເຈັບ ແລະຄວາມເຫັນຊຸມຊົນ",
    disclaimer: "ຂໍ້ມູນນີ້ໃຊ້ຊ່ວຍຕັດສິນໃຈ ບໍ່ແມ່ນການຮັບປະກັນຜົນແຂ່ງຂັນ",
    actions: { viewInsight: "ເບິ່ງອິນໄຊຕ໌", predictNow: "ໄປທາຍຜົນ" },
    stats: {
      analyzedMatches: "ແມຕຊ໌ທີ່ວິເຄາະ",
      averageConfidence: "ຄວາມໝັ້ນໃຈສະເລ່ຍ",
      upsetAlerts: "ເຕືອນພິກລັອກ",
      communityVotes: "ໂຫວດຊຸມຊົນ",
    },
    filters: { all: "ທັງໝົດ", live: "ກໍາລັງແຂ່ງ", upcoming: "ຈະມາເຖິງ", highConfidence: "ໝັ້ນໃຈສູງ", upset: "ສ່ຽງພິກລັອກ" },
    labels: {
      featured: "ແນະນໍາ",
      upsetAlert: "ລະວັງພິກລັອກ",
      confidence: "ຄວາມໝັ້ນໃຈ",
      heat: "ຄວາມມັນຂອງເກມ",
      heatVeryLow: "💤 ນ່າເບື່ອ — ຂ້າງດຽວ ຄາດຜົນໄດ້",
      heatLow: "😐 ເບົາໆ — ເຫັນຊັດວ່າຝ່າຍໃດເໜືອກວ່າ",
      heatMid: "🤔 ພໍໄດ້ — ຫ່າງກັນບ້າງ ມີຕົວເຕັງ",
      heatHigh: "⚡️ ມ່ວນ — ໃກ້ຄຽງ ລຸ້ນສະໜຸກ",
      heatVeryHigh: "🔥 ເດືອດຫຼາຍ — ສູສີສຸດໆ ພິກໄດ້ທຸກວິນາທີ",
      likelyScore: "ສະກໍທີ່ຄາດ",
      predictedSource: "ແຫຼ່ງຂໍ້ມູນ",
      predictedConfidence: "ຄວາມໝັ້ນໃຈສະກໍ",
      expectedGoals: "xG",
      homeWin: "ເຈົ້າບ້ານຊະນະ",
      draw: "ສະເໝີ",
      awayWin: "ທີມຢາມຊະນະ",
      form: "ຟອມ",
      rank: "ອັນດັບ",
      points: "ຄະແນນ",
      h2h: "ສະຖິຕິພົບກັນ",
      community: "ຊຸມຊົນ",
      votes: "ໂຫວດ",
      keyFactors: "ປັດໃຈສໍາຄັນ",
      generated: "ອັບເດດ",
      kickoff: "ເວລາແຂ່ງ",
      live: "ສົດ",
      upcoming: "ລໍຖ້າ",
      finished: "ຈົບແລ້ວ",
      postponed: "ເລື່ອນ",
      cancelled: "ຍົກເລີກ",
      noInjuries: "ບໍ່ມີລາຍງານ",
      injuryImpact: "ຜົນກະທົບນັກເຕະເຈັບ",
      home: "ເຈົ້າບ້ານ",
      away: "ທີມຢາມ",
    },
    sections: { modelSummary: "ພາບລວມໂມເດວ", matchInsights: "ອິນໄຊຕ໌ແມຕຊ໌", methodology: "AI ອ່ານເກມແນວໃດ" },
    empty: { title: "ບໍ່ພົບອິນໄຊຕ໌", description: "ລອງປ່ຽນຕົວກອງເພື່ອເບິ່ງແມຕຊ໌ອື່ນ" },
    error: { title: "ໂຫຼດ AI Insight ບໍ່ສຳເລັດ", description: "ບໍລິການຂໍ້ມູນ AI ບໍ່ພ້ອມໃຊ້ງານ" },
    methodology: [
      { title: "ລວມຫຼາຍສັນຍານ", description: "ຟອມຫຼ້າສຸດ ສະຖິຕິພົບກັນ ຄວາມພ້ອມນັກເຕະ ແລະຄວາມໄດ້ປຽບສະໜາມ" },
      { title: "ແຍກຄວາມໝັ້ນໃຈແລະຄວາມສ່ຽງ", description: "ແມຕຊ໌ທີ່ສູສີຈະມີ heat ແລະ upset alert ຊັດເຈນ" },
      { title: "ໃຊ້ເພື່ອປະກອບການທາຍ", description: "ອິນໄຊຕ໌ເພີ່ມບໍລິບົດ ແຕ່ຜູ້ໃຊ້ຕັດສິນໃຈເອງ" },
    ],
  },
  my: {
    title: "AI Insight",
    subtitle:
      "အသင်းဖောင်မ်၊ ဖြစ်နိုင်ခြေ၊ ထိပ်တိုက်တွေ့ဆုံမှု၊ ဒဏ်ရာသက်ရောက်မှုနှင့် ကွန်မြူနิตี้အမြင်များမှ ပွဲမတိုင်မီသုံးသပ်ချက်များ",
    disclaimer: "ဤအချက်အလက်သည် ဆုံးဖြတ်ရာတွင်ကူညီရန်ဖြစ်ပြီး ပွဲရလဒ်ကို အာမခံခြင်းမဟုတ်ပါ။",
    actions: { viewInsight: "အင်ဆိုက်ကြည့်ရန်", predictNow: "ခန့်မှန်းရန်" },
    stats: {
      analyzedMatches: "သုံးသပ်ထားသောပွဲ",
      averageConfidence: "ပျမ်းမျှယုံကြည်မှု",
      upsetAlerts: "Upset သတိပေးချက်",
      communityVotes: "ကွန်မြူနิตี้မဲ",
    },
    filters: { all: "အားလုံး", live: "တိုက်ရိုက်", upcoming: "လာမည့်ပွဲ", highConfidence: "ယုံကြည်မှုမြင့်", upset: "Upset အန္တရာယ်" },
    labels: {
      featured: "အကြံပြု",
      upsetAlert: "Upset သတိပေးချက်",
      confidence: "ယုံကြည်မှု",
      heat: "ပွဲစိတ်လှုပ်ရှားမှု",
      heatVeryLow: "💤 ပျင်းစရာ — တစ်ဖက်သတ်ဖြစ်ပြီး ရလဒ်ခန့်မှန်းလွယ်",
      heatLow: "😐 ပေါ့ပေါ့ပါးပါး — ဘယ်အသင်းပိုသာလဲ ရှင်းနေသည်",
      heatMid: "🤔 သင့်တော် — ကွာဟချက်ရှိပြီး အနိုင်ရနိုင်သူရှိ",
      heatHigh: "⚡️ စိတ်လှုပ်ရှား — နီးစပ်ပြီး ကြည့်ကောင်း",
      heatVeryHigh: "🔥 အရမ်းပြင်း — အလွန်နီးစပ်ပြီး အချိန်မရွေးပြောင်းနိုင်",
      likelyScore: "ခန့်မှန်းစကอร์",
      predictedSource: "Source",
      predictedConfidence: "စကอร์ယုံကြည်မှု",
      expectedGoals: "xG",
      homeWin: "အိမ်ရှင်နိုင်",
      draw: "သရေ",
      awayWin: "ဧည့်သည်နိုင်",
      form: "ဖောင်မ်",
      rank: "အဆင့်",
      points: "ပွိုင့်",
      h2h: "ထိပ်တိုက်တွေ့ဆုံ",
      community: "ကွန်မြူနิตี้",
      votes: "မဲ",
      keyFactors: "အရေးကြီးအချက်များ",
      generated: "အပ်ဒိတ်",
      kickoff: "ပွဲစချိန်",
      live: "တိုက်ရိုက်",
      upcoming: "မစရသေး",
      finished: "ပြီးဆုံး",
      postponed: "ရွှေ့ဆိုင်း",
      cancelled: "ဖျက်သိမ်း",
      noInjuries: "အစီရင်ခံချက်မရှိ",
      injuryImpact: "ဒဏ်ရာသက်ရောက်မှု",
      home: "အိမ်ရှင်",
      away: "ဧည့်သည်",
    },
    sections: { modelSummary: "မော်ဒယ်အကျဉ်းချုပ်", matchInsights: "ပွဲအင်ဆိုက်များ", methodology: "AI သည်ပွဲကိုဘယ်လိုဖတ်သလဲ" },
    empty: { title: "အင်ဆိုက်မတွေ့ပါ", description: "အခြားပွဲများကြည့်ရန် filter ပြောင်းပါ။" },
    error: { title: "AI Insight ကိုဖွင့်မရပါ", description: "AI ဒေတာဝန်ဆောင်မှုကို လောလောဆယ်အသုံးမပြုနိုင်ပါ။" },
    methodology: [
      { title: "အချက်အလက်များစွာပေါင်းစပ်", description: "နောက်ဆုံးဖောင်မ်၊ ထိပ်တိုက်မှတ်တမ်း၊ ကစားသမားအခြေအနေနှင့် အိမ်ကွင်းအားသာချက်ကို တွက်ချက်သည်။" },
      { title: "ယုံကြည်မှုနှင့်အန္တရာယ်ခွဲခြား", description: "နီးစပ်သောပွဲများတွင် heat နှင့် upset warning ကို ပိုမိုထင်ရှားစေသည်။" },
      { title: "ခန့်မှန်းရန်အထောက်အကူ", description: "AI သည်บริบทပေးပြီး နောက်ဆုံးရွေးချယ်မှုမှာ အသုံးပြုသူ၏ဆုံးဖြတ်ချက်ဖြစ်သည်။" },
    ],
  },
  km: {
    title: "AI Insight",
    subtitle:
      "បរិបទមុនទស្សន៍ទាយពីទម្រង់ក្រុម ប្រូបាប៊ីលីតេ ប្រវត្តិជួបគ្នា ផលប៉ះពាល់របួស និងមតិសហគមន៍។",
    disclaimer: "អ៊ីនសាយនេះជួយការសម្រេចចិត្ត ប៉ុន្តែមិនធានាលទ្ធផលការប្រកួតទេ។",
    actions: { viewInsight: "មើលអ៊ីនសាយ", predictNow: "ទស្សន៍ទាយ" },
    stats: {
      analyzedMatches: "ការប្រកួតបានវិភាគ",
      averageConfidence: "ទំនុកចិត្តមធ្យម",
      upsetAlerts: "ការព្រមានพลิกលទ្ធផល",
      communityVotes: "សម្លេងសហគមន៍",
    },
    filters: { all: "ទាំងអស់", live: "កំពុងប្រកួត", upcoming: "ជិតមកដល់", highConfidence: "ទំនុកចិត្តខ្ពស់", upset: "ហានិភ័យพลិកលទ្ធផល" },
    labels: {
      featured: "ណែនាំ",
      upsetAlert: "ព្រមានพลិកលទ្ធផល",
      confidence: "ទំនុកចិត្ត",
      heat: "ភាពរំភើបនៃការប្រកួត",
      heatVeryLow: "💤 គួរឱ្យធុញ — ម្ខាងជាង លទ្ធផលអាចទាយបាន",
      heatLow: "😐 ស្រាលៗ — ច្បាស់ថាខាងណាលើសជាង",
      heatMid: "🤔 ល្មម — មានគម្លាតខ្លះ និងមានក្រុមមានប្រៀប",
      heatHigh: "⚡️ រំភើប — ប្រកៀកគ្នា មើលសប្បាយ",
      heatVeryHigh: "🔥 ក្តៅខ្លាំង — ប្រកៀកបំផុត អាចប្រែបានគ្រប់វិនាទី",
      likelyScore: "ពិន្ទុរំពឹងទុក",
      predictedSource: "ប្រភព",
      predictedConfidence: "ទំនុកចិត្តពិន្ទុ",
      expectedGoals: "xG",
      homeWin: "ម្ចាស់ផ្ទះឈ្នះ",
      draw: "ស្មើ",
      awayWin: "ភ្ញៀវឈ្នះ",
      form: "ទម្រង់",
      rank: "ចំណាត់ថ្នាក់",
      points: "ពិន្ទុ",
      h2h: "ប្រវត្តិជួបគ្នា",
      community: "សហគមន៍",
      votes: "សម្លេង",
      keyFactors: "កត្តាសំខាន់",
      generated: "បានអាប់ដេត",
      kickoff: "ម៉ោងប្រកួត",
      live: "ផ្ទាល់",
      upcoming: "មិនទាន់ចាប់ផ្តើម",
      finished: "ចប់ហើយ",
      postponed: "ពន្យារ",
      cancelled: "បានលុបចោល",
      noInjuries: "គ្មានរបាយការណ៍",
      injuryImpact: "ផលប៉ះពាល់របួស",
      home: "ម្ចាស់ផ្ទះ",
      away: "ភ្ញៀវ",
    },
    sections: { modelSummary: "សង្ខេបម៉ូដែល", matchInsights: "អ៊ីនសាយការប្រកួត", methodology: "AI អានការប្រកួតយ៉ាងដូចម្តេច" },
    empty: { title: "រកមិនឃើញអ៊ីនសាយ", description: "សូមប្តូរតម្រងដើម្បីមើលការប្រកួតផ្សេងទៀត។" },
    error: { title: "មិនអាចផ្ទុក AI Insight", description: "សេវាទិន្នន័យ AI មិនអាចប្រើបាននៅពេលនេះ។" },
    methodology: [
      { title: "រួមបញ្ចូលសញ្ញាច្រើន", description: "ទម្រង់ថ្មីៗ ប្រវត្តិជួបគ្នា ស្ថានភាពកីឡាករ និងអត្ថប្រយោជន៍ដីផ្ទះត្រូវបានថ្លឹងថ្លែង។" },
      { title: "បំបែកទំនុកចិត្តនិងហានិភ័យ", description: "ការប្រកួតដែលស្មើសាច់គ្នានឹងបង្ហាញ heat និង upset alert ឲ្យច្បាស់។" },
      { title: "សម្រាប់បរិបទទស្សន៍ទាយ", description: "AI ផ្តល់បរិបទ ប៉ុន្តែជម្រើសចុងក្រោយនៅលើអ្នកប្រើ។" },
    ],
  },
  zh: {
    title: "AI Insight",
    subtitle:
      "结合球队状态、胜平负概率、交锋记录、伤病影响和社区观点，提供赛前预测参考。",
    disclaimer: "这些分析用于辅助判断，并不保证比赛结果。",
    actions: { viewInsight: "查看分析", predictNow: "立即预测" },
    stats: {
      analyzedMatches: "已分析比赛",
      averageConfidence: "平均信心",
      upsetAlerts: "爆冷提醒",
      communityVotes: "社区投票",
    },
    filters: { all: "全部", live: "进行中", upcoming: "未开始", highConfidence: "高信心", upset: "爆冷风险" },
    labels: {
      featured: "推荐",
      upsetAlert: "爆冷提醒",
      confidence: "信心",
      heat: "比赛精彩度",
      heatVeryLow: "💤 乏味 — 一边倒，结果较明显",
      heatLow: "😐 偏淡 — 明显有一方更强",
      heatMid: "🤔 尚可 — 有差距，也有热门方",
      heatHigh: "⚡️ 精彩 — 接近，悬念不错",
      heatVeryHigh: "🔥 非常激烈 — 极其接近，随时可能反转",
      likelyScore: "预测比分",
      predictedSource: "来源",
      predictedConfidence: "比分信心",
      expectedGoals: "xG",
      homeWin: "主胜",
      draw: "平局",
      awayWin: "客胜",
      form: "状态",
      rank: "排名",
      points: "积分",
      h2h: "交锋",
      community: "社区",
      votes: "票",
      keyFactors: "关键因素",
      generated: "更新",
      kickoff: "开赛时间",
      live: "进行中",
      upcoming: "未开始",
      finished: "已结束",
      postponed: "延期",
      cancelled: "取消",
      noInjuries: "暂无报告",
      injuryImpact: "伤病影响",
      home: "主队",
      away: "客队",
    },
    sections: { modelSummary: "模型概览", matchInsights: "比赛分析", methodology: "AI 如何解读比赛" },
    empty: { title: "未找到分析", description: "请尝试切换筛选条件查看更多比赛。" },
    error: { title: "无法加载 AI Insight", description: "AI 数据服务当前不可用。" },
    methodology: [
      { title: "融合多种信号", description: "近期状态、交锋历史、球员可用性和主场优势会被综合加权。" },
      { title: "区分信心与风险", description: "走势接近或变量较多的比赛会显示更高热度和爆冷提醒。" },
      { title: "服务于预测决策", description: "AI 提供上下文，最终预测选择仍由用户判断。" },
    ],
  },
};

export function getAIInsightPageCopy(locale: string): AIInsightPageCopy {
  return aiInsightCopy[(locale as LocaleCode) in aiInsightCopy ? (locale as LocaleCode) : "th"];
}
