import type { LocaleCode } from "@/i18n";

export const SUPPORT_EMAIL = "helloscorematrix@gmail.com";

type ContactChannel = {
  label: string;
  note: string;
};

type TeamContactContent = {
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  eyebrow: string;
  heroTitle: string;
  heroDescription: string;
  channelsTitle: string;
  channels: ContactChannel[];
  responseTitle: string;
  responseItems: string[];
  formTitle: string;
  formIntro: string;
  name: string;
  namePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  topic: string;
  topicPlaceholder: string;
  message: string;
  messagePlaceholder: string;
  send: string;
  sending: string;
  privacyNote: string;
  successTitle: string;
  successMessage: string;
  errorTitle: string;
  errorMessage: string;
  rateLimitMessage: string;
  faqTitle: string;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
};

const fallback: TeamContactContent = {
  title: "Contact ScoreMatrix Support | Account, Rewards, Privacy & Security",
  description:
    "Contact the ScoreMatrix team for account help, football prediction issues, points, rewards, privacy requests, legal reports, security concerns and product feedback.",
  keywords: [
    "contact ScoreMatrix",
    "ScoreMatrix support",
    "football prediction support",
    "ScoreMatrix email",
    "account help",
    "privacy request",
    "reward support",
    "security report",
  ],
  ogTitle: "Contact ScoreMatrix Support",
  ogDescription:
    "Reach the ScoreMatrix team for account, points, rewards, privacy, legal and security support.",
  eyebrow: "Support Center",
  heroTitle: "Contact the ScoreMatrix team",
  heroDescription:
    "Use the official support email for account questions, prediction issues, reward follow-ups, privacy requests, legal reports, security concerns and product feedback.",
  channelsTitle: "What we can help with",
  channels: [
    { label: "Account support", note: "Login, registration, profile, language, favorite team and access issues." },
    { label: "Predictions and points", note: "Prediction status, scoring questions, missions, leaderboard progress and point adjustments." },
    { label: "Rewards and credits", note: "Reward redemption, credit purchases, wallet history and reward availability." },
    { label: "Privacy, legal and security", note: "PDPA requests, unlawful content reports, responsible-use concerns, vulnerabilities and suspicious account activity." },
  ],
  responseTitle: "Expected response times",
  responseItems: [
    "Security or legal reports: within 24 hours when possible.",
    "Privacy requests: handled under the applicable PDPA process.",
    "Account, points and rewards: usually within 1-3 business days.",
    "Do not send passwords, card data or sensitive identity documents by email.",
  ],
  formTitle: "Send a clear support request",
  formIntro:
    "This form is protected by rate limiting and bot checks before it reaches the support mailbox.",
  name: "Name",
  namePlaceholder: "Your name",
  email: "Email",
  emailPlaceholder: "you@example.com",
  topic: "Topic",
  topicPlaceholder: "Account / points / rewards / privacy / security",
  message: "Message",
  messagePlaceholder: "Describe what happened, include match IDs or reward IDs if relevant...",
  send: "Send to support",
  sending: "Sending...",
  privacyNote:
    "Requests are sent to ScoreMatrix support. Do not include passwords, card numbers or sensitive documents.",
  successTitle: "Request sent",
  successMessage:
    "Your support request has been received. The team will review it and reply by email.",
  errorTitle: "Could not send",
  errorMessage:
    "Please check the details and try again. If the issue continues, email the team directly.",
  rateLimitMessage:
    "Too many requests were sent from this device. Please wait a few minutes and try again.",
  faqTitle: "Contact Support FAQ",
  faqs: [
    {
      question: "What is the official ScoreMatrix support email?",
      answer: `The official support email is ${SUPPORT_EMAIL}. Use it for account, points, rewards, privacy, legal, security and product support.`,
    },
    {
      question: "What should I include in a support request?",
      answer:
        "Include your username or account email, the page or feature involved, relevant match or reward IDs, screenshots if available, and a clear description of the issue.",
    },
    {
      question: "Can I request privacy or data changes?",
      answer:
        "Yes. You can request access, correction, deletion, restriction, objection or consent withdrawal where applicable under privacy law.",
    },
  ],
};

