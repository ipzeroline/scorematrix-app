import type { LocaleCode } from "@/i18n";

type AIInsightSeoContent = {
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  pageTitle: string;
  pageDescription: string;
  faqTitle: string;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
};

const fallback: AIInsightSeoContent = {
  title: "AI Football Predictions & Match Insights | ScoreMatrix",
  description:
    "Explore AI football predictions, match probabilities, confidence scores, upset alerts, team form signals and data-driven football analysis on ScoreMatrix.",
  keywords: [
    "AI football predictions",
    "football AI analysis",
    "AI match insights",
    "soccer prediction AI",
    "football probability analysis",
    "football confidence score",
    "upset alerts football",
    "ScoreMatrix AI Insight",
  ],
  ogTitle: "ScoreMatrix AI Insight - Football Prediction Analysis",
  ogDescription:
    "Review AI-powered football match analysis with probabilities, confidence scores, upset risk and key match factors.",
  pageTitle: "AI football predictions and match analysis",
  pageDescription:
    "Use ScoreMatrix AI Insight to compare team strength, probabilities, confidence, upset risk, form signals and match context before making skill-based football predictions.",
  faqTitle: "AI Football Insight FAQ",
  faqs: [
    {
      question: "What is ScoreMatrix AI Insight?",
      answer:
        "AI Insight is a football analysis page that summarizes match probabilities, confidence scores, team strength, upset risk, key factors and community signals.",
    },
    {
      question: "Does AI Insight guarantee prediction results?",
      answer:
        "No. AI Insight is designed to support football analysis and decision-making, but it does not guarantee match outcomes or prediction success.",
    },
    {
      question: "What signals does the AI use?",
      answer:
        "The insight view can include form context, head-to-head signals, standings, strength gaps, probability data, community sentiment and data-led advice when available.",
    },
  ],
};

