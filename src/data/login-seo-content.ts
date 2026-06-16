import type { LocaleCode } from "@/i18n";

type LoginSeoContent = {
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

const fallback: LoginSeoContent = {
  title: "ScoreMatrix Login | Access Football Predictions, Points & Rewards",
  description:
    "Log in to ScoreMatrix to manage your football predictions, points, missions, leaderboard progress, wallet and rewards in a secure account dashboard.",
  keywords: [
    "ScoreMatrix login",
    "football prediction login",
    "football predictions account",
    "login football rewards",
    "ScoreMatrix account",
    "prediction dashboard login",
    "football points login",
  ],
  ogTitle: "ScoreMatrix Login - Access Your Football Prediction Account",
  ogDescription:
    "Sign in to continue predicting matches, tracking points, managing missions and viewing rewards.",
  pageTitle: "Access your ScoreMatrix account",
  pageDescription:
    "Use the secure ScoreMatrix login page to return to your prediction dashboard, view personal progress, manage account activity and continue using football prediction features.",
  faqTitle: "ScoreMatrix Login FAQ",
  faqs: [
    {
      question: "What can I access after logging in?",
      answer:
        "Logging in unlocks prediction submissions, prediction history, profile settings, wallet details, missions, leaderboard progress and reward actions.",
    },
    {
      question: "Can I log in with email or username?",
      answer:
        "Yes. The login form accepts an email address or username along with your password.",
    },
    {
      question: "What if I forgot my password?",
      answer:
        "Use the forgot-password link on the login page to request a reset flow for the email associated with your account.",
    },
  ],
};

const content: Partial<Record<LocaleCode, LoginSeoContent>> = {
  th: {
    title: "เข้าสู่ระบบ ScoreMatrix | จัดการทายผลบอล แต้ม และรางวัล",
    description:
      "เข้าสู่ระบบ ScoreMatrix เพื่อจัดการคำทายผลบอล แต้ม ภารกิจ กระดานอันดับ กระเป๋า และรางวัลในแดชบอร์ดบัญชีที่ปลอดภัย",
    keywords: [
      "เข้าสู่ระบบ ScoreMatrix",
      "ล็อกอินทายผลบอล",
      "บัญชีทายผลบอล",
      "เข้าสู่ระบบรางวัลฟุตบอล",
      "บัญชี ScoreMatrix",
      "แดชบอร์ดทายผล",
      "ล็อกอินแต้มฟุตบอล",
    ],
    ogTitle: "ScoreMatrix Login - เข้าถึงบัญชีทายผลบอลของคุณ",
    ogDescription:
      "เข้าสู่ระบบเพื่อทายผลต่อ ติดตามแต้ม จัดการภารกิจ และดูรางวัลของคุณ",
    pageTitle: "เข้าสู่บัญชี ScoreMatrix ของคุณ",
    pageDescription:
      "ใช้หน้าเข้าสู่ระบบ ScoreMatrix ที่ปลอดภัยเพื่อกลับไปยังแดชบอร์ดการทายผล ดูความคืบหน้าส่วนตัว จัดการกิจกรรมบัญชี และใช้งานฟีเจอร์ทายผลบอลต่อ",
    faqTitle: "คำถามที่พบบ่อยเกี่ยวกับการเข้าสู่ระบบ ScoreMatrix",
    faqs: [
      {
        question: "หลังเข้าสู่ระบบแล้วใช้อะไรได้บ้าง?",
        answer:
          "การเข้าสู่ระบบจะปลดล็อกการส่งคำทาย ประวัติการทาย ตั้งค่าโปรไฟล์ รายละเอียดกระเป๋า ภารกิจ ความคืบหน้ากระดานอันดับ และการใช้งานรางวัล",
      },
      {
        question: "เข้าสู่ระบบด้วยอีเมลหรือชื่อผู้ใช้ได้ไหม?",
        answer:
          "ได้ ฟอร์มเข้าสู่ระบบรองรับอีเมลหรือชื่อผู้ใช้พร้อมรหัสผ่านของบัญชี",
      },
      {
        question: "ลืมรหัสผ่านต้องทำอย่างไร?",
        answer:
          "ใช้ลิงก์ลืมรหัสผ่านบนหน้า login เพื่อขอขั้นตอนตั้งรหัสผ่านใหม่สำหรับอีเมลที่ผูกกับบัญชี",
      },
    ],
  },
  en: fallback,
  lo: {
    title: "ເຂົ້າລະບົບ ScoreMatrix | ເຂົ້າເຖິງການທາຍຜົນ, ແຕ້ມ ແລະ ລາງວັນ",
    description:
      "ເຂົ້າລະບົບ ScoreMatrix ເພື່ອຈັດການຄຳທາຍຜົນບານ, ແຕ້ມ, ພາລະກິດ, ອັນດັບ, ກະເປົາ ແລະ ລາງວັນ.",
    keywords: [
      "ເຂົ້າລະບົບ ScoreMatrix",
      "login ທາຍຜົນບານ",
      "ບັນຊີທາຍຜົນບານ",
      "ບັນຊີ ScoreMatrix",
      "ລາງວັນບານ login",
    ],
    ogTitle: "ScoreMatrix Login - ເຂົ້າເຖິງບັນຊີທາຍຜົນບານ",
    ogDescription:
      "ເຂົ້າລະບົບເພື່ອທາຍຜົນຕໍ່, ຕິດຕາມແຕ້ມ, ຈັດການພາລະກິດ ແລະ ເບິ່ງລາງວັນ.",
    pageTitle: "ເຂົ້າເຖິງບັນຊີ ScoreMatrix ຂອງທ່ານ",
    pageDescription:
      "ໃຊ້ໜ້າ login ທີ່ປອດໄພເພື່ອກັບໄປຫາ dashboard ການທາຍຜົນ, ເບິ່ງຄວາມຄືບໜ້າ ແລະ ໃຊ້ຟີເຈີທາຍຜົນຕໍ່.",
    faqTitle: "ຄຳຖາມກ່ຽວກັບ ScoreMatrix Login",
    faqs: [
      {
        question: "ຫຼັງເຂົ້າລະບົບແລ້ວໃຊ້ຫຍັງໄດ້?",
        answer:
          "ປົດລັອກການສົ່ງຄຳທາຍ, ປະຫວັດການທາຍ, ໂປຣໄຟລ໌, ກະເປົາ, ພາລະກິດ, ອັນດັບ ແລະ ການໃຊ້ລາງວັນ.",
      },
      {
        question: "ເຂົ້າລະບົບດ້ວຍອີເມວ ຫຼື ຊື່ຜູ້ໃຊ້ໄດ້ບໍ?",
        answer:
          "ໄດ້ ຟອມ login ຮອງຮັບອີເມວ ຫຼື ຊື່ຜູ້ໃຊ້ພ້ອມລະຫັດຜ່ານ.",
      },
      {
        question: "ລືມລະຫັດຜ່ານຕ້ອງເຮັດແນວໃດ?",
        answer:
          "ໃຊ້ລິ້ງລືມລະຫັດຜ່ານໃນໜ້າ login ເພື່ອຂໍຂັ້ນຕອນຕັ້ງລະຫັດໃໝ່.",
      },
    ],
  },
  my: {
    title: "ScoreMatrix Login | ဘောလုံးခန့်မှန်းချက်၊ အမှတ်နှင့် ဆုများသို့ ဝင်ရန်",
    description:
      "ScoreMatrix သို့ login ဝင်ပြီး ဘောလုံးခန့်မှန်းချက်များ၊ points၊ missions၊ leaderboard progress၊ wallet နှင့် rewards များကို secure dashboard တွင် စီမံပါ။",
    keywords: [
      "ScoreMatrix login",
      "football prediction login",
      "ဘောလုံးခန့်မှန်း account",
      "ScoreMatrix account",
      "prediction dashboard login",
    ],
    ogTitle: "ScoreMatrix Login - သင့်ဘောလုံးခန့်မှန်း account သို့ ဝင်ပါ",
    ogDescription:
      "ပွဲခန့်မှန်းခြင်း၊ points tracking၊ missions နှင့် rewards များကို ဆက်လက်အသုံးပြုရန် sign in ဝင်ပါ။",
    pageTitle: "သင့် ScoreMatrix account သို့ ဝင်ပါ",
    pageDescription:
      "Secure ScoreMatrix login page ကို အသုံးပြုပြီး prediction dashboard သို့ ပြန်ဝင်၊ personal progress ကြည့်၊ account activity စီမံပြီး football prediction features များကို ဆက်အသုံးပြုပါ။",
    faqTitle: "ScoreMatrix Login မေးလေ့ရှိသော မေးခွန်းများ",
    faqs: [
      {
        question: "Login ဝင်ပြီး ဘာတွေသုံးနိုင်လဲ?",
        answer:
          "Prediction submissions၊ prediction history၊ profile settings၊ wallet details၊ missions၊ leaderboard progress နှင့် reward actions များကို အသုံးပြုနိုင်သည်။",
      },
      {
        question: "Email သို့မဟုတ် username ဖြင့် login ဝင်နိုင်လား?",
        answer:
          "ဝင်နိုင်သည်။ Login form သည် email address သို့မဟုတ် username နှင့် password ကို လက်ခံသည်။",
      },
      {
        question: "Password မေ့သွားရင် ဘာလုပ်ရမလဲ?",
        answer:
          "Account email အတွက် reset flow တောင်းရန် login page ရှိ forgot-password link ကို အသုံးပြုပါ။",
      },
    ],
  },
  km: {
    title: "ScoreMatrix Login | ចូលប្រើការទស្សន៍ទាយ ពិន្ទុ និងរង្វាន់",
    description:
      "ចូល ScoreMatrix ដើម្បីគ្រប់គ្រងការទស្សន៍ទាយបាល់ទាត់ ពិន្ទុ បេសកកម្ម ចំណាត់ថ្នាក់ កាបូប និងរង្វាន់ក្នុង dashboard គណនីសុវត្ថិភាព។",
    keywords: [
      "ScoreMatrix login",
      "ចូលទស្សន៍ទាយបាល់",
      "គណនីទស្សន៍ទាយបាល់",
      "ScoreMatrix account",
      "prediction dashboard login",
    ],
    ogTitle: "ScoreMatrix Login - ចូលគណនីទស្សន៍ទាយបាល់ទាត់",
    ogDescription:
      "ចូលដើម្បីបន្តទស្សន៍ទាយ តាមដានពិន្ទុ គ្រប់គ្រងបេសកកម្ម និងមើលរង្វាន់។",
    pageTitle: "ចូលគណនី ScoreMatrix របស់អ្នក",
    pageDescription:
      "ប្រើទំព័រ login សុវត្ថិភាពរបស់ ScoreMatrix ដើម្បីត្រឡប់ទៅ dashboard ទស្សន៍ទាយ មើលការរីកចម្រើនផ្ទាល់ខ្លួន និងបន្តប្រើមុខងារទស្សន៍ទាយបាល់ទាត់។",
    faqTitle: "សំណួរអំពី ScoreMatrix Login",
    faqs: [
      {
        question: "បន្ទាប់ពី login អាចប្រើអ្វីបានខ្លះ?",
        answer:
          "អាចដាក់ការទស្សន៍ទាយ មើលប្រវត្តិ កំណត់ profile ព័ត៌មានកាបូប បេសកកម្ម ចំណាត់ថ្នាក់ និងសកម្មភាពរង្វាន់។",
      },
      {
        question: "អាច login ដោយ email ឬ username បានទេ?",
        answer:
          "បាន។ Form login ទទួល email address ឬ username ជាមួយ password របស់អ្នក។",
      },
      {
        question: "បើភ្លេច password ត្រូវធ្វើដូចម្តេច?",
        answer:
          "ប្រើ link forgot-password នៅលើទំព័រ login ដើម្បីស្នើ reset flow សម្រាប់ email ដែលភ្ជាប់នឹងគណនី។",
      },
    ],
  },
  zh: {
    title: "ScoreMatrix 登录 | 访问足球预测、积分与奖励",
    description:
      "登录 ScoreMatrix，在安全账号面板中管理足球预测、积分、任务、排行榜进度、钱包和奖励。",
    keywords: [
      "ScoreMatrix 登录",
      "足球预测登录",
      "足球预测账号",
      "登录足球奖励",
      "ScoreMatrix 账号",
      "预测面板登录",
    ],
    ogTitle: "ScoreMatrix 登录 - 访问你的足球预测账号",
    ogDescription:
      "登录后继续预测比赛、跟踪积分、管理任务并查看奖励。",
    pageTitle: "访问你的 ScoreMatrix 账号",
    pageDescription:
      "使用安全的 ScoreMatrix 登录页返回预测面板，查看个人进度，管理账号活动，并继续使用足球预测功能。",
    faqTitle: "ScoreMatrix 登录常见问题",
    faqs: [
      {
        question: "登录后可以访问什么？",
        answer:
          "登录后可提交预测、查看预测历史、管理资料设置、查看钱包详情、任务、排行榜进度和奖励操作。",
      },
      {
        question: "可以用邮箱或用户名登录吗？",
        answer:
          "可以。登录表单支持使用邮箱地址或用户名加密码登录。",
      },
      {
        question: "忘记密码怎么办？",
        answer:
          "使用登录页上的忘记密码链接，为账号绑定邮箱请求重置流程。",
      },
    ],
  },
};

export function getLoginSeoContent(locale: string): LoginSeoContent {
  return content[locale as LocaleCode] ?? fallback;
}