const content: Partial<Record<LocaleCode, TeamContactContent>> = {
  th: {
    title: "ติดต่อทีมงาน ScoreMatrix | บัญชี แต้ม รางวัล ความเป็นส่วนตัว และความปลอดภัย",
    description:
      "ติดต่อทีมงาน ScoreMatrix สำหรับปัญหาบัญชี การทายผลบอล แต้ม รางวัล คำขอข้อมูลส่วนบุคคล รายงานทางกฎหมาย ความปลอดภัย และข้อเสนอแนะ",
    keywords: [
      "ติดต่อ ScoreMatrix",
      "ทีมงาน ScoreMatrix",
      "อีเมล ScoreMatrix",
      "ช่วยเหลือทายผลบอล",
      "ปัญหาบัญชี",
      "ติดต่อเรื่องรางวัล",
      "คำขอข้อมูลส่วนบุคคล",
      "รายงานความปลอดภัย",
    ],
    ogTitle: "ติดต่อทีมงาน ScoreMatrix",
    ogDescription:
      "ติดต่อทีมงานเรื่องบัญชี แต้ม รางวัล ความเป็นส่วนตัว กฎหมาย ความปลอดภัย และข้อเสนอแนะ",
    eyebrow: "ศูนย์ช่วยเหลือ",
    heroTitle: "ติดต่อทีมงาน ScoreMatrix",
    heroDescription:
      "ใช้อีเมลทางการสำหรับคำถามเรื่องบัญชี ปัญหาการทายผล การติดตามรางวัล คำขอข้อมูลส่วนบุคคล รายงานทางกฎหมาย ความปลอดภัย และข้อเสนอแนะสินค้า",
    channelsTitle: "เรื่องที่ทีมงานช่วยได้",
    channels: [
      { label: "บัญชีและการเข้าสู่ระบบ", note: "สมัครสมาชิก เข้าสู่ระบบ โปรไฟล์ ภาษา ทีมโปรด และปัญหาการเข้าถึงบัญชี" },
      { label: "การทายผลและแต้ม", note: "สถานะคำทาย คำถามเรื่องคะแนน ภารกิจ กระดานอันดับ และการปรับแต้ม" },
      { label: "รางวัลและเครดิต", note: "การแลกรางวัล การซื้อเครดิต ประวัติกระเป๋า และสถานะรางวัล" },
      { label: "ความเป็นส่วนตัว กฎหมาย และความปลอดภัย", note: "คำขอ PDPA รายงานเนื้อหาผิดกฎหมาย การใช้งานเสี่ยง ช่องโหว่ และบัญชีผิดปกติ" },
    ],
    responseTitle: "เวลาตอบกลับโดยประมาณ",
    responseItems: [
      "รายงานความปลอดภัยหรือกฎหมาย: ภายใน 24 ชั่วโมงเมื่อทำได้",
      "คำขอข้อมูลส่วนบุคคล: ดำเนินการตามกระบวนการ PDPA ที่เกี่ยวข้อง",
      "บัญชี แต้ม และรางวัล: โดยทั่วไปภายใน 1-3 วันทำการ",
      "อย่าส่งรหัสผ่าน ข้อมูลบัตร หรือเอกสารสำคัญผ่านอีเมล",
    ],
    formTitle: "ส่งคำขอให้ชัดเจน",
    formIntro:
      "ฟอร์มนี้มีระบบจำกัดจำนวนคำขอและตรวจจับบอตก่อนส่งถึงกล่องอีเมลทีมงาน",
    name: "ชื่อ",
    namePlaceholder: "ชื่อของคุณ",
    email: "อีเมล",
    emailPlaceholder: "you@example.com",
    topic: "หัวข้อ",
    topicPlaceholder: "บัญชี / แต้ม / รางวัล / ความเป็นส่วนตัว / ความปลอดภัย",
    message: "ข้อความ",
    messagePlaceholder: "อธิบายปัญหา พร้อม match ID หรือ reward ID หากเกี่ยวข้อง...",
    send: "ส่งคำขอถึงทีมงาน",
    sending: "กำลังส่ง...",
    privacyNote:
      "คำขอจะถูกส่งถึงทีมงาน ScoreMatrix ห้ามใส่รหัสผ่าน เลขบัตร หรือเอกสารสำคัญในข้อความ",
    successTitle: "ส่งคำขอแล้ว",
    successMessage:
      "ทีมงานได้รับคำขอของคุณแล้ว และจะตรวจสอบเพื่อตอบกลับทางอีเมล",
    errorTitle: "ส่งไม่สำเร็จ",
    errorMessage:
      "กรุณาตรวจสอบข้อมูลแล้วลองใหม่ หากยังมีปัญหาให้ส่งอีเมลถึงทีมงานโดยตรง",
    rateLimitMessage:
      "มีการส่งคำขอจากอุปกรณ์นี้บ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่",
    faqTitle: "คำถามที่พบบ่อยเกี่ยวกับการติดต่อทีมงาน",
    faqs: [
      {
        question: "อีเมลติดต่อทีมงาน ScoreMatrix คืออะไร?",
        answer: `อีเมลทางการคือ ${SUPPORT_EMAIL} ใช้ติดต่อเรื่องบัญชี แต้ม รางวัล ความเป็นส่วนตัว กฎหมาย ความปลอดภัย และข้อเสนอแนะสินค้า`,
      },
      {
        question: "ควรใส่อะไรในคำขอช่วยเหลือ?",
        answer:
          "ใส่ชื่อผู้ใช้หรืออีเมลบัญชี หน้า/ฟีเจอร์ที่พบปัญหา match ID หรือ reward ID ที่เกี่ยวข้อง รูปภาพประกอบถ้ามี และคำอธิบายปัญหาให้ชัดเจน",
      },
      {
        question: "ขอแก้ไขหรือลบข้อมูลส่วนบุคคลได้ไหม?",
        answer:
          "ได้ คุณสามารถขอเข้าถึง แก้ไข ลบ จำกัดการใช้ คัดค้าน หรือถอนความยินยอมตามสิทธิที่เกี่ยวข้องภายใต้กฎหมายความเป็นส่วนตัว",
      },
    ],
  },
  en: fallback,
  lo: {
    ...fallback,
    title: "ຕິດຕໍ່ທີມ ScoreMatrix | ບັນຊີ, ແຕ້ມ, ລາງວັນ ແລະ ຄວາມປອດໄພ",
    description:
      "ຕິດຕໍ່ທີມ ScoreMatrix ສຳລັບບັນຊີ, ການທາຍຜົນບານ, ແຕ້ມ, ລາງວັນ, ຄຳຂໍຂໍ້ມູນສ່ວນຕົວ, ກົດໝາຍ ແລະ ຄວາມປອດໄພ.",
    keywords: ["ຕິດຕໍ່ ScoreMatrix", "ScoreMatrix support", "ຊ່ວຍເຫຼືອທາຍຜົນບານ", "ບັນຊີ ScoreMatrix", "ລາງວັນ", "ຄວາມປອດໄພ"],
    ogTitle: "ຕິດຕໍ່ທີມ ScoreMatrix",
    ogDescription: "ຕິດຕໍ່ທີມງານເລື່ອງບັນຊີ, ແຕ້ມ, ລາງວັນ, privacy, legal ແລະ security.",
    eyebrow: "ສູນຊ່ວຍເຫຼືອ",
    heroTitle: "ຕິດຕໍ່ທີມ ScoreMatrix",
    heroDescription: "ໃຊ້ອີເມວທາງການສຳລັບບັນຊີ, ການທາຍຜົນ, ລາງວັນ, ຄຳຂໍ privacy, legal, security ແລະ feedback.",
    channelsTitle: "ເລື່ອງທີ່ທີມງານຊ່ວຍໄດ້",
    channels: [
      { label: "ບັນຊີ", note: "ສະໝັກ, login, profile, ພາສາ, ທີມທີ່ມັກ ແລະການເຂົ້າເຖິງ." },
      { label: "ການທາຍຜົນ ແລະ ແຕ້ມ", note: "ສະຖານະຄຳທາຍ, ຄະແນນ, ພາລະກິດ, leaderboard." },
      { label: "ລາງວັນ ແລະ ເຄຣດິດ", note: "ການແລກລາງວັນ, ຊື້ເຄຣດິດ, wallet history." },
      { label: "Privacy, legal ແລະ security", note: "ຄຳຂໍ PDPA, ລາຍງານເນື້ອຫາ, ຊ່ອງໂຫວ່ ແລະບັນຊີຜິດປົກກະຕິ." },
    ],
    responseTitle: "ເວລາຕອບກັບໂດຍປະມານ",
    responseItems: ["Security/legal: ພາຍໃນ 24 ຊົ່ວໂມງເມື່ອເຮັດໄດ້", "Privacy: ຕາມຂັ້ນຕອນ PDPA", "ບັນຊີ/ແຕ້ມ/ລາງວັນ: 1-3 ວັນເຮັດການ", "ຢ່າສົ່ງລະຫັດຜ່ານ ຫຼືຂໍ້ມູນບັດທາງອີເມວ"],
    formTitle: "ສົ່ງຄຳຂໍຊ່ວຍເຫຼືອ",
    formIntro: "ຟອມນີ້ມີ rate limit ແລະ bot check ກ່ອນສົ່ງໄປຫາທີມ support.",
    name: "ຊື່",
    namePlaceholder: "ຊື່ຂອງທ່ານ",
    email: "ອີເມວ",
    topic: "ຫົວຂໍ້",
    topicPlaceholder: "ບັນຊີ / ແຕ້ມ / ລາງວັນ / privacy / security",
    message: "ຂໍ້ຄວາມ",
    messagePlaceholder: "ອະທິບາຍບັນຫາ ແລະໃສ່ match ID ຫຼື reward ID ຖ້າມີ...",
    send: "ສົ່ງໄປຫາທີມງານ",
    sending: "ກຳລັງສົ່ງ...",
    privacyNote: "ຢ່າໃສ່ password, ຂໍ້ມູນບັດ ຫຼືເອກະສານສຳຄັນໃນຂໍ້ຄວາມ.",
    successTitle: "ສົ່ງສຳເລັດ",
    successMessage: "ທີມງານໄດ້ຮັບຄຳຂໍແລ້ວ ແລະຈະຕອບກັບທາງອີເມວ.",
    errorTitle: "ສົ່ງບໍ່ສຳເລັດ",
    errorMessage: "ກວດຂໍ້ມູນແລ້ວລອງໃໝ່ ຫຼືສົ່ງອີເມວໂດຍກົງ.",
    rateLimitMessage: "ມີຄຳຂໍຫຼາຍເກີນໄປ ກະລຸນາລໍຖ້າແລ້ວລອງໃໝ່.",
    faqTitle: "ຄຳຖາມກ່ຽວກັບການຕິດຕໍ່",
  },
  my: {
    ...fallback,
    title: "ScoreMatrix Support ဆက်သွယ်ရန် | အကောင့်၊ အမှတ်၊ ဆု၊ Privacy နှင့် Security",
    description:
      "ScoreMatrix team ကို account help၊ football prediction issues၊ points၊ rewards၊ privacy requests၊ legal reports၊ security concerns နှင့် feedback အတွက် ဆက်သွယ်ပါ။",
    keywords: ["ScoreMatrix ဆက်သွယ်ရန်", "ScoreMatrix support", "football prediction support", "account help", "reward support", "security report"],
    ogTitle: "ScoreMatrix Support ကို ဆက်သွယ်ရန်",
    ogDescription: "Account၊ points၊ rewards၊ privacy၊ legal နှင့် security support အတွက် ScoreMatrix team ကို ဆက်သွယ်ပါ။",
    eyebrow: "Support Center",
    heroTitle: "ScoreMatrix team ကို ဆက်သွယ်ပါ",
    heroDescription: "Official support email ကို account questions၊ prediction issues၊ rewards၊ privacy requests၊ legal reports၊ security concerns နှင့် feedback အတွက် အသုံးပြုပါ။",
    channelsTitle: "ကျွန်ုပ်တို့ကူညီနိုင်သောအရာများ",
    channels: [
      { label: "Account support", note: "Login, registration, profile, language, favorite team and access issues." },
      { label: "Predictions and points", note: "Prediction status, scoring questions, missions, leaderboard progress and point adjustments." },
      { label: "Rewards and credits", note: "Reward redemption, credit purchases, wallet history and reward availability." },
      { label: "Privacy, legal and security", note: "Privacy requests, unlawful content reports, vulnerabilities and suspicious account activity." },
    ],
    responseTitle: "ပြန်လည်ဖြေကြားချိန်",
    responseItems: ["Security/legal reports: ဖြစ်နိုင်လျှင် 24 hours အတွင်း", "Privacy requests: applicable process အတိုင်း", "Account, points and rewards: 1-3 business days", "Passwords, card data or sensitive documents မပို့ပါနှင့်"],
    formTitle: "Support request ပို့ရန်",
    formIntro: "ဤ form တွင် support mailbox သို့ မပို့မီ rate limit နှင့် bot check ပါဝင်သည်။",
    name: "အမည်",
    namePlaceholder: "သင့်အမည်",
    email: "အီးမေးလ်",
    topic: "ခေါင်းစဉ်",
    topicPlaceholder: "Account / points / rewards / privacy / security",
    message: "စာသား",
    messagePlaceholder: "ဖြစ်ပျက်ခဲ့သည်ကို ရှင်းပြပြီး match ID သို့မဟုတ် reward ID ရှိပါက ထည့်ပါ...",
    send: "Support သို့ ပို့ရန်",
    sending: "ပို့နေသည်...",
    privacyNote: "Password, card data သို့မဟုတ် sensitive documents မထည့်ပါနှင့်။",
    successTitle: "Request ပို့ပြီးပါပြီ",
    successMessage: "Support team က သင့် request ကိုလက်ခံပြီး email ဖြင့် ပြန်လည်ဆက်သွယ်ပါမည်။",
    errorTitle: "မပို့နိုင်ပါ",
    errorMessage: "အချက်အလက်များစစ်ပြီး ထပ်မံကြိုးစားပါ။ ဆက်လက်မရပါက email တိုက်ရိုက်ပို့ပါ။",
    rateLimitMessage: "Request များလွန်းနေပါသည်။ ခဏစောင့်ပြီး ထပ်မံကြိုးစားပါ။",
    faqTitle: "Support ဆက်သွယ်ခြင်း FAQ",
  },
  km: {
    ...fallback,
    title: "ទាក់ទងក្រុម ScoreMatrix | គណនី ពិន្ទុ រង្វាន់ ភាពឯកជន និងសុវត្ថិភាព",
    description:
      "ទាក់ទងក្រុម ScoreMatrix សម្រាប់ជំនួយគណនី បញ្ហាទស្សន៍ទាយបាល់ ពិន្ទុ រង្វាន់ សំណើឯកជនភាព របាយការណ៍ផ្លូវច្បាប់ សុវត្ថិភាព និងមតិយោបល់។",
    keywords: ["ទាក់ទង ScoreMatrix", "ScoreMatrix support", "ជំនួយទស្សន៍ទាយបាល់", "ជំនួយគណនី", "រង្វាន់", "របាយការណ៍សុវត្ថិភាព"],
    ogTitle: "ទាក់ទងក្រុម ScoreMatrix",
    ogDescription: "ទាក់ទងក្រុម ScoreMatrix សម្រាប់គណនី ពិន្ទុ រង្វាន់ ឯកជនភាព ច្បាប់ និងសុវត្ថិភាព។",
    eyebrow: "មជ្ឈមណ្ឌលជំនួយ",
    heroTitle: "ទាក់ទងក្រុម ScoreMatrix",
    heroDescription: "ប្រើអ៊ីមែលផ្លូវការសម្រាប់សំណួរគណនី បញ្ហាទស្សន៍ទាយ រង្វាន់ សំណើឯកជនភាព របាយការណ៍ច្បាប់ សុវត្ថិភាព និងមតិយោបល់។",
    channelsTitle: "អ្វីដែលក្រុមអាចជួយបាន",
    channels: [
      { label: "ជំនួយគណនី", note: "Login, registration, profile, language, favorite team និង access issues." },
      { label: "ការទស្សន៍ទាយ និងពិន្ទុ", note: "ស្ថានភាពការទស្សន៍ទាយ សំណួរពិន្ទុ បេសកកម្ម និង leaderboard." },
      { label: "រង្វាន់ និងក្រេឌីត", note: "ការប្តូររង្វាន់ ការទិញក្រេឌីត wallet history និងស្ថានភាពរង្វាន់." },
      { label: "Privacy, legal និង security", note: "សំណើ privacy របាយការណ៍មាតិកាខុសច្បាប់ vulnerability និង account activity គួរឱ្យសង្ស័យ." },
    ],
    responseTitle: "ពេលវេលាឆ្លើយតបរំពឹងទុក",
    responseItems: ["Security/legal: ក្នុង 24 ម៉ោងបើអាចធ្វើបាន", "Privacy: តាមដំណើរការច្បាប់ដែលពាក់ព័ន្ធ", "គណនី ពិន្ទុ និងរង្វាន់: 1-3 ថ្ងៃធ្វើការ", "កុំផ្ញើ password, card data ឬឯកសារសំខាន់តាម email"],
    formTitle: "ផ្ញើសំណើជំនួយ",
    formIntro: "ទម្រង់នេះមាន rate limit និង bot check មុនពេលផ្ញើទៅកាន់ support mailbox។",
    name: "ឈ្មោះ",
    namePlaceholder: "ឈ្មោះរបស់អ្នក",
    email: "អ៊ីមែល",
    topic: "ប្រធានបទ",
    topicPlaceholder: "គណនី / ពិន្ទុ / រង្វាន់ / privacy / security",
    message: "សារ",
    messagePlaceholder: "ពិពណ៌នាបញ្ហា ហើយបញ្ចូល match ID ឬ reward ID ប្រសិនបើពាក់ព័ន្ធ...",
    send: "ផ្ញើទៅក្រុម",
    sending: "កំពុងផ្ញើ...",
    privacyNote: "កុំបញ្ចូល password, card data ឬឯកសារសំខាន់ៗក្នុងសារ។",
    successTitle: "បានផ្ញើសំណើ",
    successMessage: "ក្រុមបានទទួលសំណើរបស់អ្នក ហើយនឹងឆ្លើយតបតាមអ៊ីមែល។",
    errorTitle: "មិនអាចផ្ញើបាន",
    errorMessage: "សូមពិនិត្យព័ត៌មាន ហើយសាកល្បងម្តងទៀត ឬផ្ញើអ៊ីមែលដោយផ្ទាល់។",
    rateLimitMessage: "មានសំណើច្រើនពេកពីឧបករណ៍នេះ សូមរង់ចាំបន្តិច។",
    faqTitle: "FAQ ទាក់ទងជំនួយ",
  },
  zh: {
    ...fallback,
    title: "联系 ScoreMatrix 团队 | 账号、积分、奖励、隐私与安全",
    description:
      "联系 ScoreMatrix 团队，处理账号帮助、足球预测问题、积分、奖励、隐私请求、法律报告、安全问题和产品反馈。",
    keywords: ["联系 ScoreMatrix", "ScoreMatrix 客服", "足球预测客服", "账号帮助", "隐私请求", "奖励支持", "安全报告"],
    ogTitle: "联系 ScoreMatrix 支持团队",
    ogDescription: "联系 ScoreMatrix 团队，获取账号、积分、奖励、隐私、法律和安全支持。",
    eyebrow: "支持中心",
    heroTitle: "联系 ScoreMatrix 团队",
    heroDescription: "使用官方支持邮箱处理账号问题、预测问题、奖励跟进、隐私请求、法律报告、安全问题和产品反馈。",
    channelsTitle: "我们可以协助的事项",
    channels: [
      { label: "账号支持", note: "登录、注册、资料、语言、喜欢的球队和访问问题。" },
      { label: "预测与积分", note: "预测状态、计分问题、任务、排行榜进度和积分调整。" },
      { label: "奖励与点数", note: "奖励兑换、点数购买、钱包历史和奖励状态。" },
      { label: "隐私、法律与安全", note: "隐私请求、违法内容报告、漏洞和可疑账号活动。" },
    ],
    responseTitle: "预计回复时间",
    responseItems: ["安全或法律报告：可行时 24 小时内", "隐私请求：按适用流程处理", "账号、积分和奖励：通常 1-3 个工作日", "请勿通过邮件发送密码、银行卡信息或敏感证件"],
    formTitle: "发送清晰的支持请求",
    formIntro: "此表单在发送到支持邮箱前会经过请求频率限制和机器人检测。",
    name: "姓名",
    namePlaceholder: "你的姓名",
    email: "邮箱",
    topic: "主题",
    topicPlaceholder: "账号 / 积分 / 奖励 / 隐私 / 安全",
    message: "消息",
    messagePlaceholder: "说明发生了什么，如相关请附 match ID 或 reward ID...",
    send: "发送给团队",
    sending: "正在发送...",
    privacyNote: "请勿在消息中填写密码、银行卡信息或敏感证件。",
    successTitle: "请求已发送",
    successMessage: "支持团队已收到你的请求，并会通过电子邮件回复。",
    errorTitle: "发送失败",
    errorMessage: "请检查信息后重试。如问题持续，请直接发送电子邮件。",
    rateLimitMessage: "此设备发送请求过于频繁，请稍后再试。",
    faqTitle: "联系支持常见问题",
  },
};

export function getTeamContactContent(locale: string): TeamContactContent {
  return content[locale as LocaleCode] ?? fallback;
}
