import type { LocaleCode } from "@/i18n";

type RegisterSeoContent = {
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

const fallback: RegisterSeoContent = {
  title: "Sign Up for ScoreMatrix | Football Predictions, Live Scores & Rewards",
  description:
    "Create a free ScoreMatrix account to join a skill-based football prediction platform with live scores, AI match insights, missions, leaderboards and redeemable rewards.",
  keywords: [
    "sign up ScoreMatrix",
    "football prediction account",
    "football prediction app",
    "join football predictions",
    "skill-based football game",
    "football rewards account",
    "ScoreMatrix register",
  ],
  ogTitle: "Join ScoreMatrix - Skill-Based Football Predictions",
  ogDescription:
    "Create an account to predict football matches, follow AI insights, complete missions, climb leaderboards and redeem rewards.",
  pageTitle: "Create your ScoreMatrix account",
  pageDescription:
    "Register to unlock prediction submissions, personal history, missions, leaderboard progress, favorite team settings and rewards in a football platform built around skill and points.",
  faqTitle: "ScoreMatrix Sign Up FAQ",
  faqs: [
    {
      question: "Why create a ScoreMatrix account?",
      answer:
        "An account lets you submit predictions, track prediction history, earn points, complete missions, join leaderboards and redeem eligible rewards.",
    },
    {
      question: "Is signing up free?",
      answer:
        "Yes. You can create an account for free. ScoreMatrix uses platform points and rewards without real-money betting or cash withdrawal.",
    },
    {
      question: "What information is needed to register?",
      answer:
        "The basic required fields are username, email, password and acceptance of the terms. Optional profile fields help personalize language, country and favorite team settings.",
    },
  ],
};

const content: Partial<Record<LocaleCode, RegisterSeoContent>> = {
  th: {
    title: "สมัครสมาชิก ScoreMatrix | ทายผลบอล ผลบอลสด และรางวัลฟุตบอล",
    description:
      "สร้างบัญชี ScoreMatrix ฟรี เพื่อเข้าร่วมแพลตฟอร์มทายผลบอลแบบใช้ทักษะ พร้อมผลบอลสด AI วิเคราะห์ ภารกิจ กระดานอันดับ และรางวัลที่แลกได้",
    keywords: [
      "สมัคร ScoreMatrix",
      "สมัครทายผลบอล",
      "สมัครเกมทายผลฟุตบอล",
      "ทายผลบอล",
      "แอปทายผลบอล",
      "รางวัลฟุตบอล",
      "สมัครสมาชิกฟุตบอล",
    ],
    ogTitle: "สมัคร ScoreMatrix - ทายผลบอลแบบใช้ทักษะ",
    ogDescription:
      "สร้างบัญชีเพื่อทายผลบอล ดู AI วิเคราะห์ ทำภารกิจ ไต่อันดับ และแลกรางวัลจากแต้มในระบบ",
    pageTitle: "สร้างบัญชี ScoreMatrix ของคุณ",
    pageDescription:
      "สมัครสมาชิกเพื่อปลดล็อกการส่งคำทาย ประวัติการทาย ภารกิจ ความคืบหน้าบนกระดานอันดับ การตั้งค่าทีมโปรด และรางวัลในแพลตฟอร์มฟุตบอลที่ใช้ทักษะและแต้ม",
    faqTitle: "คำถามที่พบบ่อยเกี่ยวกับการสมัคร ScoreMatrix",
    faqs: [
      {
        question: "ทำไมต้องสร้างบัญชี ScoreMatrix?",
        answer:
          "บัญชีช่วยให้คุณส่งคำทาย ติดตามประวัติการทาย สะสมแต้ม ทำภารกิจ เข้าร่วมกระดานอันดับ และแลกรางวัลที่เข้าเงื่อนไข",
      },
      {
        question: "สมัครสมาชิกฟรีไหม?",
        answer:
          "สมัครฟรี ScoreMatrix ใช้แต้มและรางวัลในระบบ โดยไม่มีการเดิมพันด้วยเงินจริงหรือการถอนเงินสด",
      },
      {
        question: "ต้องใช้ข้อมูลอะไรในการสมัคร?",
        answer:
          "ข้อมูลหลักคือชื่อผู้ใช้ อีเมล รหัสผ่าน และการยอมรับเงื่อนไข ส่วนข้อมูลโปรไฟล์เพิ่มเติมช่วยปรับภาษา ประเทศ และทีมโปรดให้เหมาะกับคุณ",
      },
    ],
  },
  en: fallback,
  lo: {
    title: "ສະໝັກ ScoreMatrix | ທາຍຜົນບານ, ຜົນສົດ ແລະ ລາງວັນ",
    description:
      "ສ້າງບັນຊີ ScoreMatrix ຟຣີ ເພື່ອເຂົ້າຮ່ວມແພລດຟອມທາຍຜົນບານແບບໃຊ້ທັກສະ ພ້ອມຜົນສົດ, AI ວິເຄາະ, ພາລະກິດ, ອັນດັບ ແລະ ລາງວັນ.",
    keywords: [
      "ສະໝັກ ScoreMatrix",
      "ສະໝັກທາຍຜົນບານ",
      "ເກມທາຍຜົນບານ",
      "ທາຍຜົນບານ",
      "ລາງວັນບານ",
      "ScoreMatrix register",
    ],
    ogTitle: "ເຂົ້າຮ່ວມ ScoreMatrix - ທາຍຜົນບານແບບໃຊ້ທັກສະ",
    ogDescription:
      "ສ້າງບັນຊີເພື່ອທາຍຜົນບານ, ຕິດຕາມ AI, ເຮັດພາລະກິດ, ໄຕ່ອັນດັບ ແລະ ແລກລາງວັນ.",
    pageTitle: "ສ້າງບັນຊີ ScoreMatrix ຂອງທ່ານ",
    pageDescription:
      "ສະໝັກເພື່ອປົດລັອກການສົ່ງຄຳທາຍ, ປະຫວັດການທາຍ, ພາລະກິດ, ຄວາມຄືບໜ້າໃນອັນດັບ, ທີມທີ່ມັກ ແລະ ລາງວັນ.",
    faqTitle: "ຄຳຖາມກ່ຽວກັບການສະໝັກ ScoreMatrix",
    faqs: [
      {
        question: "ເປັນຫຍັງຕ້ອງສ້າງບັນຊີ ScoreMatrix?",
        answer:
          "ບັນຊີຊ່ວຍໃຫ້ສົ່ງຄຳທາຍ, ຕິດຕາມປະຫວັດ, ສະສົມແຕ້ມ, ເຮັດພາລະກິດ, ເຂົ້າອັນດັບ ແລະ ແລກລາງວັນ.",
      },
      {
        question: "ສະໝັກຟຣີບໍ?",
        answer:
          "ສະໝັກຟຣີ ScoreMatrix ໃຊ້ແຕ້ມ ແລະ ລາງວັນໃນລະບົບ ໂດຍບໍ່ມີການພະນັນເງິນຈິງ ຫຼື ຖອນເງິນສົດ.",
      },
      {
        question: "ຕ້ອງໃຊ້ຂໍ້ມູນຫຍັງໃນການສະໝັກ?",
        answer:
          "ຂໍ້ມູນຫຼັກແມ່ນຊື່ຜູ້ໃຊ້, ອີເມວ, ລະຫັດຜ່ານ ແລະ ການຍອມຮັບເງື່ອນໄຂ. ຂໍ້ມູນເພີ່ມເຕີມຊ່ວຍປັບປະສົບການ.",
      },
    ],
  },
  my: {
    title: "ScoreMatrix စာရင်းသွင်းရန် | ဘောလုံးခန့်မှန်းချက်၊ တိုက်ရိုက်ရလဒ်နှင့် ဆုများ",
    description:
      "ScoreMatrix အခမဲ့အကောင့် ဖန်တီးပြီး skill-based ဘောလုံးခန့်မှန်းပလက်ဖောင်း၊ live scores၊ AI insights၊ missions၊ leaderboards နှင့် rewards များကို အသုံးပြုပါ။",
    keywords: [
      "ScoreMatrix စာရင်းသွင်း",
      "ဘောလုံးခန့်မှန်း account",
      "football prediction app",
      "ဘောလုံးခန့်မှန်းဂိမ်း",
      "football rewards account",
    ],
    ogTitle: "ScoreMatrix တွင် ပါဝင်ပါ - Skill-Based Football Predictions",
    ogDescription:
      "ဘောလုံးခန့်မှန်း၊ AI insights ကြည့်၊ missions လုပ်၊ leaderboard တက်ပြီး rewards လဲရန် account ဖန်တီးပါ။",
    pageTitle: "သင့် ScoreMatrix အကောင့်ကို ဖန်တီးပါ",
    pageDescription:
      "Prediction submissions၊ personal history၊ missions၊ leaderboard progress၊ favorite team settings နှင့် rewards များကို unlock လုပ်ရန် register လုပ်ပါ။",
    faqTitle: "ScoreMatrix Sign Up မေးလေ့ရှိသော မေးခွန်းများ",
    faqs: [
      {
        question: "ဘာကြောင့် ScoreMatrix account ဖန်တီးသင့်လဲ?",
        answer:
          "Account ဖြင့် predictions တင်၊ history ကြည့်၊ points ရယူ၊ missions ပြီးမြောက်၊ leaderboards ဝင်ပြီး eligible rewards လဲနိုင်သည်။",
      },
      {
        question: "စာရင်းသွင်းခြင်း အခမဲ့လား?",
        answer:
          "ဟုတ်ကဲ့ အခမဲ့ဖြစ်သည်။ ScoreMatrix သည် platform points နှင့် rewards ကိုအသုံးပြုပြီး real-money betting သို့မဟုတ် cash withdrawal မပါဝင်ပါ။",
      },
      {
        question: "Register လုပ်ရန် ဘာအချက်အလက်လိုလဲ?",
        answer:
          "အခြေခံလိုအပ်ချက်များမှာ username၊ email၊ password နှင့် terms လက်ခံခြင်းဖြစ်သည်။ Optional profile fields များက language၊ country နှင့် favorite team ကို personalize လုပ်နိုင်စေသည်။",
      },
    ],
  },
  km: {
    title: "ចុះឈ្មោះ ScoreMatrix | ទស្សន៍ទាយបាល់ទាត់ ពិន្ទុផ្ទាល់ និងរង្វាន់",
    description:
      "បង្កើតគណនី ScoreMatrix ឥតគិតថ្លៃ ដើម្បីចូលរួមវេទិកាទស្សន៍ទាយបាល់ទាត់ផ្អែកលើជំនាញ មានពិន្ទុផ្ទាល់ AI insights បេសកកម្ម តារាងចំណាត់ថ្នាក់ និងរង្វាន់។",
    keywords: [
      "ចុះឈ្មោះ ScoreMatrix",
      "គណនីទស្សន៍ទាយបាល់ទាត់",
      "កម្មវិធីទស្សន៍ទាយបាល់",
      "ហ្គេមទស្សន៍ទាយបាល់",
      "រង្វាន់បាល់ទាត់",
    ],
    ogTitle: "ចូលរួម ScoreMatrix - ទស្សន៍ទាយបាល់ទាត់ផ្អែកលើជំនាញ",
    ogDescription:
      "បង្កើតគណនីដើម្បីទស្សន៍ទាយបាល់ទាត់ តាមដាន AI insights បំពេញបេសកកម្ម ឡើងចំណាត់ថ្នាក់ និងប្ដូររង្វាន់។",
    pageTitle: "បង្កើតគណនី ScoreMatrix របស់អ្នក",
    pageDescription:
      "ចុះឈ្មោះដើម្បីដោះសោការដាក់ការទស្សន៍ទាយ ប្រវត្តិផ្ទាល់ខ្លួន បេសកកម្ម ចំណាត់ថ្នាក់ ការកំណត់ក្រុមចូលចិត្ត និងរង្វាន់។",
    faqTitle: "សំណួរអំពីការចុះឈ្មោះ ScoreMatrix",
    faqs: [
      {
        question: "ហេតុអ្វីត្រូវបង្កើតគណនី ScoreMatrix?",
        answer:
          "គណនីអាចឱ្យអ្នកដាក់ការទស្សន៍ទាយ តាមដានប្រវត្តិ រកពិន្ទុ បំពេញបេសកកម្ម ចូលរួមតារាងចំណាត់ថ្នាក់ និងប្ដូររង្វាន់។",
      },
      {
        question: "ចុះឈ្មោះឥតគិតថ្លៃទេ?",
        answer:
          "បាទ/ចាស ឥតគិតថ្លៃ។ ScoreMatrix ប្រើពិន្ទុ និងរង្វាន់ក្នុងប្រព័ន្ធ ដោយគ្មានការភ្នាល់ប្រាក់ពិត ឬដកសាច់ប្រាក់។",
      },
      {
        question: "ត្រូវការព័ត៌មានអ្វីខ្លះដើម្បីចុះឈ្មោះ?",
        answer:
          "ព័ត៌មានចាំបាច់គឺ username, email, password និងការទទួលយកលក្ខខណ្ឌ។ ព័ត៌មានបន្ថែមជួយកំណត់ភាសា ប្រទេស និងក្រុមចូលចិត្ត។",
      },
    ],
  },
  zh: {
    title: "注册 ScoreMatrix | 足球预测、即时比分与奖励",
    description:
      "免费创建 ScoreMatrix 账号，加入技巧型足球预测平台，使用即时比分、AI 比赛分析、任务、排行榜和可兑换奖励。",
    keywords: [
      "注册 ScoreMatrix",
      "足球预测账号",
      "足球预测应用",
      "加入足球预测",
      "技巧型足球游戏",
      "足球奖励账号",
    ],
    ogTitle: "加入 ScoreMatrix - 技巧型足球预测",
    ogDescription:
      "创建账号，预测足球比赛，查看 AI 分析，完成任务，冲击排行榜并兑换奖励。",
    pageTitle: "创建你的 ScoreMatrix 账号",
    pageDescription:
      "注册后可提交预测、查看个人历史、完成任务、提升排行榜进度、设置喜欢的球队，并在以技巧和积分为核心的平台中兑换奖励。",
    faqTitle: "ScoreMatrix 注册常见问题",
    faqs: [
      {
        question: "为什么要创建 ScoreMatrix 账号？",
        answer:
          "账号可用于提交预测、跟踪预测历史、获得积分、完成任务、参与排行榜，并兑换符合条件的奖励。",
      },
      {
        question: "注册是免费的吗？",
        answer:
          "是的，可以免费创建账号。ScoreMatrix 使用平台积分和奖励，不提供真钱投注或现金提现。",
      },
      {
        question: "注册需要哪些信息？",
        answer:
          "基本必填信息包括用户名、邮箱、密码和接受条款。可选资料可帮助个性化语言、国家和喜欢的球队设置。",
      },
    ],
  },
};

export function getRegisterSeoContent(locale: string): RegisterSeoContent {
  return content[locale as LocaleCode] ?? fallback;
}
