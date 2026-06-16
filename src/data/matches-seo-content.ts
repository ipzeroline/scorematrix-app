import type { LocaleCode } from "@/i18n";

type MatchesSeoContent = {
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

const fallback: MatchesSeoContent = {
  title: "Football Matches Today | Fixtures, Live Status & Schedule | ScoreMatrix",
  description:
    "Browse today's football matches, fixtures, kickoff times, live status, finished results, leagues and prediction entry points on ScoreMatrix.",
  keywords: [
    "football matches today",
    "football fixtures",
    "soccer fixtures",
    "match schedule",
    "today football schedule",
    "live football matches",
    "upcoming football matches",
    "ScoreMatrix matches",
  ],
  ogTitle: "ScoreMatrix Matches - Football Fixtures and Match Schedule",
  ogDescription:
    "Explore football fixtures by date, league and match status with live, upcoming and finished match views.",
  pageTitle: "Football fixtures, match schedule and live status",
  pageDescription:
    "Use ScoreMatrix Matches to check daily football fixtures, switch dates, filter leagues, search teams and open match details or prediction flows when available.",
  faqTitle: "Football Matches FAQ",
  faqs: [
    {
      question: "What can I find on the ScoreMatrix matches page?",
      answer:
        "You can find daily football fixtures with kickoff times, leagues, teams, match status, scores and links to match details or eligible prediction pages.",
    },
    {
      question: "Can I filter matches by league or status?",
      answer:
        "Yes. The page supports date navigation, league filters, team search and status tabs for live, upcoming, finished, postponed and cancelled matches.",
    },
    {
      question: "Are match pages public?",
      answer:
        "The match schedule and match details are public, while protected prediction or account actions redirect guests to login when required.",
    },
  ],
};

const content: Partial<Record<LocaleCode, MatchesSeoContent>> = {
  th: {
    title: "ตารางบอลวันนี้ | โปรแกรมบอล สถานะสด และการแข่งขัน | ScoreMatrix",
    description:
      "ดูตารางบอลวันนี้ โปรแกรมแข่งขัน เวลาแข่ง สถานะสด ผลจบแล้ว ลีก และทางเข้าทายผลบน ScoreMatrix ในหน้าที่ค้นหาและกรองได้ง่าย",
    keywords: [
      "ตารางบอลวันนี้",
      "โปรแกรมบอล",
      "ตารางการแข่งขันฟุตบอล",
      "ฟุตบอลวันนี้",
      "คู่บอลวันนี้",
      "บอลสดวันนี้",
      "โปรแกรมฟุตบอล",
      "ScoreMatrix การแข่งขัน",
    ],
    ogTitle: "ScoreMatrix การแข่งขัน - ตารางบอลและโปรแกรมฟุตบอล",
    ogDescription:
      "ดูโปรแกรมบอลตามวัน ลีก และสถานะแมตช์ ทั้งคู่สด คู่ที่กำลังจะมาถึง และผลการแข่งขันย้อนหลัง",
    pageTitle: "ตารางบอล โปรแกรมแข่งขัน และสถานะแมตช์",
    pageDescription:
      "ใช้หน้า ScoreMatrix การแข่งขันเพื่อตรวจสอบโปรแกรมบอลรายวัน เปลี่ยนวันแข่ง กรองลีก ค้นหาทีม และเปิดรายละเอียดแมตช์หรือหน้าทายผลเมื่อพร้อมใช้งาน",
    faqTitle: "คำถามที่พบบ่อยเกี่ยวกับตารางแข่งขัน",
    faqs: [
      {
        question: "หน้า การแข่งขัน ของ ScoreMatrix มีอะไรบ้าง?",
        answer:
          "มีโปรแกรมบอลรายวัน เวลาแข่ง ลีก ทีม สถานะแมตช์ สกอร์ และลิงก์ไปยังหน้ารายละเอียดการแข่งขันหรือหน้าทายผลที่เปิดใช้งาน",
      },
      {
        question: "กรองการแข่งขันตามลีกหรือสถานะได้ไหม?",
        answer:
          "ได้ หน้านี้รองรับการเปลี่ยนวัน กรองลีก ค้นหาทีม และแท็บสถานะแมตช์ เช่น สด กำลังจะแข่ง จบแล้ว เลื่อนแข่ง และยกเลิก",
      },
      {
        question: "หน้าการแข่งขันดูได้โดยไม่ต้องเข้าสู่ระบบไหม?",
        answer:
          "ดูตารางแข่งขันและรายละเอียดแมตช์ได้แบบสาธารณะ แต่ action ที่เป็นการทายผลหรือข้อมูลบัญชีจะพาไปเข้าสู่ระบบเมื่อจำเป็น",
      },
    ],
  },
  en: fallback,
  lo: {
    title: "ຕາຕະລາງບານມື້ນີ້ | ໂປຣແກຣມແຂ່ງ ແລະ ສະຖານະສົດ | ScoreMatrix",
    description:
      "ເບິ່ງຕາຕະລາງບານມື້ນີ້, ເວລາແຂ່ງ, ສະຖານະສົດ, ຜົນທີ່ຈົບແລ້ວ, ລີກ ແລະ ທາງເຂົ້າທາຍຜົນໃນ ScoreMatrix.",
    keywords: [
      "ຕາຕະລາງບານມື້ນີ້",
      "ໂປຣແກຣມບານ",
      "ການແຂ່ງຂັນບານ",
      "ບານມື້ນີ້",
      "ຜົນບານສົດ",
      "ScoreMatrix matches",
    ],
    ogTitle: "ScoreMatrix Matches - ຕາຕະລາງ ແລະ ໂປຣແກຣມບານ",
    ogDescription:
      "ສຳຫຼວດການແຂ່ງຂັນຕາມວັນ, ລີກ ແລະ ສະຖານະ ທັງສົດ, ກຳລັງຈະແຂ່ງ ແລະ ຈົບແລ້ວ.",
    pageTitle: "ຕາຕະລາງບານ, ໂປຣແກຣມແຂ່ງ ແລະ ສະຖານະແມັດ",
    pageDescription:
      "ໃຊ້ ScoreMatrix Matches ເພື່ອເບິ່ງໂປຣແກຣມບານລາຍວັນ, ປ່ຽນວັນ, ກັ່ນຕອງລີກ, ຄົ້ນຫາທີມ ແລະ ເປີດລາຍລະອຽດແມັດ.",
    faqTitle: "ຄຳຖາມກ່ຽວກັບຕາຕະລາງແຂ່ງ",
    faqs: [
      {
        question: "ໜ້າ Matches ຂອງ ScoreMatrix ມີຫຍັງ?",
        answer:
          "ມີຕາຕະລາງແຂ່ງລາຍວັນ, ເວລາແຂ່ງ, ລີກ, ທີມ, ສະຖານະ, ສະກໍ ແລະ ລິ້ງໄປຫາລາຍລະອຽດຫຼືທາຍຜົນ.",
      },
      {
        question: "ກັ່ນຕອງຕາມລີກ ຫຼື ສະຖານະໄດ້ບໍ?",
        answer:
          "ໄດ້ ສາມາດປ່ຽນວັນ, ກັ່ນຕອງລີກ, ຄົ້ນຫາທີມ ແລະ ເລືອກແທັບສະຖານະແມັດ.",
      },
      {
        question: "ໜ້າການແຂ່ງຂັນເປັນສາທາລະນະບໍ?",
        answer:
          "ຕາຕະລາງແຂ່ງ ແລະ ລາຍລະອຽດແມັດເບິ່ງໄດ້ສາທາລະນະ ແຕ່ action ທີ່ຕ້ອງໃຊ້ບັນຊີຈະພາໄປເຂົ້າລະບົບ.",
      },
    ],
  },
  my: {
    title: "ယနေ့ ဘောလုံးပွဲစဉ်များ | ပွဲဇယား၊ Live Status နှင့် Schedule | ScoreMatrix",
    description:
      "ScoreMatrix တွင် ယနေ့ဘောလုံးပွဲစဉ်များ၊ စတင်ချိန်၊ live status၊ ပြီးဆုံးရလဒ်၊ လိဂ်များနှင့် ခန့်မှန်းရန် ဝင်ပေါက်များကို ကြည့်ရှုပါ။",
    keywords: [
      "ယနေ့ဘောလုံးပွဲများ",
      "ဘောလုံးပွဲစဉ်",
      "ဘောလုံးဇယား",
      "football fixtures",
      "တိုက်ရိုက်ဘောလုံး",
      "ScoreMatrix matches",
    ],
    ogTitle: "ScoreMatrix Matches - ဘောလုံးပွဲစဉ်နှင့် Schedule",
    ogDescription:
      "နေ့ရက်၊ လိဂ်နှင့် ပွဲအခြေအနေအလိုက် live, upcoming နှင့် finished ပွဲများကို ကြည့်ရှုပါ။",
    pageTitle: "ဘောလုံးပွဲစဉ်၊ Schedule နှင့် Live Status",
    pageDescription:
      "ScoreMatrix Matches တွင် နေ့စဉ်ပွဲဇယားကြည့်၊ နေ့ရက်ပြောင်း၊ လိဂ်စစ်ထုတ်၊ အသင်းရှာဖွေပြီး ပွဲအသေးစိတ် သို့မဟုတ် ခန့်မှန်း flow သို့ ဝင်နိုင်သည်။",
    faqTitle: "ဘောလုံးပွဲစဉ် မေးလေ့ရှိသော မေးခွန်းများ",
    faqs: [
      {
        question: "ScoreMatrix matches စာမျက်နှာမှာ ဘာတွေရှိလဲ?",
        answer:
          "နေ့စဉ်ဘောလုံးပွဲစဉ်များ၊ စတင်ချိန်၊ လိဂ်၊ အသင်းများ၊ ပွဲအခြေအနေ၊ စကောနှင့် ပွဲအသေးစိတ်/ခန့်မှန်းလင့်များ ပါဝင်သည်။",
      },
      {
        question: "လိဂ် သို့မဟုတ် status အလိုက် စစ်ထုတ်နိုင်လား?",
        answer:
          "နိုင်သည်။ နေ့ရက်ပြောင်းခြင်း၊ လိဂ်စစ်ထုတ်ခြင်း၊ အသင်းရှာဖွေခြင်းနှင့် live/upcoming/finished status tabs များကို အသုံးပြုနိုင်သည်။",
      },
      {
        question: "Matches စာမျက်နှာကို login မလုပ်ဘဲ ကြည့်နိုင်လား?",
        answer:
          "ပွဲစဉ်ဇယားနှင့် ပွဲအသေးစိတ်များကို public ကြည့်နိုင်ပြီး ခန့်မှန်းခြင်း သို့မဟုတ် account action များအတွက် login လိုအပ်နိုင်သည်။",
      },
    ],
  },
  km: {
    title: "ការប្រកួតបាល់ទាត់ថ្ងៃនេះ | កាលវិភាគ ស្ថានភាពផ្ទាល់ | ScoreMatrix",
    description:
      "មើលការប្រកួតបាល់ទាត់ថ្ងៃនេះ កាលវិភាគ ម៉ោងចាប់ផ្តើម ស្ថានភាពផ្ទាល់ លទ្ធផល លីគ និងច្រកចូលទស្សន៍ទាយនៅលើ ScoreMatrix។",
    keywords: [
      "ការប្រកួតបាល់ទាត់ថ្ងៃនេះ",
      "កាលវិភាគបាល់ទាត់",
      "កម្មវិធីប្រកួតបាល់ទាត់",
      "បាល់ទាត់ថ្ងៃនេះ",
      "ពិន្ទុផ្ទាល់",
      "ScoreMatrix matches",
    ],
    ogTitle: "ScoreMatrix Matches - កាលវិភាគ និងការប្រកួតបាល់ទាត់",
    ogDescription:
      "ស្វែងរកការប្រកួតតាមថ្ងៃ លីគ និងស្ថានភាព រួមមានផ្ទាល់ ជិតចាប់ផ្តើម និងបានបញ្ចប់។",
    pageTitle: "កាលវិភាគបាល់ទាត់ កម្មវិធីប្រកួត និងស្ថានភាព",
    pageDescription:
      "ប្រើ ScoreMatrix Matches ដើម្បីពិនិត្យការប្រកួតប្រចាំថ្ងៃ ប្តូរថ្ងៃ តម្រងលីគ ស្វែងរកក្រុម និងបើកព័ត៌មានលម្អិត ឬ flow ទស្សន៍ទាយ។",
    faqTitle: "សំណួរអំពីការប្រកួតបាល់ទាត់",
    faqs: [
      {
        question: "ទំព័រ Matches របស់ ScoreMatrix មានអ្វីខ្លះ?",
        answer:
          "មានការប្រកួតប្រចាំថ្ងៃ ម៉ោងចាប់ផ្តើម លីគ ក្រុម ស្ថានភាព ពិន្ទុ និងតំណទៅទំព័រលម្អិត ឬទស្សន៍ទាយ។",
      },
      {
        question: "អាចតម្រងតាមលីគ ឬស្ថានភាពបានទេ?",
        answer:
          "បាន។ អ្នកអាចប្តូរថ្ងៃ តម្រងតាមលីគ ស្វែងរកក្រុម និងប្រើ status tabs សម្រាប់ផ្ទាល់ ជិតចាប់ផ្តើម និងបានបញ្ចប់។",
      },
      {
        question: "ទំព័រការប្រកួតជាសាធារណៈឬទេ?",
        answer:
          "កាលវិភាគ និងព័ត៌មានលម្អិតការប្រកួតអាចមើលបានជាសាធារណៈ ប៉ុន្តែ action ទស្សន៍ទាយ ឬគណនីអាចត្រូវការ login។",
      },
    ],
  },
  zh: {
    title: "今日足球比赛 | 赛程、实时状态与比赛中心 | ScoreMatrix",
    description:
      "在 ScoreMatrix 浏览今日足球比赛、赛程、开球时间、实时状态、已完赛结果、联赛和预测入口。",
    keywords: [
      "今日足球比赛",
      "足球赛程",
      "足球比赛",
      "比赛时间",
      "即时比赛",
      "足球 fixtures",
      "ScoreMatrix matches",
    ],
    ogTitle: "ScoreMatrix Matches - 足球赛程与比赛中心",
    ogDescription:
      "按日期、联赛和比赛状态查看直播、即将开始和已结束的足球比赛。",
    pageTitle: "足球赛程、比赛安排与实时状态",
    pageDescription:
      "使用 ScoreMatrix Matches 查看每日赛程，切换日期，按联赛筛选，搜索球队，并在可用时打开比赛详情或进入预测流程。",
    faqTitle: "足球比赛常见问题",
    faqs: [
      {
        question: "ScoreMatrix 比赛页面提供什么？",
        answer:
          "页面提供每日足球赛程、开球时间、联赛、球队、比赛状态、比分，以及比赛详情或可用预测页面的链接。",
      },
      {
        question: "可以按联赛或状态筛选比赛吗？",
        answer:
          "可以。页面支持日期切换、联赛筛选、球队搜索，以及直播、即将开始、已结束、延期和取消等状态标签。",
      },
      {
        question: "比赛页面需要登录才能查看吗？",
        answer:
          "赛程和比赛详情是公开页面，预测或账户相关操作在需要时会引导访客登录。",
      },
    ],
  },
};

export function getMatchesSeoContent(locale: string): MatchesSeoContent {
  return content[locale as LocaleCode] ?? fallback;
}