const content: Partial<Record<LocaleCode, AIInsightSeoContent>> = {
  th: {
    title: "AI วิเคราะห์บอลและคาดการณ์ฟุตบอล | ScoreMatrix",
    description:
      "ดู AI วิเคราะห์บอล ความน่าจะเป็นของผลแข่ง คะแนนความมั่นใจ ความเสี่ยงพลิกล็อก ฟอร์มทีม และปัจจัยสำคัญก่อนทายผลบอลบน ScoreMatrix",
    keywords: [
      "AI วิเคราะห์บอล",
      "วิเคราะห์บอล AI",
      "คาดการณ์ฟุตบอล",
      "ทายผลบอล AI",
      "ความน่าจะเป็นฟุตบอล",
      "คะแนนความมั่นใจฟุตบอล",
      "วิเคราะห์บอลวันนี้",
      "ScoreMatrix AI Insight",
    ],
    ogTitle: "ScoreMatrix AI Insight - วิเคราะห์บอลด้วยข้อมูล",
    ogDescription:
      "ดูบทวิเคราะห์ฟุตบอลจาก AI พร้อมความน่าจะเป็น ความมั่นใจ ความเสี่ยงพลิกล็อก และปัจจัยสำคัญของแต่ละแมตช์",
    pageTitle: "AI วิเคราะห์บอลและคาดการณ์แมตช์",
    pageDescription:
      "ใช้ ScoreMatrix AI Insight เพื่อเปรียบเทียบความแข็งแกร่งของทีม ความน่าจะเป็น ความมั่นใจ ความเสี่ยงพลิกล็อก ฟอร์ม และบริบทก่อนทายผลแบบใช้ทักษะ",
    faqTitle: "คำถามที่พบบ่อยเกี่ยวกับ AI วิเคราะห์บอล",
    faqs: [
      {
        question: "ScoreMatrix AI Insight คืออะไร?",
        answer:
          "AI Insight คือหน้าวิเคราะห์ฟุตบอลที่สรุปความน่าจะเป็น คะแนนความมั่นใจ ความแข็งแกร่งทีม ความเสี่ยงพลิกล็อก ปัจจัยสำคัญ และสัญญาณจากชุมชน",
      },
      {
        question: "AI Insight รับประกันผลการแข่งขันไหม?",
        answer:
          "ไม่รับประกัน AI Insight ใช้เพื่อช่วยวิเคราะห์และตัดสินใจ แต่ผลการแข่งขันจริงยังมีความไม่แน่นอนเสมอ",
      },
      {
        question: "AI ใช้ข้อมูลอะไรในการวิเคราะห์?",
        answer:
          "หน้าอินไซต์อาจใช้ฟอร์มทีม สถิติพบกัน ตารางคะแนน ช่องว่างความแข็งแกร่ง ความน่าจะเป็น เสียงชุมชน และคำแนะนำจากโมเดล เมื่อมีข้อมูล",
      },
    ],
  },
  en: fallback,
  lo: {
    title: "AI ວິເຄາະບານ ແລະ ຄາດການແມັດ | ScoreMatrix",
    description:
      "ເບິ່ງ AI ວິເຄາະບານ, ຄວາມນ່າຈະເປັນ, ຄະແນນຄວາມໝັ້ນໃຈ, ຄວາມສ່ຽງພິກລັອກ, ຟອມທີມ ແລະ ປັດໃຈສຳຄັນໃນ ScoreMatrix.",
    keywords: [
      "AI ວິເຄາະບານ",
      "ຄາດການບານ",
      "ທາຍຜົນບານ AI",
      "ວິເຄາະແມັດ",
      "ຄວາມນ່າຈະເປັນບານ",
      "ScoreMatrix AI Insight",
    ],
    ogTitle: "ScoreMatrix AI Insight - ວິເຄາະບານດ້ວຍຂໍ້ມູນ",
    ogDescription:
      "ກວດວິເຄາະແມັດດ້ວຍ AI ພ້ອມຄວາມນ່າຈະເປັນ, ຄວາມໝັ້ນໃຈ, ຄວາມສ່ຽງ ແລະ ປັດໃຈສຳຄັນ.",
    pageTitle: "AI ວິເຄາະບານ ແລະ ຄາດການແມັດ",
    pageDescription:
      "ໃຊ້ ScoreMatrix AI Insight ເພື່ອປຽບທຽບກຳລັງທີມ, ຄວາມນ່າຈະເປັນ, ຄວາມໝັ້ນໃຈ, ຄວາມສ່ຽງພິກລັອກ ແລະ ບໍລິບົດກ່ອນທາຍຜົນ.",
    faqTitle: "ຄຳຖາມກ່ຽວກັບ AI ວິເຄາະບານ",
    faqs: [
      {
        question: "ScoreMatrix AI Insight ແມ່ນຫຍັງ?",
        answer:
          "ແມ່ນໜ້າວິເຄາະບານທີ່ສະຫຼຸບຄວາມນ່າຈະເປັນ, ຄວາມໝັ້ນໃຈ, ກຳລັງທີມ, ຄວາມສ່ຽງ ແລະ ປັດໃຈສຳຄັນ.",
      },
      {
        question: "AI Insight ຮັບປະກັນຜົນແຂ່ງບໍ?",
        answer:
          "ບໍ່ຮັບປະກັນ ຂໍ້ມູນນີ້ໃຊ້ເພື່ອຊ່ວຍວິເຄາະ ແຕ່ຜົນຈິງຂອງແມັດຍັງບໍ່ແນ່ນອນ.",
      },
      {
        question: "AI ໃຊ້ສັນຍານໃດໃນການວິເຄາະ?",
        answer:
          "ອາດມີຟອມທີມ, ສະຖິຕິພົບກັນ, ອັນດັບ, ຊ່ອງວ່າງກຳລັງ, ຄວາມນ່າຈະເປັນ, ສຽງຊຸມຊົນ ແລະ ຄຳແນະນຳ ข้อมูล.",
      },
    ],
  },
  my: {
    title: "AI ဘောလုံးခန့်မှန်းချက်နှင့် Match Insight | ScoreMatrix",
    description:
      "ScoreMatrix တွင် AI ဘောလုံးခန့်မှန်းချက်၊ ပွဲဖြစ်နိုင်ခြေ၊ confidence score၊ upset alert၊ အသင်းဖောင်နှင့် အရေးကြီးအချက်များကို ကြည့်ရှုပါ။",
    keywords: [
      "AI ဘောလုံးခန့်မှန်းချက်",
      "ဘောလုံး AI ခွဲခြမ်းစိတ်ဖြာမှု",
      "match insight",
      "soccer prediction AI",
      "ဘောလုံးဖြစ်နိုင်ခြေ",
      "ScoreMatrix AI Insight",
    ],
    ogTitle: "ScoreMatrix AI Insight - ဘောလုံးခန့်မှန်းချက် ခွဲခြမ်းစိတ်ဖြာမှု",
    ogDescription:
      "AI ဖြင့် ဘောလုံးပွဲ analysis၊ probabilities၊ confidence score၊ upset risk နှင့် key factors များကို စစ်ဆေးပါ။",
    pageTitle: "AI ဘောလုံးခန့်မှန်းချက်နှင့် ပွဲခွဲခြမ်းစိတ်ဖြာမှု",
    pageDescription:
      "ScoreMatrix AI Insight ကို အသုံးပြုပြီး အသင်းအားသာချက်၊ probabilities၊ confidence၊ upset risk၊ form signals နှင့် match context ကို ခန့်မှန်းမတင်မီ စစ်ဆေးပါ။",
    faqTitle: "AI Football Insight မေးလေ့ရှိသော မေးခွန်းများ",
    faqs: [
      {
        question: "ScoreMatrix AI Insight ဆိုတာဘာလဲ?",
        answer:
          "AI Insight သည် ပွဲဖြစ်နိုင်ခြေ၊ confidence score၊ အသင်းအားသာချက်၊ upset risk၊ key factors နှင့် community signals များကို စုစည်းပြသော ဘောလုံး analysis စာမျက်နှာဖြစ်သည်။",
      },
      {
        question: "AI Insight က ရလဒ်ကို အာမခံလား?",
        answer:
          "မအာမခံပါ။ AI Insight သည် ခွဲခြမ်းစိတ်ဖြာရန်နှင့် ဆုံးဖြတ်ရန် ကူညီသော အချက်အလက်ဖြစ်ပြီး ပွဲရလဒ်ကို အတည်မပြုနိုင်ပါ။",
      },
      {
        question: "AI သည် ဘာအချက်များကို သုံးလဲ?",
        answer:
          "အသင်းဖောင်၊ head-to-head၊ standings၊ strength gap၊ probability data၊ community sentiment နှင့် model advice ရရှိပါက ထည့်သွင်းပြနိုင်သည်။",
      },
    ],
  },
  km: {
    title: "AI ទស្សន៍ទាយបាល់ទាត់ និងវិភាគការប្រកួត | ScoreMatrix",
    description:
      "មើល AI ទស្សន៍ទាយបាល់ទាត់ ប្រូបាប៊ីលីតេ ពិន្ទុទំនុកចិត្ត ការជូនដំណឹងភ្លាត់ស្មាន ទម្រង់ក្រុម និងកត្តាសំខាន់ៗនៅលើ ScoreMatrix។",
    keywords: [
      "AI ទស្សន៍ទាយបាល់ទាត់",
      "វិភាគបាល់ទាត់ AI",
      "AI match insight",
      "ទស្សន៍ទាយបាល់",
      "ប្រូបាប៊ីលីតេបាល់ទាត់",
      "ScoreMatrix AI Insight",
    ],
    ogTitle: "ScoreMatrix AI Insight - វិភាគការទស្សន៍ទាយបាល់ទាត់",
    ogDescription:
      "ពិនិត្យការវិភាគបាល់ទាត់ដោយ AI ជាមួយប្រូបាប៊ីលីតេ ពិន្ទុទំនុកចិត្ត ហានិភ័យភ្លាត់ស្មាន និងកត្តាសំខាន់ៗ។",
    pageTitle: "AI ទស្សន៍ទាយបាល់ទាត់ និងវិភាគការប្រកួត",
    pageDescription:
      "ប្រើ ScoreMatrix AI Insight ដើម្បីប្រៀបធៀបកម្លាំងក្រុម ប្រូបាប៊ីលីតេ ទំនុកចិត្ត ហានិភ័យភ្លាត់ស្មាន ទម្រង់ និងបរិបទមុនទស្សន៍ទាយ។",
    faqTitle: "សំណួរអំពី AI វិភាគបាល់ទាត់",
    faqs: [
      {
        question: "ScoreMatrix AI Insight ជាអ្វី?",
        answer:
          "វាជាទំព័រវិភាគបាល់ទាត់ដែលសង្ខេបប្រូបាប៊ីលីតេ ពិន្ទុទំនុកចិត្ត កម្លាំងក្រុម ហានិភ័យភ្លាត់ស្មាន កត្តាសំខាន់ និងសញ្ញាសហគមន៍។",
      },
      {
        question: "AI Insight ធានាលទ្ធផលប្រកួតទេ?",
        answer:
          "មិនធានាទេ។ វាជាជំនួយសម្រាប់វិភាគ និងសម្រេចចិត្ត ប៉ុន្តែលទ្ធផលប្រកួតពិតនៅតែមានភាពមិនប្រាកដ។",
      },
      {
        question: "AI ប្រើសញ្ញាអ្វីខ្លះ?",
        answer:
          "អាចរួមមានទម្រង់ក្រុម ប្រវត្តិជួបគ្នា តារាងចំណាត់ថ្នាក់ ចន្លោះកម្លាំង ទិន្នន័យប្រូបាប៊ីលីតេ សម្លេងសហគមន៍ និងដំបូន្មាន ข้อมูล។",
      },
    ],
  },
  zh: {
    title: "AI 足球预测与比赛分析 | ScoreMatrix",
    description:
      "在 ScoreMatrix 查看 AI 足球预测、比赛概率、信心评分、冷门提醒、球队状态信号和数据驱动的足球分析。",
    keywords: [
      "AI 足球预测",
      "足球 AI 分析",
      "AI 比赛分析",
      "足球概率分析",
      "足球信心评分",
      "冷门提醒",
      "ScoreMatrix AI Insight",
    ],
    ogTitle: "ScoreMatrix AI Insight - 足球预测分析",
    ogDescription:
      "查看 AI 驱动的足球比赛分析，包括概率、信心评分、冷门风险和关键比赛因素。",
    pageTitle: "AI 足球预测与比赛分析",
    pageDescription:
      "使用 ScoreMatrix AI Insight 比较球队强度、概率、信心、冷门风险、状态信号和比赛背景，再进行技巧型足球预测。",
    faqTitle: "AI 足球分析常见问题",
    faqs: [
      {
        question: "ScoreMatrix AI Insight 是什么？",
        answer:
          "AI Insight 是足球分析页面，会汇总比赛概率、信心评分、球队强度、冷门风险、关键因素和社区信号。",
      },
      {
        question: "AI Insight 会保证预测结果吗？",
        answer:
          "不会。AI Insight 用于辅助足球分析和决策，但不能保证比赛结果或预测一定成功。",
      },
      {
        question: "AI 会使用哪些信号？",
        answer:
          "页面可能包含球队状态、交锋记录、积分榜、强度差距、概率数据、社区情绪和 ข้อมูล 建议等信息。",
      },
    ],
  },
};

export function getAIInsightSeoContent(locale: string): AIInsightSeoContent {
  return content[locale as LocaleCode] ?? fallback;
}
