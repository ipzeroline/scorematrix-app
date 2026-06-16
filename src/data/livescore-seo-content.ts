import type { LocaleCode } from "@/i18n";

type LivescoreSeoContent = {
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

const fallback: LivescoreSeoContent = {
  title: "Live Football Scores Today | ScoreMatrix Real-Time Match Center",
  description:
    "Follow live football scores, match status, kickoff times, leagues, teams and real-time score updates on ScoreMatrix. Track global football matches in one fast match center.",
  keywords: [
    "live football scores",
    "livescore",
    "football live score",
    "soccer live scores",
    "football match center",
    "live match results",
    "football fixtures today",
    "ScoreMatrix livescore",
  ],
  ogTitle: "ScoreMatrix Livescore - Real-Time Football Match Center",
  ogDescription:
    "Track live football scores, match status, teams, leagues and kickoff times across global competitions.",
  pageTitle: "Live football scores and match updates",
  pageDescription:
    "Use ScoreMatrix Livescore to follow active football matches, filter by league, search teams, open match details and move into predictions when a match is available.",
  faqTitle: "Live Score FAQ",
  faqs: [
    {
      question: "What does the ScoreMatrix livescore page show?",
      answer:
        "It shows live football matches with teams, score, elapsed time, match status, league information and links to detailed match pages.",
    },
    {
      question: "How often are live scores updated?",
      answer:
        "The live score page refreshes automatically while the tab is visible and also lets users sync the latest match data manually.",
    },
    {
      question: "Can I use live scores for predictions?",
      answer:
        "Yes. Match detail and prediction links help you review the current match context before entering eligible prediction flows.",
    },
  ],
};

const content: Partial<Record<LocaleCode, LivescoreSeoContent>> = {
  th: {
    title: "ผลบอลสดวันนี้ | ScoreMatrix ศูนย์ผลฟุตบอลสดแบบเรียลไทม์",
    description:
      "ติดตามผลบอลสดวันนี้ สถานะแข่งขัน เวลาแข่ง ลีก ทีม และสกอร์แบบเรียลไทม์บน ScoreMatrix รวมคู่ฟุตบอลทั่วโลกไว้ในหน้าที่อ่านง่ายและรวดเร็ว",
    keywords: [
      "ผลบอลสด",
      "ผลบอลสดวันนี้",
      "ผลบอลล่าสุด",
      "บอลสด",
      "สกอร์บอลสด",
      "ตารางบอลวันนี้",
      "ผลฟุตบอลสด",
      "ScoreMatrix ผลบอลสด",
    ],
    ogTitle: "ScoreMatrix ผลบอลสด - ศูนย์ผลฟุตบอลสดแบบเรียลไทม์",
    ogDescription:
      "ดูผลบอลสด สถานะแมตช์ ทีม ลีก เวลาแข่ง และรายละเอียดการแข่งขันจากลีกทั่วโลกในหน้าเดียว",
    pageTitle: "ผลบอลสดและอัปเดตการแข่งขันแบบเรียลไทม์",
    pageDescription:
      "ใช้หน้า ScoreMatrix ผลบอลสดเพื่อติดตามคู่ที่กำลังแข่ง กรองตามลีก ค้นหาทีม เปิดรายละเอียดแมตช์ และต่อยอดไปยังหน้าทายผลเมื่อคู่แข่งขันพร้อมใช้งาน",
    faqTitle: "คำถามที่พบบ่อยเกี่ยวกับผลบอลสด",
    faqs: [
      {
        question: "หน้า ผลบอลสด ของ ScoreMatrix แสดงอะไรบ้าง?",
        answer:
          "หน้านี้แสดงคู่ฟุตบอลที่กำลังแข่งขัน ทีม สกอร์ เวลาที่เล่น สถานะแมตช์ ข้อมูลลีก และลิงก์ไปยังหน้ารายละเอียดการแข่งขัน",
      },
      {
        question: "ผลบอลสดอัปเดตบ่อยแค่ไหน?",
        answer:
          "หน้าผลบอลสดจะรีเฟรชอัตโนมัติเมื่อแท็บยังเปิดใช้งานอยู่ และผู้ใช้สามารถกดซิงก์เพื่อดึงข้อมูลล่าสุดได้ทันที",
      },
      {
        question: "ใช้ผลบอลสดช่วยทายผลได้ไหม?",
        answer:
          "ได้ ลิงก์รายละเอียดแมตช์และหน้าทายผลช่วยให้คุณดูบริบทของการแข่งขันก่อนเข้าสู่ flow ทายผลที่เปิดให้ใช้งาน",
      },
    ],
  },
  en: fallback,
  lo: {
    title: "ຜົນບານສົດມື້ນີ້ | ScoreMatrix ສູນຜົນບານແບບເວລາຈິງ",
    description:
      "ຕິດຕາມຜົນບານສົດ, ສະຖານະແຂ່ງ, ເວລາເລີ່ມ, ລີກ, ທີມ ແລະ ສະກໍແບບເວລາຈິງໃນ ScoreMatrix.",
    keywords: [
      "ຜົນບານສົດ",
      "ຜົນບານມື້ນີ້",
      "ສະກໍບານສົດ",
      "ບານສົດ",
      "ຕາຕະລາງບານມື້ນີ້",
      "ຜົນການແຂ່ງບານ",
      "ScoreMatrix ຜົນສົດ",
    ],
    ogTitle: "ScoreMatrix ຜົນບານສົດ - ສູນການແຂ່ງຂັນເວລາຈິງ",
    ogDescription:
      "ເບິ່ງຜົນບານສົດ, ສະຖານະແມັດ, ທີມ, ລີກ ແລະ ເວລາເລີ່ມຈາກລີກທົ່ວໂລກ.",
    pageTitle: "ຜົນບານສົດ ແລະ ອັບເດດການແຂ່ງແບບເວລາຈິງ",
    pageDescription:
      "ໃຊ້ ScoreMatrix ຜົນສົດເພື່ອຕິດຕາມຄູ່ທີ່ກຳລັງແຂ່ງ, ກັ່ນຕອງຕາມລີກ, ຄົ້ນຫາທີມ ແລະ ເປີດລາຍລະອຽດແມັດ.",
    faqTitle: "ຄຳຖາມກ່ຽວກັບຜົນບານສົດ",
    faqs: [
      {
        question: "ໜ້າຜົນສົດ ScoreMatrix ສະແດງຫຍັງ?",
        answer:
          "ສະແດງຄູ່ບານທີ່ກຳລັງແຂ່ງ, ທີມ, ສະກໍ, ເວລາທີ່ຫຼິ້ນ, ສະຖານະ, ລີກ ແລະ ລິ້ງໄປຫາລາຍລະອຽດແມັດ.",
      },
      {
        question: "ຜົນສົດອັບເດດຖີ່ແຄ່ໃດ?",
        answer:
          "ໜ້າຜົນສົດຈະອັບເດດອັດຕະໂນມັດເມື່ອແທັບຍັງເປີດຢູ່ ແລະ ສາມາດກົດຊິງກ໌ເອງໄດ້.",
      },
      {
        question: "ນຳຜົນສົດໄປຊ່ວຍທາຍຜົນໄດ້ບໍ?",
        answer:
          "ໄດ້ ລາຍລະອຽດແມັດ ແລະ ລິ້ງທາຍຜົນຊ່ວຍໃຫ້ກວດບໍລິບົດກ່ອນເຂົ້າ flow ທາຍຜົນທີ່ເປີດໃຊ້ງານ.",
      },
    ],
  },
  my: {
    title: "ယနေ့ တိုက်ရိုက်ဘောလုံးရလဒ် | ScoreMatrix Real-Time Match Center",
    description:
      "ScoreMatrix တွင် တိုက်ရိုက်ဘောလုံးရလဒ်၊ ပွဲအခြေအနေ၊ စတင်ချိန်၊ လိဂ်၊ အသင်းများနှင့် စကောကို အချိန်နှင့်တပြေးညီ ကြည့်ရှုပါ။",
    keywords: [
      "တိုက်ရိုက်ဘောလုံးရလဒ်",
      "ယနေ့ဘောလုံးရလဒ်",
      "live score",
      "ဘောလုံးစကော",
      "ဘောလုံးပွဲစဉ်",
      "ScoreMatrix livescore",
    ],
    ogTitle: "ScoreMatrix Livescore - အချိန်နှင့်တပြေးညီ ဘောလုံးရလဒ်",
    ogDescription:
      "ကမ္ဘာ့လိဂ်များမှ တိုက်ရိုက်ဘောလုံးရလဒ်၊ ပွဲအခြေအနေ၊ အသင်းများ၊ လိဂ်များနှင့် စတင်ချိန်များကို ကြည့်ရှုပါ။",
    pageTitle: "တိုက်ရိုက်ဘောလုံးရလဒ်နှင့် ပွဲအပ်ဒိတ်များ",
    pageDescription:
      "ScoreMatrix Livescore တွင် ကစားနေသောပွဲများကို လိုက်ကြည့်၊ လိဂ်အလိုက် စစ်ထုတ်၊ အသင်းရှာဖွေ၊ ပွဲအသေးစိတ်ဖွင့်ပြီး ခန့်မှန်း flow သို့ ဆက်သွားနိုင်သည်။",
    faqTitle: "တိုက်ရိုက်ရလဒ် မေးလေ့ရှိသော မေးခွန်းများ",
    faqs: [
      {
        question: "ScoreMatrix Livescore တွင် ဘာတွေပြသလဲ?",
        answer:
          "တိုက်ရိုက်ဘောလုံးပွဲများ၊ အသင်းများ၊ စကော၊ ကစားချိန်၊ ပွဲအခြေအနေ၊ လိဂ်အချက်အလက်နှင့် ပွဲအသေးစိတ်လင့်များကို ပြသသည်။",
      },
      {
        question: "တိုက်ရိုက်ရလဒ် ဘယ်လောက်ကြာတိုင်း အပ်ဒိတ်ဖြစ်လဲ?",
        answer:
          "စာမျက်နှာဖွင့်ထားစဉ် အလိုအလျောက် refresh လုပ်ပြီး Sync ခလုတ်ဖြင့်လည်း နောက်ဆုံးဒေတာကို ချက်ချင်းရယူနိုင်သည်။",
      },
      {
        question: "တိုက်ရိုက်ရလဒ်ကို ခန့်မှန်းရာတွင် အသုံးပြုနိုင်လား?",
        answer:
          "အသုံးပြုနိုင်သည်။ ပွဲအသေးစိတ်နှင့် ခန့်မှန်းလင့်များက ခန့်မှန်း flow မဝင်မီ ပွဲအခြေအနေကို စစ်ဆေးရန် ကူညီသည်။",
      },
    ],
  },
  km: {
    title: "ពិន្ទុបាល់ទាត់ផ្ទាល់ថ្ងៃនេះ | ScoreMatrix មជ្ឈមណ្ឌលប្រកួតពេលវេលាពិត",
    description:
      "តាមដានពិន្ទុបាល់ទាត់ផ្ទាល់ ស្ថានភាពប្រកួត ម៉ោងចាប់ផ្តើម លីគ ក្រុម និងពិន្ទុបច្ចុប្បន្ននៅលើ ScoreMatrix។",
    keywords: [
      "ពិន្ទុបាល់ទាត់ផ្ទាល់",
      "ពិន្ទុបាល់ថ្ងៃនេះ",
      "លទ្ធផលបាល់ទាត់",
      "បាល់ទាត់ផ្ទាល់",
      "កាលវិភាគបាល់ទាត់",
      "ScoreMatrix livescore",
    ],
    ogTitle: "ScoreMatrix ពិន្ទុផ្ទាល់ - មជ្ឈមណ្ឌលបាល់ទាត់ពេលវេលាពិត",
    ogDescription:
      "មើលពិន្ទុបាល់ទាត់ផ្ទាល់ ស្ថានភាពប្រកួត ក្រុម លីគ និងម៉ោងចាប់ផ្តើមពីលីគជុំវិញពិភពលោក។",
    pageTitle: "ពិន្ទុបាល់ទាត់ផ្ទាល់ និងអាប់ដេតការប្រកួត",
    pageDescription:
      "ប្រើ ScoreMatrix Livescore ដើម្បីតាមដានការប្រកួតកំពុងដំណើរការ តម្រងតាមលីគ ស្វែងរកក្រុម បើកព័ត៌មានលម្អិត និងបន្តទៅការទស្សន៍ទាយ។",
    faqTitle: "សំណួរអំពីពិន្ទុផ្ទាល់",
    faqs: [
      {
        question: "ទំព័រ ScoreMatrix Livescore បង្ហាញអ្វីខ្លះ?",
        answer:
          "បង្ហាញការប្រកួតបាល់ទាត់ផ្ទាល់ ក្រុម ពិន្ទុ ពេលវេលាលេង ស្ថានភាពប្រកួត ព័ត៌មានលីគ និងតំណទៅទំព័រលម្អិត។",
      },
      {
        question: "ពិន្ទុផ្ទាល់អាប់ដេតញឹកញាប់ប៉ុណ្ណា?",
        answer:
          "ទំព័រនេះ refresh ដោយស្វ័យប្រវត្តិពេល tab កំពុងបើក ហើយអ្នកប្រើអាចចុច Sync ដើម្បីទាញទិន្នន័យថ្មីភ្លាមៗ។",
      },
      {
        question: "អាចប្រើពិន្ទុផ្ទាល់សម្រាប់ទស្សន៍ទាយបានទេ?",
        answer:
          "បាន។ តំណលម្អិតការប្រកួត និងតំណទស្សន៍ទាយជួយឱ្យពិនិត្យបរិបទមុនចូល flow ទស្សន៍ទាយដែលអាចប្រើបាន។",
      },
    ],
  },
  zh: {
    title: "今日足球即时比分 | ScoreMatrix 实时比赛中心",
    description:
      "在 ScoreMatrix 追踪足球即时比分、比赛状态、开球时间、联赛、球队和实时赛果，一个页面查看全球足球比赛动态。",
    keywords: [
      "即时比分",
      "足球即时比分",
      "今日足球比分",
      "足球直播比分",
      "足球赛程",
      "比赛中心",
      "ScoreMatrix 即时比分",
    ],
    ogTitle: "ScoreMatrix 即时比分 - 实时足球比赛中心",
    ogDescription:
      "查看全球赛事的足球即时比分、比赛状态、球队、联赛和开球时间。",
    pageTitle: "足球即时比分与比赛更新",
    pageDescription:
      "使用 ScoreMatrix Livescore 跟踪正在进行的比赛，按联赛筛选，搜索球队，打开比赛详情，并在可用时进入预测流程。",
    faqTitle: "即时比分常见问题",
    faqs: [
      {
        question: "ScoreMatrix 即时比分页面显示什么？",
        answer:
          "页面显示正在进行的足球比赛、球队、比分、比赛时间、状态、联赛信息，以及进入比赛详情页的链接。",
      },
      {
        question: "即时比分多久更新一次？",
        answer:
          "当页面标签处于可见状态时会自动刷新，用户也可以点击同步按钮手动获取最新比赛数据。",
      },
      {
        question: "即时比分可以用于预测吗？",
        answer:
          "可以。比赛详情和预测入口可帮助你在进入可用的预测流程前查看当前比赛背景。",
      },
    ],
  },
};

export function getLivescoreSeoContent(locale: string): LivescoreSeoContent {
  return content[locale as LocaleCode] ?? fallback;
}
