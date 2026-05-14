import type { LegalDocumentContent } from "@/components/legal/LegalDocument";

type LegalPage = "terms" | "privacy" | "rewardRules" | "legalNotice";
type LegalLocale = "th" | "en" | "lo" | "my" | "km" | "zh";

type LegalCopy = Record<LegalPage, LegalDocumentContent>;

const updated = {
  th: "อัปเดตล่าสุด: 14 พฤษภาคม 2026",
  en: "Last updated: 14 May 2026",
  lo: "ອັບເດດຫຼ້າສຸດ: 14 ພຶດສະພາ 2026",
  my: "နောက်ဆုံးပြင်ဆင်သည့်နေ့: 14 May 2026",
  km: "ធ្វើបច្ចុប្បន្នភាពចុងក្រោយ: 14 ឧសភា 2026",
  zh: "最后更新：2026年5月14日",
};

const commonNotice = {
  th: "ScoreMatrix เป็นแพลตฟอร์มทายผลฟุตบอลเพื่อความบันเทิงที่ใช้ทักษะและความรู้ด้านกีฬา ไม่ใช่บริการการพนัน การเดิมพัน หรือสลากกินแบ่ง แต้มและเครดิตไม่มีมูลค่าเป็นเงินสด ถอน โอน หรือแลกเป็นเงินจริงไม่ได้",
  en: "ScoreMatrix is an entertainment football prediction platform based on skill and sports knowledge. It is not gambling, betting, wagering, lottery, or a cash-prize service. Points and credits have no cash value and cannot be withdrawn, transferred, or exchanged for real money.",
  lo: "ScoreMatrix ເປັນແພລດຟອມທາຍຜົນບານເຕະເພື່ອຄວາມບັນເທີງທີ່ອີງໃສ່ທັກສະ ແລະ ຄວາມຮູ້ກິລາ ບໍ່ແມ່ນການພະນັນ ການເດີມພັນ ຫຼື ສະຫຼາກ. ຄະແນນ ແລະ ເຄຣດິດບໍ່ມີມູນຄ່າເປັນເງິນສົດ ແລະ ຖອນ ໂອນ ຫຼື ແລກເປັນເງິນຈິງບໍ່ໄດ້.",
  my: "ScoreMatrix သည် အားကစားဗဟုသုတနှင့် ကျွမ်းကျင်မှုအခြေပြု ဖျော်ဖြေရေး ဘောလုံးခန့်မှန်းပလက်ဖောင်းဖြစ်သည်။ လောင်းကစား၊ ငွေကြေးလောင်းခြင်း၊ ထီ သို့မဟုတ် ငွေသားဆုဝန်ဆောင်မှု မဟုတ်ပါ။ Points နှင့် credits များသည် ငွေသားတန်ဖိုးမရှိပြီး ထုတ်ယူ၊ လွှဲပြောင်း သို့မဟုတ် ငွေအစစ်ဖြင့် လဲလှယ်၍ မရပါ။",
  km: "ScoreMatrix ជាវេទិកាទស្សន៍ទាយបាល់ទាត់សម្រាប់កម្សាន្ត ដែលផ្អែកលើជំនាញ និងចំណេះដឹងកីឡា។ វាមិនមែនជាល្បែងស៊ីសង ការភ្នាល់ ឆ្នោត ឬសេវារង្វាន់ជាសាច់ប្រាក់ទេ។ ពិន្ទុ និងក្រេឌីតគ្មានតម្លៃជាសាច់ប្រាក់ ហើយមិនអាចដក ផ្ទេរ ឬប្ដូរជាប្រាក់ពិតបានទេ។",
  zh: "ScoreMatrix 是基于技巧和体育知识的足球预测娱乐平台，不是赌博、投注、博彩、彩票或现金奖励服务。积分和点数没有现金价值，不能提现、转让或兑换为真钱。",
};

