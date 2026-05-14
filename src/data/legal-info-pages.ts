import type { LegalDocumentContent } from "@/components/legal/LegalDocument";

type Locale = "th" | "en" | "lo" | "my" | "km" | "zh";

type FaqItem = {
  q: string;
  a: string;
};

type ContactContent = {
  title: string;
  intro: string;
  sentTitle: string;
  sentText: string;
  name: string;
  namePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  topic: string;
  topicPlaceholder: string;
  message: string;
  messagePlaceholder: string;
  send: string;
  channelsTitle: string;
  channels: { label: string; value: string; note: string }[];
  responseTitle: string;
  responseItems: string[];
};

const faqContent: Record<Locale, { title: string; intro: string; items: FaqItem[] }> = {
  th: {
    title: "คำถามที่พบบ่อย",
    intro: "คำตอบสั้น ๆ เกี่ยวกับการทายผล แต้ม รางวัล กฎหมาย ความเป็นส่วนตัว และการใช้งาน ScoreMatrix ในประเทศไทย",
    items: [
      { q: "ScoreMatrix เป็นเว็บพนันหรือไม่?", a: "ไม่ใช่ ScoreMatrix เป็นเกมทายผลฟุตบอลเพื่อความบันเทิงที่ใช้ทักษะและความรู้กีฬา ไม่มีการรับเดิมพันด้วยเงินจริง แต้มและเครดิตไม่มีมูลค่าเป็นเงินสดและถอนไม่ได้" },
      { q: "ฉันจะได้รับแต้มอย่างไร?", a: "คุณได้รับแต้มจากการทายผลถูกต้อง ภารกิจรายวัน/รายสัปดาห์ achievement streak bonus และกิจกรรมที่ประกาศชัดเจน ไม่ใช่การสุ่มจับรางวัล" },
      { q: "แต้มแลกเป็นเงินสดได้ไหม?", a: "ไม่ได้ แต้มและเครดิตใช้ในแพลตฟอร์มเท่านั้น ไม่สามารถถอน โอน ขาย หรือแลกเป็นเงินจริงได้" },
      { q: "รางวัลถูกต้องตามกฎหมายไทยอย่างไร?", a: "รางวัลของเราผูกกับกติกาทักษะ คะแนน หรือภารกิจที่ประกาศ ไม่ใช่การชิงโชคแบบสุ่ม หากมีแคมเปญที่เข้าข่ายจับสลากหรือเสี่ยงโชค ต้องดำเนินการตามกฎหมายและใบอนุญาตที่เกี่ยวข้องก่อน" },
      { q: "ข้อมูลส่วนบุคคลของฉันถูกใช้เพื่ออะไร?", a: "ใช้เพื่อบัญชี การทายผล คะแนน leaderboard ภารกิจ รางวัล affiliate ความปลอดภัย การป้องกันทุจริต และการสื่อสารที่คุณเลือก เราไม่ขายข้อมูลส่วนบุคคล" },
      { q: "ฉันขอลบหรือแก้ไขข้อมูลได้ไหม?", a: "ได้ คุณสามารถติดต่อ helloscorematrix@gmail.com เพื่อขอเข้าถึง แก้ไข ลบ จำกัดการใช้ คัดค้าน หรือถอนความยินยอมตามสิทธิภายใต้ PDPA" },
      { q: "การทายผลล็อกเมื่อไร?", a: "คำทายจะล็อกเมื่อถึงเวลาเริ่มแข่งขันตามเวลาที่ระบบแสดง หลังจากล็อกแล้วจะไม่สามารถแก้ไขได้" },
      { q: "ถ้าข้อมูลการแข่งขันผิด คะแนนจะทำอย่างไร?", a: "เราจะอ้างอิงข้อมูลการแข่งขันที่ระบบได้รับ หากพบข้อผิดพลาดทางเทคนิคหรือข้อมูลจากแหล่งภายนอกคลาดเคลื่อน เราอาจแก้ไขคะแนนย้อนหลังเพื่อความถูกต้องและเป็นธรรม" },
      { q: "ระบบ Affiliate ทำงานอย่างไร?", a: "คุณแชร์ลิงก์ชวนเพื่อน เมื่อเพื่อนสมัครผ่านรหัสของคุณและผ่านเงื่อนไข บัญชีของคุณจะได้รับแต้ม/เครดิตตามกติกาที่ประกาศ" },
      { q: "ติดต่อทีมงานเรื่องใดได้บ้าง?", a: "ติดต่อได้เรื่องบัญชี แต้ม รางวัล ข้อมูลส่วนบุคคล รายงานเนื้อหาผิดกฎหมาย ปัญหาความปลอดภัย และข้อเสนอแนะสินค้า" },
    ],
  },
  en: {
    title: "Frequently Asked Questions",
    intro: "Short answers about predictions, points, rewards, legal safeguards, privacy, and using ScoreMatrix in Thailand.",
    items: [
      { q: "Is ScoreMatrix gambling?", a: "No. ScoreMatrix is a skill-based football prediction game for entertainment. No real-money wagering is accepted. Points and credits have no cash value and cannot be withdrawn." },
      { q: "How do I earn points?", a: "You earn points through correct predictions, missions, achievements, streak bonuses, and clearly announced skill-based activities, not random draws." },
      { q: "Can points be exchanged for cash?", a: "No. Points and credits are for in-platform use only and cannot be withdrawn, transferred, sold, or exchanged for real money." },
      { q: "How are rewards structured under Thai law?", a: "Rewards are tied to skill, points, or announced missions, not random lucky draws. Any chance-based campaign would require legal review and applicable permissions before launch." },
      { q: "What do you use my personal data for?", a: "We use data for accounts, predictions, scoring, leaderboards, missions, rewards, affiliate tracking, security, fraud prevention, and communications you choose. We do not sell personal data." },
      { q: "Can I delete or correct my data?", a: "Yes. Contact helloscorematrix@gmail.com to request access, correction, deletion, restriction, objection, or consent withdrawal under the Thai PDPA where applicable." },
      { q: "When do predictions lock?", a: "Predictions lock at the scheduled kickoff time shown in the system. After lock, they cannot be changed." },
      { q: "What happens if match data is wrong?", a: "Scoring relies on received match data. If a technical or third-party data error is found, we may correct points retroactively for accuracy and fairness." },
      { q: "How does Affiliate work?", a: "Share your invite link. When a friend signs up with your referral code and qualifies, your account earns points or credits according to the announced rules." },
      { q: "What can I contact support about?", a: "Accounts, points, rewards, privacy requests, illegal content reports, security issues, and product feedback." },
    ],
  },
  lo: {
    title: "ຄຳຖາມທີ່ພົບເລື້ອຍ",
    intro: "ຄຳຕອບສັ້ນໆກ່ຽວກັບການທາຍຜົນ ຄະແນນ ລາງວັນ ກົດໝາຍ ຄວາມເປັນສ່ວນຕົວ ແລະການໃຊ້ ScoreMatrix ໃນໄທ",
    items: [
      { q: "ScoreMatrix ແມ່ນເວັບພະນັນບໍ?", a: "ບໍ່ແມ່ນ. ScoreMatrix ແມ່ນເກມທາຍຜົນບານເຕະເພື່ອຄວາມບັນເທີງທີ່ໃຊ້ທັກສະ ບໍ່ຮັບເດີມພັນເງິນຈິງ ແລະຄະແນນຖອນເປັນເງິນບໍ່ໄດ້." },
      { q: "ຈະໄດ້ຄະແນນແນວໃດ?", a: "ໄດ້ຈາກການທາຍຖືກ, ພາລະກິດ, achievement, streak bonus ແລະກິດຈະກຳທີ່ປະກາດຊັດເຈນ." },
      { q: "ແລກຄະແນນເປັນເງິນສົດໄດ້ບໍ?", a: "ບໍ່ໄດ້. ຄະແນນແລະເຄຣດິດໃຊ້ໃນແພລດຟອມເທົ່ານັ້ນ ຖອນ ໂອນ ຂາຍ ຫຼືແລກເງິນຈິງບໍ່ໄດ້." },
      { q: "ລາງວັນສອດຄ່ອງກົດໝາຍໄທແນວໃດ?", a: "ລາງວັນອີງໃສ່ທັກສະ ຄະແນນ ຫຼືພາລະກິດ ບໍ່ແມ່ນການຈັບສະຫຼາກສຸ່ມ." },
      { q: "ຂໍ້ມູນສ່ວນຕົວຖືກໃຊ້ເພື່ອຫຍັງ?", a: "ໃຊ້ເພື່ອບັນຊີ, ຄະແນນ, ລາງວັນ, affiliate, ຄວາມປອດໄພ ແລະການສື່ສານທີ່ທ່ານເລືອກ. ພວກເຮົາບໍ່ຂາຍຂໍ້ມູນ." },
      { q: "ຂໍລຶບ ຫຼືແກ້ໄຂຂໍ້ມູນໄດ້ບໍ?", a: "ໄດ້. ຕິດຕໍ່ helloscorematrix@gmail.com ເພື່ອໃຊ້ສິດຕາມ PDPA ເມື່ອກ່ຽວຂ້ອງ." },
      { q: "ຄຳທາຍລັອກເມື່ອໃດ?", a: "ລັອກເມື່ອຮອດເວລາເລີ່ມແຂ່ງທີ່ລະບົບສະແດງ ຫຼັງຈາກນັ້ນແກ້ໄຂບໍ່ໄດ້." },
      { q: "ຖ້າຂໍ້ມູນແຂ່ງຜິດຈະເຮັດແນວໃດ?", a: "ຖ້າພົບຂໍ້ຜິດພາດທາງເຕັກນິກ ຫຼືຂໍ້ມູນພາຍນອກຄາດເຄື່ອນ ອາດປັບຄະແນນຍ້ອນຫຼັງເພື່ອຄວາມຖືກຕ້ອງ." },
      { q: "Affiliate ເຮັດວຽກແນວໃດ?", a: "ແຊຣ໌ລິ້ງຊວນໝູ່. ເມື່ອໝູ່ສະໝັກຜ່ານລະຫັດ ແລະຜ່ານເງື່ອນໄຂ ບັນຊີຂອງທ່ານຈະໄດ້ລາງວັນ." },
      { q: "ຕິດຕໍ່ທີມງານເລື່ອງໃດໄດ້ບ້າງ?", a: "ບັນຊີ, ຄະແນນ, ລາງວັນ, ຄຳຂໍ privacy, ເນື້ອຫາຜິດກົດໝາຍ, ຄວາມປອດໄພ ແລະ feedback." },
    ],
  },
  my: null as unknown as { title: string; intro: string; items: FaqItem[] },
  km: null as unknown as { title: string; intro: string; items: FaqItem[] },
  zh: null as unknown as { title: string; intro: string; items: FaqItem[] },
};

