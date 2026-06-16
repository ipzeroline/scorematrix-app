import type { LocaleCode } from "@/i18n";

type HomeSeoContent = {
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  faqTitle: string;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
};

const fallback: HomeSeoContent = {
  title: "ScoreMatrix | Football Predictions, Live Scores, AI Insights & Rewards",
  description:
    "ScoreMatrix is a skill-based football prediction platform with live scores, AI match insights, leaderboards, missions and redeemable rewards. No real money gambling.",
  keywords: [
    "football predictions",
    "soccer predictions",
    "live scores",
    "AI football analysis",
    "football rewards",
    "prediction leaderboard",
    "skill-based football game",
  ],
  ogTitle: "ScoreMatrix - Football Predictions, Live Scores & Rewards",
  ogDescription:
    "Predict football matches with context, follow live scores, complete missions and redeem rewards in a skill-based platform.",
  faqTitle: "ScoreMatrix FAQ",
  faqs: [
    {
      question: "What is ScoreMatrix?",
      answer:
        "ScoreMatrix is a football prediction and live score platform focused on skill, football knowledge, AI insights, missions, leaderboards and non-cash rewards.",
    },
    {
      question: "Is ScoreMatrix gambling?",
      answer:
        "No. ScoreMatrix is designed as a skill-based entertainment platform using points and rewards, without real-money betting or cash withdrawal.",
    },
    {
      question: "What can I do on ScoreMatrix?",
      answer:
        "You can browse fixtures, follow live scores, review AI match insights, submit predictions, complete missions, climb leaderboards and redeem rewards.",
    },
  ],
};