export const legalDocuments: Record<LegalLocale, LegalCopy> = {
  th: {
    terms: {
      title: "ข้อตกลงการใช้งาน",
      updated: updated.th,
      intro: "ข้อตกลงนี้กำหนดเงื่อนไขการใช้ ScoreMatrix สำหรับผู้ใช้ในประเทศไทยและผู้ใช้ที่เข้าถึงบริการจากประเทศไทย โดยคำนึงถึงกฎหมายไทยที่เกี่ยวข้อง รวมถึงกฎหมายคุ้มครองข้อมูลส่วนบุคคล กฎหมายการพนัน กฎหมายธุรกรรมทางอิเล็กทรอนิกส์ และกฎหมายคุ้มครองผู้บริโภค",
      notice: { tone: "amber", title: "ข้อจำกัดสำคัญ", body: commonNotice.th },
      sections: [
        {
          title: "การยอมรับข้อตกลง",
          paragraphs: ["เมื่อสมัคร ใช้ เข้าถึง หรือกดใช้งานฟีเจอร์ใดของ ScoreMatrix คุณยอมรับข้อตกลงนี้ นโยบายความเป็นส่วนตัว กฎการรับรางวัล และประกาศทางกฎหมาย หากไม่ยอมรับ โปรดหยุดใช้บริการ"],
        },
        {
          title: "คุณสมบัติผู้ใช้และบัญชี",
          bullets: ["ผู้ใช้ต้องมีอายุอย่างน้อย 13 ปี หรือมีความยินยอม/การกำกับดูแลจากผู้ปกครองตามกฎหมายที่เกี่ยวข้อง", "ผู้ใช้ต้องให้ข้อมูลที่ถูกต้อง ไม่แอบอ้างบุคคลอื่น และรับผิดชอบต่อความปลอดภัยของบัญชี", "หนึ่งคนควรมีบัญชีเดียว เว้นแต่ ScoreMatrix อนุญาตเป็นลายลักษณ์อักษร"],
        },
        {
          title: "ลักษณะบริการและข้อห้ามการพนัน",
          paragraphs: ["ScoreMatrix ให้บริการเกมทายผลที่ใช้ทักษะ เช่น การวิเคราะห์ทีม ฟอร์มการแข่งขัน และสถิติ ผู้ใช้ไม่ได้วางเดิมพันด้วยเงินจริงหรือทรัพย์สินที่แลกเป็นเงินได้", "ห้ามใช้แพลตฟอร์มเพื่อจัดการพนัน รับแทง โอนเงินเดิมพัน ขายเลข/สลาก หรือชักชวนให้เล่นการพนัน หากพบพฤติกรรมดังกล่าว เราอาจระงับบัญชีและแจ้งหน่วยงานที่เกี่ยวข้อง"],
        },
        {
          title: "แต้ม เครดิต และรายการดิจิทัล",
          bullets: ["แต้มทายผลฟรีและเครดิตพรีเมียมใช้ภายในแพลตฟอร์มเท่านั้น", "ไม่มีมูลค่าเป็นเงินสด ไม่ใช่เงินอิเล็กทรอนิกส์ ไม่ใช่เงินฝาก และไม่สามารถถอน โอน ขาย หรือแลกเป็นเงินจริง", "ScoreMatrix อาจปรับสมดุลคะแนน ภารกิจ หรือแคตตาล็อกรางวัลเพื่อความเป็นธรรมและความปลอดภัย"],
        },
        {
          title: "พฤติกรรมที่ห้ามทำ",
          bullets: ["โกงระบบ ใช้บอต สคริปต์ หลายบัญชี หรือช่องโหว่เพื่อรับแต้ม/รางวัล", "คุกคาม หมิ่นประมาท โพสต์เนื้อหาผิดกฎหมาย ละเมิดสิทธิ หรือหลอกลวงผู้ใช้รายอื่น", "ขายบัญชี แต้ม เครดิต สิทธิ์แลกรางวัล หรือข้อมูลส่วนบุคคลของผู้อื่น"],
        },
        {
          title: "การระงับบัญชีและการบังคับใช้",
          paragraphs: ["เราอาจเตือน จำกัดฟีเจอร์ ระงับ หรือลบบัญชี หากพบการละเมิดข้อตกลง การฉ้อโกง การใช้บริการที่เสี่ยงต่อกฎหมายไทย หรือการกระทำที่กระทบต่อความปลอดภัยของระบบ ผู้ใช้สามารถติดต่อเพื่อขอทบทวนได้ตามช่องทางที่ระบุ"],
        },
        {
          title: "ความรับผิดและการเปลี่ยนแปลงบริการ",
          paragraphs: ["บริการจัดให้ตามสภาพที่เป็นอยู่ ข้อมูลการแข่งขันจากบุคคลที่สามอาจล่าช้าหรือคลาดเคลื่อนได้ เราจะใช้ความพยายามตามสมควรเพื่อแก้ไข แต่ไม่รับประกันว่าบริการจะไม่มีข้อผิดพลาดหรือพร้อมใช้งานตลอดเวลา", "เราอาจปรับข้อตกลงนี้เมื่อจำเป็น โดยจะแจ้งวันที่อัปเดตและประกาศในบริการ การใช้งานต่อหลังการเปลี่ยนแปลงถือว่ายอมรับเงื่อนไขใหม่"],
        },
        {
          title: "กฎหมายที่ใช้บังคับและการติดต่อ",
          paragraphs: ["ข้อตกลงนี้อยู่ภายใต้กฎหมายไทยในขอบเขตที่เกี่ยวข้อง หากข้อใดขัดต่อกฎหมาย ข้ออื่นยังคงมีผล ใช้ติดต่อเรื่องกฎหมายได้ที่ helloscorematrix@gmail.com"],
        },
      ],
    },
    privacy: {
      title: "นโยบายความเป็นส่วนตัว",
      updated: updated.th,
      intro: "นโยบายนี้อธิบายวิธีที่ ScoreMatrix เก็บ ใช้ เปิดเผย เก็บรักษา และคุ้มครองข้อมูลส่วนบุคคลตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) และหลักความโปร่งใส ความจำเป็น และความปลอดภัย",
      notice: { tone: "cyan", title: "สรุปสั้น", body: "เราเก็บข้อมูลเท่าที่จำเป็นเพื่อให้บริการบัญชี การทายผล leaderboard ภารกิจ รางวัล ความปลอดภัย และการสื่อสารที่คุณเลือก เราไม่ขายข้อมูลส่วนบุคคลของคุณ" },
      sections: [
        {
          title: "ข้อมูลที่เราเก็บ",
          bullets: ["ข้อมูลบัญชี เช่น ชื่อผู้ใช้ อีเมล รหัสผ่านที่เข้ารหัส ภาษา ประเทศ ปีเกิด และทีมโปรด", "ข้อมูลการใช้งาน เช่น คำทาย คะแนน ภารกิจ achievement leaderboard affiliate และประวัติแลกรางวัล", "ข้อมูลเทคนิค เช่น IP address, device/browser, cookies, log, session และข้อมูลความปลอดภัย", "ข้อมูลจัดส่งรางวัล เช่น ชื่อผู้รับ ที่อยู่ เบอร์โทร และข้อมูลติดต่อที่จำเป็น"],
        },
        {
          title: "ฐานกฎหมายในการประมวลผล",
          bullets: ["สัญญา: เพื่อสร้างบัญชี ให้บริการ ทายผล คำนวณคะแนน และจัดการรางวัล", "ความยินยอม: เช่น การสื่อสารการตลาด หรือข้อมูลที่กฎหมายต้องการความยินยอม", "ประโยชน์โดยชอบด้วยกฎหมาย: ความปลอดภัย การป้องกันทุจริต การวิเคราะห์บริการ และการปรับปรุงผลิตภัณฑ์", "หน้าที่ตามกฎหมาย: การปฏิบัติตามคำสั่งของหน่วยงานรัฐ ภาษี บัญชี หรือข้อกำหนดด้านกฎหมาย"],
        },
        {
          title: "วัตถุประสงค์การใช้ข้อมูล",
          bullets: ["ให้บริการบัญชี ระบบทายผล คะแนน leaderboard ภารกิจ affiliate และรางวัล", "ตรวจสอบการโกง หลายบัญชี บอต การละเมิดกฎ และความปลอดภัย", "ติดต่อเรื่องบริการ สำคัญด้านบัญชี กฎ รางวัล หรือคำขอของคุณ", "วิเคราะห์สถิติแบบรวมเพื่อปรับปรุงผลิตภัณฑ์ โดยพยายามลดการระบุตัวบุคคล"],
        },
        {
          title: "การเปิดเผยข้อมูล",
          paragraphs: ["เราอาจเปิดเผยข้อมูลต่อผู้ให้บริการที่จำเป็น เช่น hosting, analytics, email, payment, shipping, customer support และ fraud prevention ภายใต้เงื่อนไขรักษาความลับและข้อตกลงประมวลผลข้อมูลตาม PDPA เมื่อจำเป็น เราอาจเปิดเผยต่อหน่วยงานรัฐหรือบุคคลที่มีอำนาจตามกฎหมาย"],
        },
        {
          title: "การโอนข้อมูลไปต่างประเทศ",
          paragraphs: ["ผู้ให้บริการบางรายอาจอยู่ต่างประเทศ เราจะใช้มาตรการที่เหมาะสมตาม PDPA เช่น ข้อสัญญา มาตรฐานความปลอดภัย หรือกลไกที่กฎหมายยอมรับ เพื่อคุ้มครองข้อมูลเมื่อมีการโอนข้ามประเทศ"],
        },
        {
          title: "ระยะเวลาเก็บรักษาและความปลอดภัย",
          paragraphs: ["เราจะเก็บข้อมูลเท่าที่จำเป็นต่อวัตถุประสงค์ตามนโยบายนี้ การปฏิบัติตามกฎหมาย การระงับข้อพิพาท และการป้องกันการทุจริต จากนั้นจะลบ ทำลาย หรือทำให้ไม่สามารถระบุตัวบุคคลได้ เราใช้มาตรการรักษาความปลอดภัยเชิงเทคนิคและองค์กร แต่ไม่มีระบบใดปลอดภัย 100%"],
        },
        {
          title: "สิทธิของเจ้าของข้อมูล",
          bullets: ["ขอเข้าถึง รับสำเนา แก้ไข โอนย้าย ลบ ทำลาย ระงับการใช้ หรือคัดค้านการประมวลผลตามเงื่อนไขของ PDPA", "ถอนความยินยอมเมื่อการประมวลผลอาศัยความยินยอม โดยไม่กระทบการประมวลผลก่อนถอน", "ร้องเรียนต่อสำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล หากเห็นว่าการประมวลผลไม่เป็นไปตามกฎหมาย"],
        },
        {
          title: "เด็กและผู้เยาว์",
          paragraphs: ["หากผู้ใช้เป็นผู้เยาว์ เราอาจต้องอาศัยความยินยอมจากผู้ปกครองตามกฎหมายไทย และอาจจำกัดฟีเจอร์บางอย่างเพื่อคุ้มครองผู้ใช้ที่อายุน้อย"],
        },
        {
          title: "ติดต่อเรื่องข้อมูลส่วนบุคคล",
          paragraphs: ["ติดต่อคำขอใช้สิทธิหรือคำถามเกี่ยวกับข้อมูลส่วนบุคคลได้ที่ helloscorematrix@gmail.com โปรดระบุข้อมูลที่เพียงพอเพื่อยืนยันตัวตนและดำเนินคำขอ"],
        },
      ],
    },
    rewardRules: {
      title: "กฎการรับรางวัล",
      updated: updated.th,
      intro: "กฎนี้อธิบายการได้รับแต้ม เครดิต การแลกรางวัล และข้อจำกัดเพื่อให้สอดคล้องกับกฎหมายไทย โดยเฉพาะการหลีกเลี่ยงการจัดการพนันหรือการชิงโชคแบบสุ่มที่ต้องได้รับอนุญาต",
      notice: { tone: "green", title: "ไม่ใช่รางวัลเงินสด", body: commonNotice.th },
      sections: [
        {
          title: "วิธีได้รับแต้ม",
          bullets: ["ทายสกอร์ถูกต้อง: 10 แต้ม", "ทายผลและผลต่างประตูถูกต้อง: 7 แต้ม", "ทายผลแพ้/ชนะ/เสมอถูกต้อง: 5 แต้ม", "ภารกิจรายวัน/รายสัปดาห์ achievement และ streak bonus ตามที่ระบบประกาศ", "คะแนนมาจากกติกาที่กำหนดล่วงหน้า ไม่ใช่การสุ่มจับรางวัล"],
        },
        {
          title: "เครดิตพรีเมียม",
          paragraphs: ["เครดิตพรีเมียมอาจใช้กับของตกแต่งโปรไฟล์ ธีม ไอเท็มดิจิทัล หรือฟีเจอร์ cosmetic ที่ไม่เพิ่มโอกาสชนะ ไม่เปลี่ยนผลการแข่งขัน และไม่แลกเป็นเงินสด"],
        },
        {
          title: "การแลกรางวัล",
          bullets: ["รางวัลอาจเป็นสินค้า merchandise, digital goods, cosmetic items หรือ voucher จากพาร์ทเนอร์ที่ระบุ", "ผู้ใช้ต้องมีแต้มเพียงพอและผ่านเงื่อนไขบัญชี เช่น ไม่ถูกระงับ ไม่พบการโกง และให้ข้อมูลจัดส่งที่ถูกต้อง", "รางวัลมีจำนวนจำกัดและอาจเปลี่ยนแปลงตาม availability โดยจะแจ้งในแคตตาล็อก"],
        },
        {
          title: "ข้อกำหนดตามกฎหมายไทย",
          paragraphs: ["ScoreMatrix จะไม่จัดกิจกรรมที่ผู้ชนะได้มาจากการสุ่ม ชิงโชค จับสลาก หรือเสี่ยงโชคเพื่อรับรางวัลโดยไม่ได้ดำเนินการตามกฎหมายและใบอนุญาตที่เกี่ยวข้อง กิจกรรมรางวัลของแพลตฟอร์มต้องอิงทักษะ ความถูกต้องของคำทาย หรือภารกิจที่ประกาศชัดเจน"],
        },
        {
          title: "การจัดส่ง ภาษี และการยืนยันตัวตน",
          paragraphs: ["รางวัลที่เป็นสินค้าต้องใช้ข้อมูลจัดส่ง อาจใช้เวลา 7-21 วันทำการหรือตามพื้นที่ ผู้ใช้รับผิดชอบภาษี อากร ค่าธรรมเนียม หรือข้อกำหนดที่เกี่ยวข้องกับการรับของรางวัล เว้นแต่เราระบุเป็นอย่างอื่น", "เราอาจขอข้อมูลเพิ่มเติมเพื่อยืนยันตัวตนหรือป้องกันการทุจริตก่อนส่งมอบรางวัล โดยจะเก็บเท่าที่จำเป็น"],
        },
        {
          title: "การยกเลิกหรือริบรางวัล",
          bullets: ["พบการโกง ใช้หลายบัญชี บอต สคริปต์ หรือข้อมูลเท็จ", "ละเมิดข้อตกลงการใช้งานหรือกฎหมาย", "ไม่ตอบกลับหรือให้ข้อมูลจัดส่งภายในเวลาที่กำหนด", "รางวัลไม่สามารถจัดส่งได้ด้วยเหตุที่อยู่นอกเหนือการควบคุมอย่างสมเหตุสมผล"],
        },
        {
          title: "ข้อโต้แย้งเกี่ยวกับคะแนน",
          paragraphs: ["ผลคะแนนอ้างอิงข้อมูลการแข่งขันที่ระบบรับมาและกติกาคำนวณที่ประกาศ หากพบข้อผิดพลาดทางเทคนิค เราอาจแก้ไขคะแนนย้อนหลังเพื่อความถูกต้องและเป็นธรรม"],
        },
      ],
    },
    legalNotice: {
      title: "ประกาศทางกฎหมาย",
      updated: updated.th,
      intro: "ประกาศนี้สรุปสถานะทางกฎหมายและข้อจำกัดของ ScoreMatrix สำหรับผู้ใช้ในประเทศไทยและผู้ใช้ที่เกี่ยวข้องกับประเทศไทย",
      notice: { tone: "red", title: "คำประกาศสำคัญ", body: commonNotice.th },
      sections: [
        {
          title: "ไม่ใช่การพนันหรือการเดิมพัน",
          paragraphs: ["เราไม่รับเดิมพัน ไม่รับฝากเงินเพื่อเสี่ยงโชค ไม่จ่ายเงินรางวัลตามผลการแข่งขัน และไม่สนับสนุนการพนันออนไลน์ ผู้ใช้ห้ามใช้บริการเพื่อกิจกรรมที่อาจเข้าข่ายการพนันภายใต้พระราชบัญญัติการพนัน พ.ศ. 2478 หรือกฎหมายอื่นของไทย"],
        },
        {
          title: "ไม่ใช่สลากหรือการชิงโชคโดยสุ่ม",
          paragraphs: ["รางวัลของ ScoreMatrix ต้องอิงกติกาที่ประกาศ เช่น ทักษะการทายผล ภารกิจ หรือคะแนนสะสม ไม่ใช่การจับสลากหรือสุ่มผู้ชนะ หากมีแคมเปญที่เข้าข่ายชิงโชคหรือเสี่ยงโชค จะต้องดำเนินการตามกฎหมายและการอนุญาตที่เกี่ยวข้องก่อน"],
        },
        {
          title: "ข้อมูลการแข่งขันและบุคคลที่สาม",
          paragraphs: ["ข้อมูลการแข่งขัน โลโก้ ชื่อทีม หรือสถิติอาจมาจากบุคคลที่สามหรือแหล่งข้อมูลภายนอก ใช้เพื่อการให้ข้อมูลและความบันเทิงเท่านั้น เราไม่รับประกันความถูกต้องครบถ้วนแบบเรียลไทม์"],
        },
        {
          title: "ทรัพย์สินทางปัญญา",
          paragraphs: ["ชื่อ ScoreMatrix โลโก้ UI ข้อความ โค้ด และเนื้อหาที่สร้างโดยเราได้รับความคุ้มครองตามกฎหมายลิขสิทธิ์ เครื่องหมายการค้า และกฎหมายที่เกี่ยวข้อง ห้ามคัดลอก แก้ไข หรือใช้เชิงพาณิชย์โดยไม่ได้รับอนุญาต"],
        },
        {
          title: "ข้อจำกัดพื้นที่และกฎหมายท้องถิ่น",
          paragraphs: ["ผู้ใช้ต้องรับผิดชอบในการตรวจสอบว่าการใช้บริการสอดคล้องกับกฎหมายในพื้นที่ของตน หากพื้นที่ใดห้ามเกมทายผล คะแนน หรือรางวัลบางประเภท ผู้ใช้ต้องหยุดใช้บริการในส่วนนั้น"],
        },
        {
          title: "ความปลอดภัยและการรายงาน",
          paragraphs: ["หากพบเนื้อหาผิดกฎหมาย การชักชวนพนัน การละเมิดสิทธิ หรือช่องโหว่ด้านความปลอดภัย โปรดแจ้ง helloscorematrix@gmail.com เราอาจดำเนินการลบเนื้อหา ระงับบัญชี หรือแจ้งหน่วยงานตามความเหมาะสม"],
        },
      ],
    },
  },
  en: {
    terms: {
      title: "Terms of Service",
      updated: updated.en,
      intro: "These Terms govern use of ScoreMatrix by users in Thailand and users who access the service from Thailand. They are designed with Thai legal requirements in mind, including personal data protection, gambling restrictions, electronic transactions, consumer protection, and online safety.",
      notice: { tone: "amber", title: "Important limitation", body: commonNotice.en },
      sections: [
        { title: "Acceptance", paragraphs: ["By registering, accessing, or using ScoreMatrix, you agree to these Terms, the Privacy Policy, Reward Rules, and Legal Notice. If you do not agree, do not use the service."] },
        { title: "Eligibility and accounts", bullets: ["You must be at least 13 years old, or have parental/legal guardian consent where required.", "You must provide accurate information and keep your account credentials secure.", "Each person should maintain only one account unless ScoreMatrix gives written permission."] },
        { title: "Service description and no gambling", paragraphs: ["ScoreMatrix is a skill-based prediction experience using football knowledge, form, and statistics. Users do not stake real money or assets convertible to cash.", "You must not use the platform to operate gambling, accept bets, transfer stakes, sell lottery numbers, or promote gambling. We may suspend accounts and report unlawful activity."] },
        { title: "Points, credits, and digital items", bullets: ["Free Prediction Points and Premium Credits are for in-platform use only.", "They are not cash, e-money, deposits, securities, or stored value and cannot be withdrawn, sold, transferred, or exchanged for real money.", "We may rebalance scoring, missions, and reward catalogues for fairness, security, and compliance."] },
        { title: "Prohibited conduct", bullets: ["Cheating, bots, scripts, multi-account abuse, exploit use, or reward fraud.", "Harassment, unlawful content, impersonation, deception, or infringement of others' rights.", "Selling accounts, points, credits, reward rights, or another person's data."] },
        { title: "Enforcement", paragraphs: ["We may warn, restrict, suspend, or terminate accounts if we detect violations, fraud, legal risk, or threats to platform safety. You may contact us to request review."] },
        { title: "Liability and service changes", paragraphs: ["The service is provided as-is. Third-party match data may be delayed or inaccurate. We use reasonable efforts to correct issues but do not guarantee uninterrupted or error-free operation.", "We may update these Terms when necessary and will show the updated date. Continued use after changes means acceptance of the new terms."] },
        { title: "Governing law and contact", paragraphs: ["These Terms are governed by Thai law where applicable. If any term is invalid, the rest remains effective. Contact helloscorematrix@gmail.com for legal questions."] },
      ],
    },
    privacy: {
      title: "Privacy Policy",
      updated: updated.en,
      intro: "This Policy explains how ScoreMatrix collects, uses, discloses, retains, and protects personal data in line with Thailand's Personal Data Protection Act B.E. 2562 (2019) (PDPA), transparency, data minimization, and security principles.",
      notice: { tone: "cyan", title: "Short summary", body: "We collect only what is reasonably needed for accounts, predictions, leaderboards, missions, rewards, affiliate tracking, security, and communications you choose. We do not sell personal data." },
      sections: [
        { title: "Data we collect", bullets: ["Account data: username, email, encrypted password, language, country, birth year, favorite team, and profile data.", "Activity data: predictions, points, missions, achievements, leaderboards, affiliate activity, and redemption history.", "Technical data: IP address, device/browser, cookies, logs, sessions, and security events.", "Reward delivery data: recipient name, address, phone number, and necessary contact information."] },
        { title: "Lawful bases", bullets: ["Contract: account operation, predictions, scoring, rewards, and support.", "Consent: marketing communications or processing that legally requires consent.", "Legitimate interests: security, fraud prevention, service analytics, and product improvement.", "Legal obligation: compliance with lawful orders, accounting, tax, or regulatory requirements."] },
        { title: "How we use data", bullets: ["Provide accounts, prediction scoring, leaderboards, missions, affiliate features, and rewards.", "Detect cheating, bots, multi-account abuse, rule breaches, and security risks.", "Communicate service, account, legal, reward, and support updates.", "Create aggregate analytics to improve the product while reducing identifiability where practical."] },
        { title: "Disclosure", paragraphs: ["We may share data with necessary processors such as hosting, analytics, email, payment, shipping, support, and fraud-prevention providers under confidentiality and data-processing terms. We may disclose data to authorities when legally required."] },
        { title: "International transfer", paragraphs: ["Some providers may be outside Thailand. We use appropriate safeguards under the PDPA, such as contractual controls, security measures, or other legally recognized transfer mechanisms."] },
        { title: "Retention and security", paragraphs: ["We retain data only as long as reasonably necessary for the purposes in this Policy, legal compliance, dispute resolution, and fraud prevention, then delete, destroy, or anonymize it. We apply technical and organizational security measures, but no system is 100% secure."] },
        { title: "Your rights", bullets: ["You may request access, copy, correction, portability, deletion, destruction, restriction, or objection under the PDPA.", "You may withdraw consent where processing is based on consent, without affecting prior lawful processing.", "You may complain to the Personal Data Protection Committee if you believe processing violates the law."] },
        { title: "Children and minors", paragraphs: ["For minors, we may require parental or guardian consent under Thai law and may limit features to protect younger users."] },
        { title: "Contact", paragraphs: ["Contact helloscorematrix@gmail.com for privacy requests. Please provide enough information for verification and request handling."] },
      ],
    },
    rewardRules: {
      title: "Reward Rules",
      updated: updated.en,
      intro: "These Rules explain points, credits, redemption, and limits designed to comply with Thai law, especially avoiding unlicensed gambling or random lucky-draw promotions.",
      notice: { tone: "green", title: "No cash prize", body: commonNotice.en },
      sections: [
        { title: "Earning points", bullets: ["Exact score prediction: 10 points.", "Correct result plus goal difference: 7 points.", "Correct win/draw/loss result: 5 points.", "Daily/weekly missions, achievements, and streak bonuses as announced.", "Points are awarded by pre-announced rules, not random selection."] },
        { title: "Premium Credits", paragraphs: ["Premium Credits may be used for profile cosmetics, themes, digital items, or cosmetic features. They do not increase winning chances, alter match outcomes, or convert into cash."] },
        { title: "Redemption", bullets: ["Rewards may include merchandise, digital goods, cosmetic items, or clearly identified partner vouchers.", "Users must have enough points and a compliant account with no fraud, suspension, or false delivery data.", "Rewards are limited and may change based on availability shown in the catalogue."] },
        { title: "Thai-law safeguards", paragraphs: ["ScoreMatrix will not run random prize draws, lucky draws, raffles, or chance-based reward campaigns without following applicable Thai licensing and legal requirements. Platform rewards must be based on skill, announced missions, or points rules."] },
        { title: "Shipping, tax, and verification", paragraphs: ["Physical rewards require delivery data and may take 7-21 business days depending on destination. Users are responsible for taxes, duties, fees, or receipt requirements unless stated otherwise.", "We may request limited verification to prevent fraud before delivering rewards."] },
        { title: "Cancellation or forfeiture", bullets: ["Cheating, bots, scripts, multi-accounting, or false information.", "Violation of the Terms or law.", "Failure to provide delivery information within the stated period.", "Delivery failure due to reasons outside reasonable control."] },
        { title: "Point disputes", paragraphs: ["Scoring relies on received match data and published algorithms. If a technical error occurs, we may correct points retroactively for accuracy and fairness."] },
      ],
    },
    legalNotice: {
      title: "Legal Notice",
      updated: updated.en,
      intro: "This Notice summarizes ScoreMatrix's legal position and usage limitations for Thailand-related users.",
      notice: { tone: "red", title: "Important declaration", body: commonNotice.en },
      sections: [
        { title: "No gambling or betting", paragraphs: ["We do not accept wagers, hold stakes, pay cash prizes based on match results, or support online gambling. Users must not use the service for activity that may constitute gambling under Thailand's Gambling Act B.E. 2478 (1935) or other applicable laws."] },
        { title: "No lottery or random lucky draw", paragraphs: ["ScoreMatrix rewards are based on announced rules such as skill, prediction accuracy, missions, or accumulated points. They are not random lotteries or lucky draws. Any campaign involving chance will require applicable legal review and permissions before launch."] },
        { title: "Third-party data", paragraphs: ["Match data, logos, team names, or statistics may come from third-party sources and are provided for information and entertainment only. We do not guarantee real-time accuracy or completeness."] },
        { title: "Intellectual property", paragraphs: ["ScoreMatrix names, logos, UI, text, code, and original content are protected by copyright, trademark, and other laws. Unauthorized copying, modification, or commercial use is prohibited."] },
        { title: "Local restrictions", paragraphs: ["Users are responsible for ensuring that use is lawful in their location. If prediction games, points, or rewards are restricted where you are, you must stop using the restricted features."] },
        { title: "Reporting", paragraphs: ["Report unlawful content, gambling solicitation, rights violations, or security issues to helloscorematrix@gmail.com. We may remove content, suspend accounts, or notify authorities where appropriate."] },
      ],
    },
  },
  lo: null as unknown as LegalCopy,
  my: null as unknown as LegalCopy,
  km: null as unknown as LegalCopy,
  zh: null as unknown as LegalCopy,
};

