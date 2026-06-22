import { SITE_NAME } from "@/lib/site";

type WorldCupSeoContent = {
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  keywords: string[];
  contentTitle: string;
  contentIntro: string;
  factsTitle: string;
  facts: string[];
  faqTitle: string;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
};

const sharedKeywords = [
  "FIFA World Cup 2026",
  "World Cup 2026",
  "World Cup groups",
  "World Cup standings",
  "World Cup fixtures",
  "World Cup schedule",
  "football live scores",
  "football predictions",
  "ScoreMatrix",
];

const content: Record<string, WorldCupSeoContent> = {
  th: {
    metaTitle: "ฟุตบอลโลก 2026 ตารางกลุ่ม โปรแกรม ตารางคะแนน",
    metaDescription:
      "ตารางกลุ่มฟุตบอลโลก 2026 ครบ 12 กลุ่ม 48 ทีม พร้อมโปรแกรมรอบแบ่งกลุ่ม ตารางคะแนน ลิงก์ทีม และข้อมูลทัวร์นาเมนต์บน ScoreMatrix",
    ogTitle: "ฟุตบอลโลก 2026 ตารางกลุ่ม โปรแกรม และอันดับ | ScoreMatrix",
    ogDescription:
      "ติดตาม FIFA World Cup 2026 แบบอ่านเร็ว: 48 ทีม 12 กลุ่ม โปรแกรมรอบแบ่งกลุ่ม ตารางคะแนน และคู่แข่งขันในเวลาไทย",
    keywords: [
      "ฟุตบอลโลก 2026",
      "ตารางฟุตบอลโลก 2026",
      "ตารางคะแนนฟุตบอลโลก",
      "โปรแกรมฟุตบอลโลก",
      "กลุ่มฟุตบอลโลก 2026",
      "ทายผลฟุตบอลโลก",
      ...sharedKeywords,
    ],
    contentTitle: "ศูนย์ข้อมูลฟุตบอลโลก 2026",
    contentIntro:
      "หน้านี้รวมตารางกลุ่ม โปรแกรมรอบแบ่งกลุ่ม และอันดับของ FIFA World Cup 2026 สำหรับการติดตามผลและวิเคราะห์ก่อนทายผลใน ScoreMatrix",
    factsTitle: "ข้อมูลสำคัญ",
    facts: [
      "แข่งขันวันที่ 11 มิถุนายน - 19 กรกฎาคม 2026",
      "มี 48 ทีม แบ่งเป็น 12 กลุ่ม กลุ่มละ 4 ทีม",
      "แข่งขันทั้งหมด 104 นัด ใน 16 เมืองเจ้าภาพ",
      "เจ้าภาพร่วมคือ แคนาดา เม็กซิโก และสหรัฐอเมริกา",
      "สองอันดับแรกของแต่ละกลุ่ม และอันดับสามที่ดีที่สุด 8 ทีม เข้าสู่รอบ 32 ทีม",
    ],
    faqTitle: "คำถามที่พบบ่อย",
    faqs: [
      {
        question: "ฟุตบอลโลก 2026 เริ่มเมื่อไหร่?",
        answer:
          "FIFA World Cup 2026 แข่งขันระหว่างวันที่ 11 มิถุนายน ถึง 19 กรกฎาคม 2026 โดยหน้านี้แสดงตารางกลุ่มและโปรแกรมในเวลาไทย",
      },
      {
        question: "ฟุตบอลโลก 2026 มีกี่ทีมและกี่กลุ่ม?",
        answer:
          "ฟุตบอลโลก 2026 ใช้รูปแบบ 48 ทีม แบ่งเป็น 12 กลุ่ม กลุ่มละ 4 ทีม ก่อนคัดทีมเข้าสู่รอบ 32 ทีม",
      },
      {
        question: "ScoreMatrix ใช้หน้านี้ทำอะไรได้บ้าง?",
        answer:
          "ใช้ดูตารางกลุ่ม ตารางคะแนน โปรแกรมในกลุ่ม และเปิดข้อมูลทีม เพื่อช่วยติดตามผล วิเคราะห์เกม และเตรียมทายผลฟุตบอลโลก",
      },
    ],
  },
  en: {
    metaTitle: "World Cup 2026 Groups, Fixtures, Standings",
    metaDescription:
      "Track FIFA World Cup 2026 groups, fixtures, standings and team links for all 12 groups and 48 teams on ScoreMatrix.",
    ogTitle: "World Cup 2026 Groups, Fixtures and Standings | ScoreMatrix",
    ogDescription:
      "Follow FIFA World Cup 2026 with quick group tables, fixture cards, standings and team links in Thailand time.",
    keywords: [
      "World Cup 2026 groups",
      "World Cup 2026 standings",
      "World Cup 2026 fixtures",
      "FIFA World Cup 26 schedule",
      "World Cup predictions",
      ...sharedKeywords,
    ],
    contentTitle: "World Cup 2026 data hub",
    contentIntro:
      "Use this page to scan FIFA World Cup 2026 groups, group-stage fixtures and standings before checking teams and making football predictions on ScoreMatrix.",
    factsTitle: "Key tournament facts",
    facts: [
      "Tournament dates: 11 June - 19 July 2026",
      "48 teams are split into 12 groups of four",
      "The tournament has 104 matches across 16 host cities",
      "Canada, Mexico and the United States are co-hosts",
      "The top two teams in each group and the eight best third-place teams reach the round of 32",
    ],
    faqTitle: "World Cup 2026 FAQ",
    faqs: [
      {
        question: "When does World Cup 2026 start?",
        answer:
          "FIFA World Cup 2026 runs from 11 June to 19 July 2026. ScoreMatrix shows group data and fixtures in Thailand time.",
      },
      {
        question: "How many teams and groups are in World Cup 2026?",
        answer:
          "The 2026 tournament uses an expanded 48-team format with 12 groups of four teams before the round of 32.",
      },
      {
        question: `How does ${SITE_NAME} use this World Cup page?`,
        answer:
          "The page helps users scan groups, standings, team pages and fixtures before following results or making football predictions.",
      },
    ],
  },
  lo: {
    metaTitle: "ບານໂລກ 2026 ຕາຕະລາງກຸ່ມ ແລະ ຜົນຄະແນນ",
    metaDescription:
      "ຕິດຕາມ FIFA World Cup 2026 ຄົບ 12 ກຸ່ມ 48 ທີມ ພ້ອມໂປຣແກຣມ ຕາຕະລາງຄະແນນ ແລະລິ້ງຂໍ້ມູນທີມໃນ ScoreMatrix",
    ogTitle: "ບານໂລກ 2026 ກຸ່ມ ໂປຣແກຣມ ແລະຄະແນນ | ScoreMatrix",
    ogDescription:
      "ເບິ່ງກຸ່ມ FIFA World Cup 2026, ໂປຣແກຣມແຂ່ງ, ຕາຕະລາງຄະແນນ ແລະຂໍ້ມູນທີມໃນເວລາໄທ",
    keywords: ["ບານໂລກ 2026", "ຕາຕະລາງບານໂລກ", "ກຸ່ມບານໂລກ", ...sharedKeywords],
    contentTitle: "ສູນຂໍ້ມູນບານໂລກ 2026",
    contentIntro:
      "ໜ້ານີ້ລວມກຸ່ມ ໂປຣແກຣມຮອບແບ່ງກຸ່ມ ແລະຕາຕະລາງຄະແນນຂອງ FIFA World Cup 2026 ສໍາລັບຕິດຕາມແລະວິເຄາະກ່ອນທາຍຜົນ",
    factsTitle: "ຂໍ້ມູນສໍາຄັນ",
    facts: [
      "ແຂ່ງຂັນ 11 ມິຖຸນາ - 19 ກໍລະກົດ 2026",
      "48 ທີມ ແບ່ງເປັນ 12 ກຸ່ມ",
      "104 ນັດ ໃນ 16 ເມືອງເຈົ້າພາບ",
      "ເຈົ້າພາບຮ່ວມ: ແຄນາດາ, ເມັກຊິໂກ ແລະ ສະຫະລັດ",
      "2 ອັນດັບແລກຂອງແຕ່ລະກຸ່ມ ແລະອັນດັບ 3 ທີ່ດີທີ່ສຸດ 8 ທີມ ເຂົ້າຮອບ 32 ທີມ",
    ],
    faqTitle: "ຄໍາຖາມທີ່ພົບເລື້ອຍ",
    faqs: [
      {
        question: "ບານໂລກ 2026 ເລີ່ມເມື່ອໃດ?",
        answer: "FIFA World Cup 2026 ແຂ່ງຂັນລະຫວ່າງ 11 ມິຖຸນາ ຫາ 19 ກໍລະກົດ 2026.",
      },
      {
        question: "ມີຈັກທີມແລະຈັກກຸ່ມ?",
        answer: "ມີ 48 ທີມ ແບ່ງເປັນ 12 ກຸ່ມ ກຸ່ມລະ 4 ທີມ.",
      },
      {
        question: "ScoreMatrix ຊ່ວຍຫຍັງໃນໜ້ານີ້?",
        answer: "ຊ່ວຍເບິ່ງກຸ່ມ ຄະແນນ ໂປຣແກຣມ ແລະຂໍ້ມູນທີມກ່ອນຕິດຕາມຜົນຫຼືທາຍຜົນ.",
      },
    ],
  },
  my: {
    metaTitle: "World Cup 2026 အုပ်စုများ၊ ပွဲစဉ်များ၊ ရပ်တည်မှု",
    metaDescription:
      "FIFA World Cup 2026 အုပ်စု 12 ခု၊ 48 သင်း၊ ပွဲစဉ်များ၊ ရပ်တည်မှုဇယားများနှင့်အသင်းလင့်များကို ScoreMatrix တွင်ကြည့်ပါ",
    ogTitle: "World Cup 2026 အုပ်စုများနှင့်ပွဲစဉ်များ | ScoreMatrix",
    ogDescription:
      "FIFA World Cup 2026 အုပ်စုဇယား၊ ပွဲစဉ်ကတ်များ၊ ရပ်တည်မှုနှင့်အသင်းအချက်အလက်များကို မြန်မြန်ဆန်ဆန်ကြည့်ပါ",
    keywords: ["World Cup 2026", "ကမ္ဘာ့ဖလား 2026", "World Cup groups", ...sharedKeywords],
    contentTitle: "World Cup 2026 ဒေတာစင်တာ",
    contentIntro:
      "ဤစာမျက်နှာတွင် FIFA World Cup 2026 အုပ်စုများ၊ အုပ်စုပွဲစဉ်များနှင့်ရပ်တည်မှုဇယားများကို ScoreMatrix ပေါ်တွင် ကြည့်ရှုနိုင်သည်။",
    factsTitle: "အရေးကြီးအချက်များ",
    facts: [
      "ပြိုင်ပွဲကာလ: 11 June - 19 July 2026",
      "48 သင်းကို အုပ်စု 12 ခု ခွဲထားသည်",
      "ပွဲစဉ် 104 ပွဲကို မြို့ 16 မြို့တွင်ကျင်းပသည်",
      "Canada, Mexico နှင့် United States တို့ ပူးတွဲအိမ်ရှင်ဖြစ်သည်",
      "အုပ်စုတိုင်းမှ ထိပ်ဆုံး 2 သင်းနှင့် အကောင်းဆုံး တတိယနေရာ 8 သင်းသည် Round of 32 သို့တက်သည်",
    ],
    faqTitle: "မေးလေ့ရှိသောမေးခွန်းများ",
    faqs: [
      {
        question: "World Cup 2026 ဘယ်နေ့စမလဲ?",
        answer: "FIFA World Cup 2026 သည် 11 June မှ 19 July 2026 အထိ ကျင်းပသည်။",
      },
      {
        question: "အသင်းနှင့်အုပ်စုဘယ်လောက်ရှိလဲ?",
        answer: "World Cup 2026 တွင် 48 သင်းနှင့် 12 အုပ်စု ရှိပြီး အုပ်စုတိုင်းတွင် 4 သင်းပါသည်။",
      },
      {
        question: "ScoreMatrix တွင်ဒီစာမျက်နှာကိုဘာအတွက်သုံးနိုင်လဲ?",
        answer: "အုပ်စု၊ ရပ်တည်မှု၊ ပွဲစဉ်နှင့်အသင်းအချက်အလက်များကိုကြည့်ပြီး ရလဒ်များနှင့်ခန့်မှန်းမှုများအတွက်အသုံးပြုနိုင်သည်။",
      },
    ],
  },
  km: {
    metaTitle: "World Cup 2026 ពូល កម្មវិធីប្រកួត និងតារាងពិន្ទុ",
    metaDescription:
      "តាមដាន FIFA World Cup 2026 ពូលទាំង 12 ក្រុម 48 កម្មវិធីប្រកួត តារាងពិន្ទុ និងតំណភ្ជាប់ក្រុមនៅលើ ScoreMatrix",
    ogTitle: "World Cup 2026 ពូល កម្មវិធីប្រកួត និងពិន្ទុ | ScoreMatrix",
    ogDescription:
      "មើលពូល FIFA World Cup 2026 កម្មវិធីប្រកួត តារាងពិន្ទុ និងព័ត៌មានក្រុមក្នុងទម្រង់អានរហ័ស",
    keywords: ["World Cup 2026", "ពូល World Cup", "កម្មវិធី World Cup", ...sharedKeywords],
    contentTitle: "មជ្ឈមណ្ឌលទិន្នន័យ World Cup 2026",
    contentIntro:
      "ទំព័រនេះប្រមូលពូល កម្មវិធីប្រកួតជុំទីមួយ និងតារាងពិន្ទុ FIFA World Cup 2026 សម្រាប់ការតាមដាន និងវិភាគលើ ScoreMatrix។",
    factsTitle: "ព័ត៌មានសំខាន់",
    facts: [
      "ប្រកួតពីថ្ងៃទី 11 មិថុនា ដល់ 19 កក្កដា 2026",
      "ក្រុម 48 ត្រូវបានបែងចែកជា 12 ពូល",
      "មាន 104 ប្រកួត ក្នុងទីក្រុងម្ចាស់ផ្ទះ 16",
      "ម្ចាស់ផ្ទះរួមគឺ Canada, Mexico និង United States",
      "ក្រុម 2 លំដាប់ដំបូងនៃពូលនីមួយៗ និងក្រុមលំដាប់ទី 3 ល្អបំផុត 8 នឹងឡើងទៅវគ្គ 32 ក្រុម",
    ],
    faqTitle: "សំណួរដែលសួរញឹកញាប់",
    faqs: [
      {
        question: "World Cup 2026 ចាប់ផ្តើមពេលណា?",
        answer: "FIFA World Cup 2026 ប្រកួតពីថ្ងៃទី 11 មិថុនា ដល់ថ្ងៃទី 19 កក្កដា 2026។",
      },
      {
        question: "World Cup 2026 មានក្រុម និងពូលប៉ុន្មាន?",
        answer: "មាន 48 ក្រុម បែងចែកជា 12 ពូល ពូលនីមួយៗមាន 4 ក្រុម។",
      },
      {
        question: "ទំព័រនេះជួយអ្វីលើ ScoreMatrix?",
        answer: "វាជួយមើលពូល តារាងពិន្ទុ កម្មវិធីប្រកួត និងព័ត៌មានក្រុមសម្រាប់តាមដានលទ្ធផល ឬទស្សន៍ទាយបាល់ទាត់។",
      },
    ],
  },
  zh: {
    metaTitle: "2026 世界杯小组、赛程、积分榜",
    metaDescription:
      "在 ScoreMatrix 查看 FIFA 2026 世界杯 12 个小组、48 支球队、赛程、积分榜和球队链接。",
    ogTitle: "2026 世界杯小组、赛程和积分榜 | ScoreMatrix",
    ogDescription:
      "快速跟踪 FIFA 2026 世界杯小组、比赛卡片、积分榜和球队资料，时间按泰国时区显示。",
    keywords: ["2026 世界杯", "世界杯小组", "世界杯赛程", "世界杯积分榜", ...sharedKeywords],
    contentTitle: "2026 世界杯数据中心",
    contentIntro:
      "此页面汇总 FIFA 2026 世界杯小组、分组赛程和积分榜，方便在 ScoreMatrix 上跟踪比赛并进行足球预测分析。",
    factsTitle: "赛事重点",
    facts: [
      "比赛日期：2026 年 6 月 11 日至 7 月 19 日",
      "48 支球队分为 12 个小组",
      "共 104 场比赛，在 16 个主办城市举行",
      "加拿大、墨西哥和美国共同主办",
      "每组前两名以及 8 支成绩最好的第三名球队晋级 32 强",
    ],
    faqTitle: "常见问题",
    faqs: [
      {
        question: "2026 世界杯什么时候开始？",
        answer: "FIFA 2026 世界杯从 2026 年 6 月 11 日开始，7 月 19 日结束。",
      },
      {
        question: "2026 世界杯有多少球队和小组？",
        answer: "2026 世界杯采用 48 队赛制，共 12 个小组，每组 4 队。",
      },
      {
        question: "ScoreMatrix 的这个页面有什么用途？",
        answer: "用户可以查看小组、积分榜、赛程和球队资料，用于跟踪结果和进行足球预测分析。",
      },
    ],
  },
};

export function getWorldCup2026SeoContent(locale: string): WorldCupSeoContent {
  return content[locale] ?? content.en;
}