const content: Partial<Record<LocaleCode, HomeSeoContent>> = {
  th: {
    title: "ScoreMatrix | ทายผลบอล ผลบอลสด AI วิเคราะห์ และรางวัลฟุตบอล",
    description:
      "ScoreMatrix คือแพลตฟอร์มทายผลบอลแบบใช้ทักษะ พร้อมผลบอลสด โปรแกรมแข่งขัน AI วิเคราะห์ ภารกิจ กระดานอันดับ และรางวัลที่แลกได้ โดยไม่มีการพนันด้วยเงินจริง",
    keywords: [
      "ทายผลบอล",
      "ผลบอลสด",
      "โปรแกรมบอล",
      "AI วิเคราะห์ฟุตบอล",
      "รางวัลฟุตบอล",
      "กระดานอันดับทายผล",
      "เกมทายผลฟุตบอล",
      "ทายบอลไม่มีเงินจริง",
    ],
    ogTitle: "ScoreMatrix - ทายผลบอล ผลบอลสด และรางวัลในแพลตฟอร์มเดียว",
    ogDescription:
      "ดูโปรแกรมบอล ผลบอลสด AI วิเคราะห์ ทำภารกิจ ไต่อันดับ และใช้แต้มแลกรางวัลในประสบการณ์ทายผลแบบใช้ทักษะ",
    faqTitle: "คำถามที่พบบ่อยเกี่ยวกับ ScoreMatrix",
    faqs: [
      {
        question: "ScoreMatrix คืออะไร?",
        answer:
          "ScoreMatrix คือแพลตฟอร์มฟุตบอลสำหรับดูโปรแกรมแข่งขัน ผลบอลสด AI วิเคราะห์ ทายผล ทำภารกิจ ไต่อันดับ และแลกรางวัลจากแต้มในระบบ",
      },
      {
        question: "ScoreMatrix เป็นการพนันหรือไม่?",
        answer:
          "ไม่ใช่ ScoreMatrix ออกแบบเป็นแพลตฟอร์มความบันเทิงแบบใช้ทักษะ ใช้แต้มและรางวัลที่ไม่ใช่การถอนเงินจริง",
      },
      {
        question: "หน้าแรกของ ScoreMatrix มีอะไรบ้าง?",
        answer:
          "หน้าแรกมีคู่ถ่ายทอดสด โปรแกรมวันนี้ คู่เด่นสำหรับทายผล AI วิเคราะห์ ภารกิจ รางวัล ข่าวฟุตบอล และลิงก์ไปยังศูนย์แข่งขันหลัก",
      },
    ],
  },
  en: fallback,
  lo: {
    title: "ScoreMatrix | ທາຍຜົນບານ, ຜົນສົດ, AI ວິເຄາະ ແລະ ລາງວັນ",
    description:
      "ScoreMatrix ແມ່ນແພລດຟອມທາຍຜົນບານແບບໃຊ້ທັກສະ ພ້ອມຜົນສົດ, ຕາຕະລາງແຂ່ງ, AI ວິເຄາະ, ພາລະກິດ, ກະດານອັນດັບ ແລະ ລາງວັນທີ່ແລກໄດ້.",
    keywords: [
      "ທາຍຜົນບານ",
      "ຜົນບານສົດ",
      "ຕາຕະລາງບານ",
      "AI ວິເຄາະບານ",
      "ລາງວັນບານ",
      "ກະດານອັນດັບທາຍຜົນ",
      "ເກມທາຍຜົນບານ",
    ],
    ogTitle: "ScoreMatrix - ທາຍຜົນບານ, ຜົນສົດ ແລະ ລາງວັນ",
    ogDescription:
      "ຕິດຕາມຕາຕະລາງບານ, ຜົນສົດ, AI ວິເຄາະ, ເຮັດພາລະກິດ, ໄຕ່ອັນດັບ ແລະ ແລກລາງວັນຈາກແຕ້ມ.",
    faqTitle: "ຄຳຖາມທີ່ພົບເລື້ອຍກ່ຽວກັບ ScoreMatrix",
    faqs: [
      {
        question: "ScoreMatrix ແມ່ນຫຍັງ?",
        answer:
          "ScoreMatrix ແມ່ນແພລດຟອມບານສຳລັບດູຕາຕະລາງແຂ່ງ, ຜົນສົດ, AI ວິເຄາະ, ທາຍຜົນ, ເຮັດພາລະກິດ, ໄຕ່ອັນດັບ ແລະ ແລກລາງວັນ.",
      },
      {
        question: "ScoreMatrix ເປັນການພະນັນບໍ?",
        answer:
          "ບໍ່ແມ່ນ ScoreMatrix ອອກແບບເປັນແພລດຟອມບັນເທີງແບບໃຊ້ທັກສະ ໃຊ້ແຕ້ມໃນລະບົບ ແລະ ລາງວັນທີ່ບໍ່ແມ່ນການຖອນເງິນສົດ.",
      },
      {
        question: "ໜ້າຫຼັກຂອງ ScoreMatrix ມີຫຍັງແດ່?",
        answer:
          "ໜ້າຫຼັກມີຄູ່ແຂ່ງສົດ, ໂປຣແກຣມມື້ນີ້, ຄູ່ເດັ່ນສຳລັບທາຍຜົນ, AI ວິເຄາະ, ພາລະກິດ, ລາງວັນ ແລະ ຂ່າວບານ.",
      },
    ],
  },
  my: {
    title: "ScoreMatrix | ဘောလုံးခန့်မှန်းချက်၊ တိုက်ရိုက်ရလဒ်၊ AI သုံးသပ်ချက်နှင့် ဆုများ",
    description:
      "ScoreMatrix သည် ကျွမ်းကျင်မှုအခြေပြု ဘောလုံးခန့်မှန်းပလက်ဖောင်းဖြစ်ပြီး တိုက်ရိုက်ရလဒ်၊ ပွဲစဉ်ဇယား၊ AI သုံးသပ်ချက်၊ မစ်ရှင်များ၊ အဆင့်ဇယားနှင့် လဲလှယ်နိုင်သော ဆုများ ပါဝင်သည်။",
    keywords: [
      "ဘောလုံးခန့်မှန်းချက်",
      "တိုက်ရိုက်ဘောလုံးရလဒ်",
      "ဘောလုံးပွဲစဉ်ဇယား",
      "AI ဘောလုံးသုံးသပ်ချက်",
      "ဘောလုံးဆုများ",
      "ခန့်မှန်းချက်အဆင့်ဇယား",
      "ကျွမ်းကျင်မှုအခြေပြုဘောလုံးဂိမ်း",
    ],
    ogTitle: "ScoreMatrix - ဘောလုံးခန့်မှန်းချက်၊ တိုက်ရိုက်ရလဒ်နှင့် ဆုများ",
    ogDescription:
      "ဘောလုံးပွဲစဉ်များ၊ တိုက်ရိုက်ရလဒ်၊ AI သုံးသပ်ချက်၊ မစ်ရှင်များ၊ အဆင့်ဇယားနှင့် အမှတ်လဲဆုများကို တစ်နေရာတည်းတွင် အသုံးပြုပါ။",
    faqTitle: "ScoreMatrix အကြောင်း မေးလေ့ရှိသော မေးခွန်းများ",
    faqs: [
      {
        question: "ScoreMatrix ဆိုတာဘာလဲ?",
        answer:
          "ScoreMatrix သည် ဘောလုံးပွဲစဉ်ဇယား၊ တိုက်ရိုက်ရလဒ်၊ AI သုံးသပ်ချက်၊ ခန့်မှန်းချက်၊ မစ်ရှင်၊ အဆင့်ဇယားနှင့် ဆုများအတွက် ပလက်ဖောင်းတစ်ခုဖြစ်သည်။",
      },
      {
        question: "ScoreMatrix သည် လောင်းကစားလား?",
        answer:
          "မဟုတ်ပါ။ ScoreMatrix သည် ကျွမ်းကျင်မှုအခြေပြု ဖျော်ဖြေရေးပလက်ဖောင်းဖြစ်ပြီး စနစ်အတွင်း အမှတ်များနှင့် ငွေသားထုတ်ယူခြင်းမဟုတ်သော ဆုများကိုသာ အသုံးပြုသည်။",
      },
      {
        question: "ScoreMatrix မူလစာမျက်နှာတွင် ဘာတွေပါလဲ?",
        answer:
          "မူလစာမျက်နှာတွင် တိုက်ရိုက်ပွဲများ၊ ယနေ့ပွဲစဉ်များ၊ ခန့်မှန်းရန် ထူးခြားပွဲများ၊ AI သုံးသပ်ချက်၊ မစ်ရှင်များ၊ ဆုများနှင့် ဘောလုံးသတင်းများ ပါဝင်သည်။",
      },
    ],
  },
  km: {
    title: "ScoreMatrix | ទស្សន៍ទាយបាល់ទាត់ ពិន្ទុផ្ទាល់ AI វិភាគ និងរង្វាន់",
    description:
      "ScoreMatrix គឺជាវេទិកាទស្សន៍ទាយបាល់ទាត់ផ្អែកលើជំនាញ មានពិន្ទុផ្ទាល់ កាលវិភាគប្រកួត AI វិភាគ បេសកកម្ម តារាងចំណាត់ថ្នាក់ និងរង្វាន់ដែលអាចប្ដូរបាន។",
    keywords: [
      "ទស្សន៍ទាយបាល់ទាត់",
      "ពិន្ទុបាល់ទាត់ផ្ទាល់",
      "កាលវិភាគបាល់ទាត់",
      "AI វិភាគបាល់ទាត់",
      "រង្វាន់បាល់ទាត់",
      "តារាងចំណាត់ថ្នាក់ទស្សន៍ទាយ",
      "ហ្គេមទស្សន៍ទាយបាល់ទាត់",
    ],
    ogTitle: "ScoreMatrix - ទស្សន៍ទាយបាល់ទាត់ ពិន្ទុផ្ទាល់ និងរង្វាន់",
    ogDescription:
      "តាមដានកាលវិភាគបាល់ទាត់ ពិន្ទុផ្ទាល់ AI វិភាគ បំពេញបេសកកម្ម ឡើងចំណាត់ថ្នាក់ និងប្ដូររង្វាន់ពីពិន្ទុ។",
    faqTitle: "សំណួរដែលសួរញឹកញាប់អំពី ScoreMatrix",
    faqs: [
      {
        question: "ScoreMatrix ជាអ្វី?",
        answer:
          "ScoreMatrix គឺជាវេទិកាបាល់ទាត់សម្រាប់មើលកាលវិភាគប្រកួត ពិន្ទុផ្ទាល់ AI វិភាគ ទស្សន៍ទាយ បំពេញបេសកកម្ម ឡើងចំណាត់ថ្នាក់ និងប្ដូររង្វាន់។",
      },
      {
        question: "ScoreMatrix ជាល្បែងភ្នាល់ឬទេ?",
        answer:
          "មិនមែនទេ។ ScoreMatrix ត្រូវបានរចនាជាវេទិកាកម្សាន្តផ្អែកលើជំនាញ ប្រើពិន្ទុនៅក្នុងប្រព័ន្ធ និងរង្វាន់ដែលមិនមែនជាការដកប្រាក់ពិត។",
      },
      {
        question: "ទំព័រដើម ScoreMatrix មានអ្វីខ្លះ?",
        answer:
          "ទំព័រដើមមានការប្រកួតផ្ទាល់ កម្មវិធីប្រកួតថ្ងៃនេះ គូពិសេសសម្រាប់ទស្សន៍ទាយ AI វិភាគ បេសកកម្ម រង្វាន់ និងព័ត៌មានបាល់ទាត់។",
      },
    ],
  },
  zh: {
    title: "ScoreMatrix | 足球预测、即时比分、AI 分析与奖励",
    description:
      "ScoreMatrix 是一个以技巧为核心的足球预测平台，提供即时比分、赛程、AI 赛事分析、任务、排行榜和可兑换奖励，不涉及真钱赌博。",
    keywords: [
      "足球预测",
      "即时比分",
      "足球赛程",
      "AI 足球分析",
      "足球奖励",
      "预测排行榜",
      "足球预测游戏",
      "无真钱投注",
    ],
    ogTitle: "ScoreMatrix - 足球预测、即时比分与奖励",
    ogDescription:
      "查看足球赛程和即时比分，使用 AI 分析辅助预测，完成任务，冲击排行榜，并用积分兑换奖励。",
    faqTitle: "ScoreMatrix 常见问题",
    faqs: [
      {
        question: "ScoreMatrix 是什么？",
        answer:
          "ScoreMatrix 是一个足球平台，提供赛程、即时比分、AI 分析、预测、任务、排行榜和积分奖励兑换功能。",
      },
      {
        question: "ScoreMatrix 是赌博平台吗？",
        answer:
          "不是。ScoreMatrix 是以技巧和足球知识为核心的娱乐平台，使用平台积分和非现金奖励，不提供真钱投注或提现。",
      },
      {
        question: "ScoreMatrix 首页包含哪些内容？",
        answer:
          "首页包含实时比赛、今日赛程、精选预测比赛、AI 分析、任务、奖励、足球新闻以及主要比赛中心入口。",
      },
    ],
  },
};

export function getHomeSeoContent(locale: string): HomeSeoContent {
  return content[locale as LocaleCode] ?? fallback;
}