const localizedLabels = {
  lo: {
    terms: "ເງື່ອນໄຂການໃຊ້ງານ",
    privacy: "ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວ",
    rewardRules: "ກົດການຮັບລາງວັນ",
    legalNotice: "ແຈ້ງການທາງກົດໝາຍ",
    updated: updated.lo,
    introSuffix: " ເນື້ອຫານີ້ຖືກຈັດເຮັດໃຫ້ຄອບຄຸມການໃຊ້ງານໃນປະເທດໄທ ແລະ ກົດໝາຍໄທທີ່ກ່ຽວຂ້ອງ.",
  },
  my: {
    terms: "အသုံးပြုမှုစည်းမျဉ်းများ",
    privacy: "ကိုယ်ရေးအချက်အလက်မူဝါဒ",
    rewardRules: "ဆုလက်ခံရေးစည်းမျဉ်းများ",
    legalNotice: "ဥပဒေဆိုင်ရာအသိပေးချက်",
    updated: updated.my,
    introSuffix: " ဤစာတမ်းသည် ထိုင်းနိုင်ငံအတွင်းအသုံးပြုမှုနှင့် သက်ဆိုင်ရာထိုင်းဥပဒေများကို ထည့်သွင်းစဉ်းစားထားသည်။",
  },
  km: {
    terms: "លក្ខខណ្ឌនៃការប្រើប្រាស់",
    privacy: "គោលការណ៍ឯកជនភាព",
    rewardRules: "ច្បាប់ទទួលរង្វាន់",
    legalNotice: "សេចក្តីជូនដំណឹងផ្លូវច្បាប់",
    updated: updated.km,
    introSuffix: " ឯកសារនេះគ្របដណ្តប់ការប្រើប្រាស់នៅប្រទេសថៃ និងច្បាប់ថៃដែលពាក់ព័ន្ធ។",
  },
  zh: {
    terms: "服务条款",
    privacy: "隐私政策",
    rewardRules: "奖励规则",
    legalNotice: "法律声明",
    updated: updated.zh,
    introSuffix: " 本文件覆盖在泰国的使用场景，并考虑泰国相关法律要求。",
  },
};

