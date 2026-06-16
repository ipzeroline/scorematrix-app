import type { LocaleCode } from "@/i18n";

type PredictSeoContent = {
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

const fallback: PredictSeoContent = {
  title: "Football Predictions Today | Skill-Based Match Prediction Hub | ScoreMatrix",
  description:
    "Make skill-based football predictions on ScoreMatrix using match context, AI insights, fixtures, confidence levels and points-based scoring with no real-money gambling.",
  keywords: [
    "football predictions",
    "football predictions today",
    "soccer predictions",
    "match prediction game",
    "predict football scores",
    "skill-based football predictions",
    "football prediction points",
    "ScoreMatrix predict",
  ],
  ogTitle: "ScoreMatrix Predict - Skill-Based Football Predictions",
  ogDescription:
    "Review fixtures, AI context and match details before submitting points-based football predictions.",
  pageTitle: "Football prediction hub for skill-based match picks",
  pageDescription:
    "Use ScoreMatrix Predict to find eligible fixtures, review match context, sign in when needed, submit score predictions and track prediction history through a points-based system.",
  faqTitle: "Football Prediction FAQ",
  faqs: [
    {
      question: "What is ScoreMatrix Predict?",
      answer:
        "ScoreMatrix Predict is a football prediction hub where users review eligible matches and submit score predictions using platform points and skill-based rules.",
    },
    {
      question: "Is ScoreMatrix Predict gambling?",
      answer:
        "No. ScoreMatrix is designed around platform points, missions, rankings and rewards without real-money betting, cash withdrawal or wagering currency.",
    },
    {
      question: "Do I need to log in to predict?",
      answer:
        "Guests can browse the prediction hub, but submitting predictions and viewing personal prediction history requires an account session.",
    },
  ],
};

const content: Partial<Record<LocaleCode, PredictSeoContent>> = {
  th: {
    title: "ทายผลบอลวันนี้ | ศูนย์ทายผลฟุตบอลแบบใช้ทักษะ | ScoreMatrix",
    description:
      "ทายผลบอลบน ScoreMatrix ด้วยข้อมูลแมตช์ AI วิเคราะห์ โปรแกรมแข่งขัน ระดับความมั่นใจ และระบบคะแนนแบบใช้ทักษะ โดยไม่มีการพนันด้วยเงินจริง",
    keywords: [
      "ทายผลบอล",
      "ทายผลบอลวันนี้",
      "ทายสกอร์บอล",
      "เกมทายผลฟุตบอล",
      "ทายบอลใช้ทักษะ",
      "ทายผลฟุตบอลไม่มีเงินจริง",
      "คะแนนทายบอล",
      "ScoreMatrix ทายผล",
    ],
    ogTitle: "ScoreMatrix Predict - ทายผลบอลแบบใช้ทักษะ",
    ogDescription:
      "ดูโปรแกรมแข่งขัน บริบทแมตช์ และ AI วิเคราะห์ ก่อนส่งคำทายผลฟุตบอลด้วยระบบคะแนน",
    pageTitle: "ศูนย์ทายผลบอลสำหรับการเลือกแมตช์แบบใช้ทักษะ",
    pageDescription:
      "ใช้ ScoreMatrix Predict เพื่อค้นหาคู่ที่ทายได้ ตรวจสอบบริบทการแข่งขัน เข้าสู่ระบบเมื่อจำเป็น ส่งคำทายสกอร์ และติดตามประวัติการทายในระบบคะแนน",
    faqTitle: "คำถามที่พบบ่อยเกี่ยวกับการทายผลบอล",
    faqs: [
      {
        question: "ScoreMatrix Predict คืออะไร?",
        answer:
          "ScoreMatrix Predict คือศูนย์ทายผลบอลที่ให้ผู้ใช้ดูคู่ที่เปิดให้ทายและส่งคำทายสกอร์ด้วยกติกาแบบใช้ทักษะและคะแนนในระบบ",
      },
      {
        question: "ScoreMatrix Predict เป็นการพนันไหม?",
        answer:
          "ไม่ใช่ ScoreMatrix ออกแบบด้วยแต้ม ภารกิจ อันดับ และรางวัล โดยไม่มีการเดิมพันด้วยเงินจริง ไม่มีการถอนเงินสด และไม่มีสกุลเงินเดิมพัน",
      },
      {
        question: "ต้องเข้าสู่ระบบก่อนทายผลไหม?",
        answer:
          "ผู้เยี่ยมชมดูหน้าศูนย์ทายผลได้ แต่การส่งคำทายและดูประวัติการทายส่วนตัวต้องมีบัญชีและเซสชันเข้าสู่ระบบ",
      },
    ],
  },
  en: fallback,
  lo: {
    title: "ທາຍຜົນບານມື້ນີ້ | ສູນທາຍຜົນແບບໃຊ້ທັກສະ | ScoreMatrix",
    description:
      "ທາຍຜົນບານໃນ ScoreMatrix ດ້ວຍບໍລິບົດແມັດ, AI ວິເຄາະ, ຕາຕະລາງແຂ່ງ, ລະດັບຄວາມໝັ້ນໃຈ ແລະ ລະບົບຄະແນນແບບໃຊ້ທັກສະ.",
    keywords: [
      "ທາຍຜົນບານ",
      "ທາຍຜົນບານມື້ນີ້",
      "ທາຍສະກໍບານ",
      "ເກມທາຍຜົນບານ",
      "ທາຍບານໃຊ້ທັກສະ",
      "ScoreMatrix Predict",
    ],
    ogTitle: "ScoreMatrix Predict - ທາຍຜົນບານແບບໃຊ້ທັກສະ",
    ogDescription:
      "ກວດຕາຕະລາງແຂ່ງ, ບໍລິບົດແມັດ ແລະ AI ວິເຄາະ ກ່ອນສົ່ງຄຳທາຍຜົນດ້ວຍລະບົບຄະແນນ.",
    pageTitle: "ສູນທາຍຜົນບານສຳລັບການເລືອກແມັດແບບໃຊ້ທັກສະ",
    pageDescription:
      "ໃຊ້ ScoreMatrix Predict ເພື່ອຫາຄູ່ທີ່ທາຍໄດ້, ກວດບໍລິບົດ, ເຂົ້າລະບົບເມື່ອຈຳເປັນ, ສົ່ງຄຳທາຍສະກໍ ແລະ ຕິດຕາມປະຫວັດ.",
    faqTitle: "ຄຳຖາມກ່ຽວກັບການທາຍຜົນບານ",
    faqs: [
      {
        question: "ScoreMatrix Predict ແມ່ນຫຍັງ?",
        answer:
          "ແມ່ນສູນທາຍຜົນບານທີ່ໃຫ້ຜູ້ໃຊ້ກວດຄູ່ທີ່ເປີດໃຫ້ທາຍ ແລະ ສົ່ງຄຳທາຍສະກໍດ້ວຍກະຕິກາແບບໃຊ້ທັກສະ.",
      },
      {
        question: "ScoreMatrix Predict ເປັນການພະນັນບໍ?",
        answer:
          "ບໍ່ແມ່ນ ແພລດຟອມໃຊ້ແຕ້ມ, ພາລະກິດ, ອັນດັບ ແລະ ລາງວັນ ໂດຍບໍ່ມີການພະນັນເງິນຈິງ ຫຼື ຖອນເງິນສົດ.",
      },
      {
        question: "ຕ້ອງເຂົ້າລະບົບກ່ອນທາຍຜົນບໍ?",
        answer:
          "ຜູ້ເຂົ້າຊົມສາມາດເບິ່ງສູນທາຍຜົນໄດ້ ແຕ່ການສົ່ງຄຳທາຍ ແລະ ປະຫວັດສ່ວນຕົວຕ້ອງມີບັນຊີ.",
      },
    ],
  },
  my: {
    title: "ယနေ့ ဘောလုံးခန့်မှန်းချက် | Skill-Based Match Prediction Hub | ScoreMatrix",
    description:
      "ScoreMatrix တွင် match context၊ AI insights၊ fixtures၊ confidence levels နှင့် points-based scoring ဖြင့် skill-based ဘောလုံးခန့်မှန်းချက်များ ပြုလုပ်ပါ။",
    keywords: [
      "ဘောလုံးခန့်မှန်းချက်",
      "ယနေ့ဘောလုံးခန့်မှန်းချက်",
      "ဘောလုံးစကောခန့်မှန်း",
      "match prediction game",
      "skill-based predictions",
      "ScoreMatrix Predict",
    ],
    ogTitle: "ScoreMatrix Predict - Skill-Based ဘောလုံးခန့်မှန်းချက်",
    ogDescription:
      "fixtures၊ AI context နှင့် match details ကို စစ်ဆေးပြီး points-based ဘောလုံးခန့်မှန်းချက်များ တင်ပါ။",
    pageTitle: "Skill-based match picks အတွက် ဘောလုံးခန့်မှန်း hub",
    pageDescription:
      "ScoreMatrix Predict တွင် ခန့်မှန်းနိုင်သော fixtures ကိုရှာ၊ match context ကိုစစ်၊ လိုအပ်ပါက login ဝင်၊ score predictions တင်ပြီး prediction history ကို လိုက်ကြည့်ပါ။",
    faqTitle: "ဘောလုံးခန့်မှန်းချက် မေးလေ့ရှိသော မေးခွန်းများ",
    faqs: [
      {
        question: "ScoreMatrix Predict ဆိုတာဘာလဲ?",
        answer:
          "ScoreMatrix Predict သည် users များ eligible matches ကိုကြည့်ပြီး platform points နှင့် skill-based rules ဖြင့် score predictions တင်နိုင်သော football prediction hub ဖြစ်သည်။",
      },
      {
        question: "ScoreMatrix Predict သည် လောင်းကစားလား?",
        answer:
          "မဟုတ်ပါ။ ScoreMatrix သည် platform points၊ missions၊ rankings နှင့် rewards အပေါ်အခြေခံပြီး real-money betting သို့မဟုတ် cash withdrawal မပါဝင်ပါ။",
      },
      {
        question: "ခန့်မှန်းရန် login လိုအပ်လား?",
        answer:
          "Guests များသည် prediction hub ကိုကြည့်နိုင်သော်လည်း prediction တင်ခြင်းနှင့် personal history ကြည့်ခြင်းအတွက် account session လိုအပ်သည်။",
      },
    ],
  },
  km: {
    title: "ទស្សន៍ទាយបាល់ទាត់ថ្ងៃនេះ | មជ្ឈមណ្ឌលទស្សន៍ទាយផ្អែកលើជំនាញ | ScoreMatrix",
    description:
      "ទស្សន៍ទាយបាល់ទាត់លើ ScoreMatrix ដោយប្រើបរិបទប្រកួត AI insights កាលវិភាគ កម្រិតទំនុកចិត្ត និងប្រព័ន្ធពិន្ទុផ្អែកលើជំនាញ។",
    keywords: [
      "ទស្សន៍ទាយបាល់ទាត់",
      "ទស្សន៍ទាយបាល់ថ្ងៃនេះ",
      "ទស្សន៍ទាយពិន្ទុបាល់",
      "ហ្គេមទស្សន៍ទាយបាល់",
      "skill-based football predictions",
      "ScoreMatrix Predict",
    ],
    ogTitle: "ScoreMatrix Predict - ទស្សន៍ទាយបាល់ទាត់ផ្អែកលើជំនាញ",
    ogDescription:
      "ពិនិត្យកាលវិភាគ បរិបទប្រកួត និង AI analysis មុនដាក់ការទស្សន៍ទាយបាល់ទាត់តាមប្រព័ន្ធពិន្ទុ។",
    pageTitle: "មជ្ឈមណ្ឌលទស្សន៍ទាយបាល់ទាត់សម្រាប់ការជ្រើសរើសប្រកួតដោយជំនាញ",
    pageDescription:
      "ប្រើ ScoreMatrix Predict ដើម្បីរកការប្រកួតដែលអាចទស្សន៍ទាយបាន ពិនិត្យបរិបទ ចូលគណនីពេលត្រូវការ ដាក់ការទស្សន៍ទាយពិន្ទុ និងតាមដានប្រវត្តិ។",
    faqTitle: "សំណួរអំពីការទស្សន៍ទាយបាល់ទាត់",
    faqs: [
      {
        question: "ScoreMatrix Predict ជាអ្វី?",
        answer:
          "ScoreMatrix Predict គឺជាមជ្ឈមណ្ឌលទស្សន៍ទាយបាល់ទាត់ ដែលឱ្យអ្នកប្រើមើលប្រកួតដែលអាចទាយបាន និងដាក់ការទស្សន៍ទាយពិន្ទុដោយច្បាប់ផ្អែកលើជំនាញ។",
      },
      {
        question: "ScoreMatrix Predict ជាល្បែងភ្នាល់ឬទេ?",
        answer:
          "មិនមែនទេ។ ScoreMatrix ផ្អែកលើពិន្ទុ បេសកកម្ម ចំណាត់ថ្នាក់ និងរង្វាន់ ដោយគ្មានការភ្នាល់ប្រាក់ពិត ឬដកសាច់ប្រាក់។",
      },
      {
        question: "ត្រូវ login ដើម្បីទស្សន៍ទាយទេ?",
        answer:
          "អ្នកមិនទាន់ login អាចមើល prediction hub បាន ប៉ុន្តែការដាក់ការទស្សន៍ទាយ និងមើលប្រវត្តិផ្ទាល់ខ្លួនត្រូវការគណនី។",
      },
    ],
  },
  zh: {
    title: "今日足球预测 | 技巧型比赛预测中心 | ScoreMatrix",
    description:
      "在 ScoreMatrix 使用比赛背景、AI 分析、赛程、信心等级和积分计分系统进行技巧型足球预测，不涉及真钱赌博。",
    keywords: [
      "足球预测",
      "今日足球预测",
      "足球比分预测",
      "比赛预测游戏",
      "技巧型足球预测",
      "足球预测积分",
      "ScoreMatrix Predict",
    ],
    ogTitle: "ScoreMatrix Predict - 技巧型足球预测",
    ogDescription:
      "在提交积分制足球预测前，查看赛程、AI 背景和比赛详情。",
    pageTitle: "技巧型比赛选择的足球预测中心",
    pageDescription:
      "使用 ScoreMatrix Predict 查找可预测赛程，查看比赛背景，在需要时登录，提交比分预测，并通过积分系统跟踪预测历史。",
    faqTitle: "足球预测常见问题",
    faqs: [
      {
        question: "ScoreMatrix Predict 是什么？",
        answer:
          "ScoreMatrix Predict 是足球预测中心，用户可以查看可预测比赛，并根据技巧型规则和平台积分提交比分预测。",
      },
      {
        question: "ScoreMatrix Predict 是赌博吗？",
        answer:
          "不是。ScoreMatrix 围绕平台积分、任务、排名和奖励设计，不提供真钱投注、现金提现或投注平台货币。",
      },
      {
        question: "预测需要登录吗？",
        answer:
          "访客可以浏览预测中心，但提交预测和查看个人预测历史需要账户登录状态。",
      },
    ],
  },
};

export function getPredictSeoContent(locale: string): PredictSeoContent {
  return content[locale as LocaleCode] ?? fallback;
}
