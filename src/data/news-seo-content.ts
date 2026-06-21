import type { LocaleCode } from "@/i18n";

type NewsSeoContent = {
  title: string;
  newsTitle: string;
  analysisTitle: string;
  searchTitle: string;
  description: string;
  newsDescription: string;
  analysisDescription: string;
  searchDescription: string;
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

const fallback: NewsSeoContent = {
  title: "Football News and Analysis | Match Reports, AI Insight and Prediction Tips | ScoreMatrix",
  newsTitle: "Football News Today | Match Reports and League Updates | ScoreMatrix",
  analysisTitle: "Football Analysis | Match Previews, Form Trends and Prediction Context | ScoreMatrix",
  searchTitle: "Search Football News | ScoreMatrix",
  description:
    "Read ScoreMatrix football news, match reports, tactical analysis, prediction tips and AI-led context for fixtures across global leagues.",
  newsDescription:
    "Follow football news, match reports, team updates, league stories and ScoreMatrix platform updates for global football fans.",
  analysisDescription:
    "Read football analysis built around form, team news, tactical context, AI insight and prediction angles before key fixtures.",
  searchDescription:
    "Search ScoreMatrix football articles, match reports, prediction tips and analysis by team, league, topic or keyword.",
  keywords: [
    "football news",
    "football analysis",
    "soccer news",
    "match reports",
    "football prediction tips",
    "AI football insight",
    "football previews",
    "ScoreMatrix news",
  ],
  ogTitle: "ScoreMatrix News - Football News, Analysis and Prediction Context",
  ogDescription:
    "Daily football articles covering match reports, analysis, prediction ideas and AI context from ScoreMatrix.",
  pageTitle: "Football news, match analysis and prediction context",
  pageDescription:
    "Use ScoreMatrix News to follow football stories that matter for fixtures, form, tactical trends, prediction decisions and AI match context.",
  faqTitle: "Football News FAQ",
  faqs: [
    {
      question: "What does ScoreMatrix News cover?",
      answer:
        "ScoreMatrix News covers football news, match reports, previews, tactical analysis, prediction tips, AI insight context and platform updates.",
    },
    {
      question: "Are news and analysis pages public?",
      answer:
        "Yes. News, analysis and article detail pages are public so readers can follow football context before using prediction or member features.",
    },
    {
      question: "How are ScoreMatrix analysis articles useful for predictions?",
      answer:
        "Analysis articles summarize form, team news, tactical patterns and AI-driven context that can help users make more informed score predictions.",
    },
  ],
};

const content: Partial<Record<LocaleCode, NewsSeoContent>> = {
  th: {
    title: "ข่าวฟุตบอลและบทวิเคราะห์ | รายงานผล AI Insight และเคล็ดลับทายผล | ScoreMatrix",
    newsTitle: "ข่าวฟุตบอลวันนี้ | รายงานผลและอัปเดตลีก | ScoreMatrix",
    analysisTitle: "บทวิเคราะห์ฟุตบอล | พรีวิวแมตช์ ฟอร์มทีม และมุมมองทายผล | ScoreMatrix",
    searchTitle: "ค้นหาข่าวฟุตบอล | ScoreMatrix",
    description:
      "อ่านข่าวฟุตบอล บทวิเคราะห์ รายงานผล เคล็ดลับทายผลบอล และบริบทจาก AI สำหรับแมตช์จากลีกทั่วโลกบน ScoreMatrix",
    newsDescription:
      "ติดตามข่าวฟุตบอล รายงานผล อัปเดตทีม เรื่องราวจากลีกต่างๆ และข่าวแพลตฟอร์ม ScoreMatrix สำหรับแฟนบอล",
    analysisDescription:
      "อ่านบทวิเคราะห์ฟุตบอลจากฟอร์มทีม ข่าวผู้เล่น แท็กติก AI Insight และมุมมองก่อนทายผลในแมตช์สำคัญ",
    searchDescription:
      "ค้นหาบทความฟุตบอล ข่าว รายงานผล เคล็ดลับทายผล และบทวิเคราะห์ของ ScoreMatrix ตามทีม ลีก หัวข้อ หรือคีย์เวิร์ด",
    keywords: [
      "ข่าวฟุตบอล",
      "ข่าวบอลวันนี้",
      "วิเคราะห์ฟุตบอล",
      "รายงานผลบอล",
      "เคล็ดลับทายผลบอล",
      "AI วิเคราะห์ฟุตบอล",
      "พรีวิวฟุตบอล",
      "ScoreMatrix ข่าว",
    ],
    ogTitle: "ScoreMatrix ข่าวฟุตบอล - ข่าว บทวิเคราะห์ และมุมมองทายผล",
    ogDescription:
      "บทความฟุตบอลรายวัน ครอบคลุมข่าว รายงานผล วิเคราะห์ก่อนเกม ไอเดียทายผล และบริบทจาก AI บน ScoreMatrix",
    pageTitle: "ข่าวฟุตบอล บทวิเคราะห์แมตช์ และบริบทก่อนทายผล",
    pageDescription:
      "ใช้หน้า ScoreMatrix ข่าวสารเพื่อติดตามประเด็นฟุตบอลที่สำคัญต่อแมตช์ ฟอร์มทีม แท็กติก การตัดสินใจทายผล และ AI match context",
    faqTitle: "คำถามที่พบบ่อยเกี่ยวกับข่าวฟุตบอล",
    faqs: [
      {
        question: "ScoreMatrix ข่าวสารครอบคลุมอะไรบ้าง?",
        answer:
          "ครอบคลุมข่าวฟุตบอล รายงานผล พรีวิวแมตช์ บทวิเคราะห์แท็กติก เคล็ดลับทายผล บริบทจาก AI Insight และอัปเดตแพลตฟอร์ม",
      },
      {
        question: "อ่านข่าวและบทวิเคราะห์ได้โดยไม่ต้องเข้าสู่ระบบไหม?",
        answer:
          "ได้ หน้า News, Analysis และรายละเอียดบทความเป็นสาธารณะ เพื่อให้ผู้อ่านติดตามบริบทฟุตบอลก่อนใช้ฟีเจอร์ทายผลหรือสมาชิก",
      },
      {
        question: "บทวิเคราะห์ช่วยเรื่องการทายผลอย่างไร?",
        answer:
          "บทวิเคราะห์สรุปฟอร์มทีม ข่าวผู้เล่น รูปแบบแท็กติก และบริบทจาก AI เพื่อช่วยให้ผู้ใช้ตัดสินใจทายสกอร์อย่างมีข้อมูลมากขึ้น",
      },
    ],
  },
  en: fallback,
  lo: {
    title: "ຂ່າວບານເຕະ ແລະ ບົດວິເຄາະ | Match Reports, AI Insight ແລະ ເຄັດລັບທາຍຜົນ | ScoreMatrix",
    newsTitle: "ຂ່າວບານເຕະມື້ນີ້ | ລາຍງານແມັດ ແລະ ອັບເດດລີກ | ScoreMatrix",
    analysisTitle: "ບົດວິເຄາະບານເຕະ | ພຣີວິວແມັດ, ຟອມທີມ ແລະ ບໍລິບົດການທາຍ | ScoreMatrix",
    searchTitle: "ຄົ້ນຫາຂ່າວບານເຕະ | ScoreMatrix",
    description:
      "ອ່ານຂ່າວບານເຕະ, ລາຍງານແມັດ, ບົດວິເຄາະ, ເຄັດລັບທາຍຜົນ ແລະ AI context ສຳລັບລີກທົ່ວໂລກ.",
    newsDescription:
      "ຕິດຕາມຂ່າວບານເຕະ, ລາຍງານແມັດ, ອັບເດດທີມ, ເລື່ອງລີກ ແລະ ຂ່າວ ScoreMatrix.",
    analysisDescription:
      "ອ່ານບົດວິເຄາະຈາກຟອມ, team news, tactic, AI Insight ແລະມຸມມອງກ່ອນທາຍຜົນ.",
    searchDescription:
      "ຄົ້ນຫາບົດຄວາມ ScoreMatrix ຕາມທີມ, ລີກ, ຫົວຂໍ້ ຫຼື keyword.",
    keywords: [
      "ຂ່າວບານເຕະ",
      "ວິເຄາະບານ",
      "football news",
      "match reports",
      "football prediction tips",
      "AI football insight",
      "ScoreMatrix news",
    ],
    ogTitle: "ScoreMatrix News - ຂ່າວບານເຕະ ບົດວິເຄາະ ແລະ ບໍລິບົດການທາຍ",
    ogDescription:
      "ບົດຄວາມບານເຕະລາຍວັນຈາກ ScoreMatrix ທີ່ຊ່ວຍໃຫ້ອ່ານເກມແລະທາຍຜົນດີຂຶ້ນ.",
    pageTitle: "ຂ່າວບານເຕະ, ບົດວິເຄາະແມັດ ແລະ ບໍລິບົດກ່ອນທາຍຜົນ",
    pageDescription:
      "ໃຊ້ ScoreMatrix News ເພື່ອຕິດຕາມຂ່າວ, ຟອມທີມ, tactic, prediction idea ແລະ AI match context.",
    faqTitle: "Football News FAQ",
    faqs: fallback.faqs,
  },
  my: {
    title: "ဘောလုံးသတင်းနှင့် သုံးသပ်ချက် | Match Reports, AI Insight နှင့် Prediction Tips | ScoreMatrix",
    newsTitle: "ယနေ့ ဘောလုံးသတင်း | Match Reports နှင့် League Updates | ScoreMatrix",
    analysisTitle: "ဘောလုံးသုံးသပ်ချက် | Match Previews, Form Trends နှင့် Prediction Context | ScoreMatrix",
    searchTitle: "ဘောလုံးသတင်း ရှာရန် | ScoreMatrix",
    description:
      "ScoreMatrix တွင် ဘောလုံးသတင်း၊ match reports၊ tactical analysis၊ prediction tips နှင့် AI-led context များကို ဖတ်ရှုပါ။",
    newsDescription:
      "ဘောလုံးသတင်း၊ match reports၊ team updates၊ league stories နှင့် ScoreMatrix platform updates များကို လိုက်ကြည့်ပါ။",
    analysisDescription:
      "Form, team news, tactical context, AI Insight နှင့် prediction angles အခြေခံသော ဘောလုံးသုံးသပ်ချက်များကို ဖတ်ရှုပါ။",
    searchDescription:
      "ScoreMatrix articles များကို team, league, topic သို့မဟုတ် keyword ဖြင့် ရှာပါ။",
    keywords: [
      "ဘောလုံးသတင်း",
      "ဘောလုံးသုံးသပ်ချက်",
      "football news",
      "match reports",
      "prediction tips",
      "AI football insight",
      "ScoreMatrix news",
    ],
    ogTitle: "ScoreMatrix News - ဘောလုံးသတင်း၊ သုံးသပ်ချက်နှင့် Prediction Context",
    ogDescription:
      "ScoreMatrix မှ နေ့စဉ် football articles, match reports, analysis, prediction ideas နှင့် AI context.",
    pageTitle: "ဘောလုံးသတင်း၊ Match Analysis နှင့် Prediction Context",
    pageDescription:
      "ScoreMatrix News ကို အသုံးပြုပြီး fixtures, form, tactical trends, prediction decisions နှင့် AI match context များကို လိုက်ကြည့်ပါ။",
    faqTitle: "Football News FAQ",
    faqs: fallback.faqs,
  },
  km: {
    title: "ព័ត៌មានបាល់ទាត់ និងវិភាគ | Match Reports, AI Insight និង Prediction Tips | ScoreMatrix",
    newsTitle: "ព័ត៌មានបាល់ទាត់ថ្ងៃនេះ | របាយការណ៍ប្រកួត និងអាប់ដេតលីគ | ScoreMatrix",
    analysisTitle: "វិភាគបាល់ទាត់ | ព្រីវីយូប្រកួត ទម្រង់ក្រុម និងបរិបទទស្សន៍ទាយ | ScoreMatrix",
    searchTitle: "ស្វែងរកព័ត៌មានបាល់ទាត់ | ScoreMatrix",
    description:
      "អានព័ត៌មានបាល់ទាត់ របាយការណ៍ប្រកួត វិភាគតាក់ទិច prediction tips និង AI context សម្រាប់លីគជុំវិញពិភពលោក។",
    newsDescription:
      "តាមដានព័ត៌មានបាល់ទាត់ របាយការណ៍ប្រកួត team updates រឿងលីគ និង ScoreMatrix platform updates។",
    analysisDescription:
      "អានវិភាគផ្អែកលើ form, team news, tactical context, AI Insight និង prediction angles មុនការប្រកួតសំខាន់។",
    searchDescription:
      "ស្វែងរកអត្ថបទ ScoreMatrix តាមក្រុម លីគ ប្រធានបទ ឬ keyword។",
    keywords: [
      "ព័ត៌មានបាល់ទាត់",
      "វិភាគបាល់ទាត់",
      "football news",
      "match reports",
      "prediction tips",
      "AI football insight",
      "ScoreMatrix news",
    ],
    ogTitle: "ScoreMatrix News - ព័ត៌មានបាល់ទាត់ វិភាគ និង Prediction Context",
    ogDescription:
      "អត្ថបទបាល់ទាត់ប្រចាំថ្ងៃពី ScoreMatrix សម្រាប់ព័ត៌មាន វិភាគ prediction ideas និង AI context.",
    pageTitle: "ព័ត៌មានបាល់ទាត់ វិភាគប្រកួត និងបរិបទមុនទស្សន៍ទាយ",
    pageDescription:
      "ប្រើ ScoreMatrix News ដើម្បីតាមដាន fixtures, form, tactical trends, prediction decisions និង AI match context។",
    faqTitle: "Football News FAQ",
    faqs: fallback.faqs,
  },
  zh: {
    title: "足球新闻与分析 | 赛报、AI Insight 与预测技巧 | ScoreMatrix",
    newsTitle: "今日足球新闻 | 赛报与联赛动态 | ScoreMatrix",
    analysisTitle: "足球分析 | 赛前预览、状态趋势与预测背景 | ScoreMatrix",
    searchTitle: "搜索足球新闻 | ScoreMatrix",
    description:
      "阅读 ScoreMatrix 足球新闻、赛报、战术分析、预测技巧和 AI 驱动的比赛背景，覆盖全球联赛。",
    newsDescription:
      "关注足球新闻、赛报、球队动态、联赛故事和 ScoreMatrix 平台更新。",
    analysisDescription:
      "阅读结合状态、球队新闻、战术背景、AI Insight 和预测角度的足球分析。",
    searchDescription:
      "按球队、联赛、主题或关键词搜索 ScoreMatrix 足球文章、赛报、预测技巧和分析。",
    keywords: [
      "足球新闻",
      "足球分析",
      "今日足球新闻",
      "赛报",
      "足球预测技巧",
      "AI 足球分析",
      "ScoreMatrix 新闻",
    ],
    ogTitle: "ScoreMatrix News - 足球新闻、分析与预测背景",
    ogDescription:
      "ScoreMatrix 每日足球文章，覆盖赛报、分析、预测思路和 AI 比赛背景。",
    pageTitle: "足球新闻、比赛分析与预测背景",
    pageDescription:
      "使用 ScoreMatrix News 跟踪与赛程、状态、战术趋势、预测决策和 AI 比赛背景相关的足球故事。",
    faqTitle: "足球新闻常见问题",
    faqs: [
      {
        question: "ScoreMatrix News 覆盖哪些内容？",
        answer:
          "覆盖足球新闻、赛报、赛前预览、战术分析、预测技巧、AI Insight 背景和平台更新。",
      },
      {
        question: "新闻和分析页面是公开的吗？",
        answer:
          "是的。新闻、分析和文章详情页是公开页面，读者可以在使用预测或会员功能前了解足球背景。",
      },
      {
        question: "分析文章如何帮助预测？",
        answer:
          "分析文章会总结状态、球队新闻、战术模式和 AI 驱动背景，帮助用户更有信息地进行比分预测。",
      },
    ],
  },
};

export function getNewsSeoContent(locale: string): NewsSeoContent {
  return content[locale as LocaleCode] ?? fallback;
}