function localizeFromEnglish(locale: Exclude<LegalLocale, "th" | "en">): LegalCopy {
  const labels = localizedLabels[locale];
  const source = legalDocuments.en;
  return {
    terms: {
      ...source.terms,
      title: labels.terms,
      updated: labels.updated,
      intro: source.terms.intro + labels.introSuffix,
      notice: { ...source.terms.notice!, body: commonNotice[locale] },
    },
    privacy: {
      ...source.privacy,
      title: labels.privacy,
      updated: labels.updated,
      intro: source.privacy.intro + labels.introSuffix,
    },
    rewardRules: {
      ...source.rewardRules,
      title: labels.rewardRules,
      updated: labels.updated,
      intro: source.rewardRules.intro + labels.introSuffix,
      notice: { ...source.rewardRules.notice!, body: commonNotice[locale] },
    },
    legalNotice: {
      ...source.legalNotice,
      title: labels.legalNotice,
      updated: labels.updated,
      intro: source.legalNotice.intro + labels.introSuffix,
      notice: { ...source.legalNotice.notice!, body: commonNotice[locale] },
    },
  };
}

legalDocuments.lo = localizeFromEnglish("lo");
legalDocuments.my = localizeFromEnglish("my");
legalDocuments.km = localizeFromEnglish("km");
legalDocuments.zh = localizeFromEnglish("zh");

export function getLegalDocument(locale: string, page: LegalPage) {
  const safeLocale = locale in legalDocuments ? (locale as LegalLocale) : "en";
  return legalDocuments[safeLocale][page];
}