faqContent.my = localizeFaq("မေးလေ့ရှိသောမေးခွန်းများ");
faqContent.km = localizeFaq("សំណួរញឹកញាប់");
faqContent.zh = localizeFaq("常见问题");

function localizeFaq(title: string) {
  return {
    ...faqContent.en,
    title,
    intro: faqContent.en.intro,
  };
}

const contactContent: Record<Locale, ContactContent> = {
  th: {
    title: "ติดต่อเรา",
    intro: "เลือกช่องทางที่เหมาะกับเรื่องของคุณ ทีมงานจะจัดลำดับคำขอตามความสำคัญ เช่น ความปลอดภัย ข้อมูลส่วนบุคคล รางวัล และปัญหาบัญชี",
    sentTitle: "ส่งข้อความแล้ว",
    sentText: "ขอบคุณที่ติดต่อเรา ทีมงานจะตอบกลับตามกรอบเวลาที่เหมาะสม",
    name: "ชื่อ",
    namePlaceholder: "ชื่อของคุณ",
    email: "อีเมล",
    emailPlaceholder: "you@example.com",
    topic: "หัวข้อ",
    topicPlaceholder: "บัญชี / รางวัล / ข้อมูลส่วนบุคคล / ความปลอดภัย",
    message: "ข้อความ",
    messagePlaceholder: "อธิบายรายละเอียดที่ต้องการให้เราช่วย...",
    send: "ส่งข้อความ",
    channelsTitle: "ช่องทางติดต่อเฉพาะเรื่อง",
    channels: [
      { label: "ช่วยเหลือทั่วไป", value: "helloscorematrix@gmail.com", note: "บัญชี แต้ม การใช้งาน และข้อเสนอแนะ" },
      { label: "ข้อมูลส่วนบุคคล", value: "helloscorematrix@gmail.com", note: "คำขอใช้สิทธิ PDPA หรือลบ/แก้ไขข้อมูล" },
      { label: "กฎหมายและรายงานผิดกฎ", value: "helloscorematrix@gmail.com", note: "รายงานการพนัน เนื้อหาผิดกฎหมาย หรือข้อร้องเรียนทางกฎหมาย" },
      { label: "ความปลอดภัย", value: "helloscorematrix@gmail.com", note: "แจ้งช่องโหว่ บัญชีถูกยึด หรือพฤติกรรมเสี่ยง" },
    ],
    responseTitle: "เวลาตอบกลับโดยประมาณ",
    responseItems: ["ความปลอดภัยหรือกฎหมาย: ภายใน 24 ชั่วโมง", "ข้อมูลส่วนบุคคล: ตามกรอบ PDPA และโดยเร็วที่สุด", "คำถามทั่วไป: 1-3 วันทำการ", "กรุณาอย่าส่งรหัสผ่านหรือข้อมูลบัตร/เอกสารสำคัญผ่านแบบฟอร์ม"],
  },
  en: {
    title: "Contact Us",
    intro: "Choose the best channel for your request. We prioritize safety, privacy, rewards, and account issues.",
    sentTitle: "Message sent",
    sentText: "Thanks for contacting us. The team will respond within the appropriate support window.",
    name: "Name",
    namePlaceholder: "Your name",
    email: "Email",
    emailPlaceholder: "you@example.com",
    topic: "Topic",
    topicPlaceholder: "Account / rewards / privacy / security",
    message: "Message",
    messagePlaceholder: "Describe what you need help with...",
    send: "Send message",
    channelsTitle: "Dedicated channels",
    channels: [
      { label: "General support", value: "helloscorematrix@gmail.com", note: "Accounts, points, product use, and feedback" },
      { label: "Privacy", value: "helloscorematrix@gmail.com", note: "PDPA requests, deletion, or correction" },
      { label: "Legal and abuse", value: "helloscorematrix@gmail.com", note: "Gambling reports, unlawful content, or legal complaints" },
      { label: "Security", value: "helloscorematrix@gmail.com", note: "Vulnerabilities, account takeover, or risky behavior" },
    ],
    responseTitle: "Expected response times",
    responseItems: ["Security or legal reports: within 24 hours", "Privacy requests: within the PDPA framework and as soon as practical", "General questions: 1-3 business days", "Do not send passwords, card data, or sensitive documents through the form"],
  },
  lo: null as unknown as ContactContent,
  my: null as unknown as ContactContent,
  km: null as unknown as ContactContent,
  zh: null as unknown as ContactContent,
};

contactContent.lo = localizeContact("ຕິດຕໍ່ພວກເຮົາ");
contactContent.my = localizeContact("ဆက်သွယ်ရန်");
contactContent.km = localizeContact("ទំនាក់ទំនងយើង");
contactContent.zh = localizeContact("联系我们");

function localizeContact(title: string) {
  return { ...contactContent.en, title };
}

const aboutContent: Record<Locale, LegalDocumentContent> = {
  th: {
    title: "เกี่ยวกับ ScoreMatrix",
    updated: "แพลตฟอร์มทายผลฟุตบอลที่ใช้ทักษะ เพื่อแฟนบอลในเอเชียตะวันออกเฉียงใต้",
    intro: "ScoreMatrix ถูกออกแบบให้แฟนบอลได้ใช้ความรู้ การวิเคราะห์ และความสม่ำเสมอในการแข่งขันทายผล โดยแยกชัดเจนจากการพนันและการเสี่ยงโชค",
    notice: { tone: "cyan", title: "แนวคิดของเรา", body: "Predict. Compete. Earn non-cash rewards. เล่นด้วยความรู้ แข่งขันอย่างโปร่งใส และรับรางวัลที่ไม่ใช่เงินสด" },
    sections: [
      { title: "พันธกิจ", paragraphs: ["เราต้องการสร้างสนามแข่งขันที่ปลอดภัย สนุก และโปร่งใสสำหรับแฟนฟุตบอล ผู้ใช้ควรได้รับการยอมรับจากความแม่นยำ ความสม่ำเสมอ และความเข้าใจเกม ไม่ใช่จากการวางเดิมพัน"] },
      { title: "วิธีทำงาน", bullets: ["วิเคราะห์การแข่งขันและส่งคำทายก่อนเริ่มแข่ง", "รับแต้มจากกติกาคะแนนที่ประกาศชัดเจน", "แข่งขันบน leaderboard, private leagues และ missions", "แลกรางวัลดิจิทัลหรือสินค้าโดยไม่มีการถอนเงินสด"] },
      { title: "หลักการออกแบบ", bullets: ["Fair play: ต่อต้านบอต หลายบัญชี และการโกงคะแนน", "No gambling: แต้มและเครดิตไม่มีมูลค่าเงินสด", "Transparency: กติกาคะแนนและรางวัลต้องชัดเจน", "Privacy: เก็บข้อมูลเท่าที่จำเป็นและเคารพสิทธิ PDPA", "Localization: รองรับภาษาและบริบทของผู้ใช้ในภูมิภาค"] },
      { title: "ทีมและชุมชน", paragraphs: ["ScoreMatrix สร้างโดยทีมที่สนใจฟุตบอล ข้อมูล และประสบการณ์ผู้ใช้ เราตั้งใจให้แอปเป็นพื้นที่ของชุมชนแฟนบอลที่แข่งขันกันด้วยความรู้และมารยาท"] },
    ],
  },
  en: {
    title: "About ScoreMatrix",
    updated: "A skill-based football prediction platform for Southeast Asian fans",
    intro: "ScoreMatrix is designed for football fans to compete through knowledge, analysis, and consistency, clearly separated from gambling and games of chance.",
    notice: { tone: "cyan", title: "Our idea", body: "Predict. Compete. Earn non-cash rewards. Play with knowledge, compete transparently, and redeem rewards that are not cash." },
    sections: [
      { title: "Mission", paragraphs: ["We aim to create a safe, fun, and transparent competition space for football fans. Users should be recognized for accuracy, consistency, and understanding of the game, not for wagering."] },
      { title: "How it works", bullets: ["Analyze matches and submit predictions before kickoff.", "Earn points from clearly published scoring rules.", "Compete on leaderboards, private leagues, and missions.", "Redeem digital goods or merchandise with no cash withdrawal."] },
      { title: "Design principles", bullets: ["Fair play: prevent bots, multi-account abuse, and point fraud.", "No gambling: points and credits have no cash value.", "Transparency: scoring and reward rules must be clear.", "Privacy: collect only what is needed and respect PDPA rights.", "Localization: support local languages and regional context."] },
      { title: "Team and community", paragraphs: ["ScoreMatrix is built by people who care about football, data, and user experience. We want the app to be a community space where fans compete with knowledge and respect."] },
    ],
  },
  lo: null as unknown as LegalDocumentContent,
  my: null as unknown as LegalDocumentContent,
  km: null as unknown as LegalDocumentContent,
  zh: null as unknown as LegalDocumentContent,
};

aboutContent.lo = localizeAbout("ກ່ຽວກັບ ScoreMatrix");
aboutContent.my = localizeAbout("ScoreMatrix အကြောင်း");
aboutContent.km = localizeAbout("អំពី ScoreMatrix");
aboutContent.zh = localizeAbout("关于 ScoreMatrix");

function localizeAbout(title: string) {
  return { ...aboutContent.en, title };
}

export function getFaqContent(locale: string) {
  return faqContent[safeLocale(locale)];
}

export function getContactContent(locale: string) {
  return contactContent[safeLocale(locale)];
}

export function getAboutContent(locale: string) {
  return aboutContent[safeLocale(locale)];
}

function safeLocale(locale: string): Locale {
  return ["th", "en", "lo", "my", "km", "zh"].includes(locale)
    ? (locale as Locale)
    : "en";
}
