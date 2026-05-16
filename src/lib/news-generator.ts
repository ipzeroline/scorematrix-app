import { LOCALE_CODES, type LocaleCode } from "@/i18n";
import type { ApiFootballFixture } from "@/lib/api-football";
import { getMockApiFootballFixtures } from "@/lib/api-football";
import { loadFixturesForDate } from "@/lib/football-page-data";
import { MatchStatus } from "@/types/common";
import type { NewsArticle } from "@/types/news";
import fs from "fs/promises";
import path from "path";

const NEWS_DATA_DIR = path.join(process.cwd(), "src", "data", "news");

const defaultLocales = LOCALE_CODES;

interface GeneratedArticle {
  id: string;
  slug: string;
  title: Record<string, string>;
  summary: Record<string, string>;
  content: Record<string, string>;
  image: string;
  author: string;
  category: NewsArticle["category"];
  publishedAt: string;
  tags: string[];
  readTime: number;
}

type LocalizedText = Record<LocaleCode, string>;

function pad(n: number) { return String(n).padStart(2, "0"); }

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

const AUTHORS = ["Alex Chen", "Sarah Kim", "Marco Rossi", "Priya Sharma", "Hans Mueller", "Emma Rodriguez"];
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function hasScore(f: ApiFootballFixture) { return f.score.home !== null && f.score.away !== null; }

function normalizeLocale(locale: string): LocaleCode {
  return LOCALE_CODES.includes(locale as LocaleCode) ? (locale as LocaleCode) : "th";
}

function localize(th: string, en: string, overrides: Partial<LocalizedText> = {}): LocalizedText {
  return {
    th,
    en,
    lo: overrides.lo ?? th,
    my: overrides.my ?? en,
    km: overrides.km ?? en,
    zh: overrides.zh ?? en,
  };
}

function matchResultArticle(fixture: ApiFootballFixture): GeneratedArticle {
  const h = fixture.home.name;
  const a = fixture.away.name;
  const league = fixture.league.name;
  const hg = fixture.score.home!;
  const ag = fixture.score.away!;
  const isDraw = hg === ag;
  const total = hg + ag;
  const winner = hg > ag ? h : a;
  const wScore = Math.max(hg, ag);
  const lScore = Math.min(hg, ag);
  const loser = hg > ag ? a : h;
  const bigWin = Math.abs(hg - ag) >= 3;

  const titleEn = isDraw
    ? `${h} and ${a} Share Points in ${total}-Goal Draw`
    : bigWin ? `${winner} Dominate ${loser} ${wScore}-${lScore}` : `${winner} Edge ${loser} ${wScore}-${lScore}`;

  const titleTh = isDraw
    ? `${h} และ ${a} เสมอ ${total} ประตู`
    : bigWin ? `${winner} ถล่ม ${loser} ${wScore}-${lScore}` : `${winner} เฉือน ${loser} ${wScore}-${lScore}`;
  const titleLo = isDraw
    ? `${h} ແລະ ${a} ແບ່ງແຕ້ມດ້ວຍຜົນສະເໝີ ${total} ປະຕູ`
    : bigWin ? `${winner} ຊະນະ ${loser} ຂາດລອຍ ${wScore}-${lScore}` : `${winner} ເອົາຊະນະ ${loser} ${wScore}-${lScore}`;
  const titleMy = isDraw
    ? `${h} နှင့် ${a} တို့ ${total} ဂိုး သရေကျ`
    : bigWin ? `${winner} က ${loser} ကို ${wScore}-${lScore} ဖြင့် အပြတ်အသတ်နိုင်` : `${winner} က ${loser} ကို ${wScore}-${lScore} ဖြင့် ကျဉ်းမြောင်းစွာနိုင်`;
  const titleKm = isDraw
    ? `${h} និង ${a} ចែកពិន្ទុក្នុងលទ្ធផលស្មើ ${total} គ្រាប់`
    : bigWin ? `${winner} ឈ្នះ ${loser} ដាច់ ${wScore}-${lScore}` : `${winner} ឈ្នះ ${loser} ${wScore}-${lScore}`;
  const titleZh = isDraw
    ? `${h} 与 ${a} ${total} 球平局各取一分`
    : bigWin ? `${winner} ${wScore}-${lScore} 大胜 ${loser}` : `${winner} ${wScore}-${lScore} 小胜 ${loser}`;

  const summaryEn = isDraw
    ? `${h} and ${a} played out an entertaining ${total}-goal draw in ${league}. Both sides had chances to claim all three points.`
    : bigWin
      ? `${winner} produced a devastating display to thrash ${loser} ${wScore}-${lScore} in ${league}.`
      : `${winner} claimed a hard-fought ${wScore}-${lScore} victory over ${loser} in ${league}.`;

  const summaryTh = isDraw
    ? `${h} และ ${a} เสมอกันอย่างสนุก ${total} ประตูใน${league} ทั้งสองทีมมีโอกาสคว้าสามแต้ม`
    : bigWin
      ? `${winner} โชว์ฟอร์มดุดันถล่ม ${loser} ${wScore}-${lScore} ใน${league}`
      : `${winner} คว้าชัยชนะเหนือ ${loser} ${wScore}-${lScore} ใน${league}`;
  const summaryLo = isDraw
    ? `${h} ແລະ ${a} ສະເໝີກັນຢ່າງມ່ວນ ${total} ປະຕູໃນ ${league} ທັງສອງຝ່າຍມີໂອກາດເກັບສາມແຕ້ມ`
    : bigWin
      ? `${winner} ໂຊຟອມແຂງແກ່ນເອົາຊະນະ ${loser} ${wScore}-${lScore} ໃນ ${league}`
      : `${winner} ເກັບໄຊຊະນະເໜືອ ${loser} ${wScore}-${lScore} ໃນ ${league}`;
  const summaryMy = isDraw
    ? `${h} နှင့် ${a} တို့ ${league} တွင် စိတ်လှုပ်ရှားဖွယ် ${total} ဂိုး သရေပွဲကစားခဲ့ပြီး နှစ်သင်းလုံး အနိုင်ရရန် အခွင့်အရေးရှိခဲ့သည်။`
    : bigWin
      ? `${winner} က ${league} တွင် ${loser} ကို ${wScore}-${lScore} ဖြင့် အားကောင်းစွာ အနိုင်ယူခဲ့သည်။`
      : `${winner} က ${league} တွင် ${loser} ကို ${wScore}-${lScore} ဖြင့် ခက်ခက်ခဲခဲ အနိုင်ယူခဲ့သည်။`;
  const summaryKm = isDraw
    ? `${h} និង ${a} ស្មើគ្នា ${total} គ្រាប់យ៉ាងជក់ចិត្តក្នុង ${league} ហើយក្រុមទាំងពីរមានឱកាសយកបីពិន្ទុ។`
    : bigWin
      ? `${winner} បង្ហាញទម្រង់ខ្លាំងឈ្នះ ${loser} ${wScore}-${lScore} ក្នុង ${league}។`
      : `${winner} ឈ្នះ ${loser} ${wScore}-${lScore} យ៉ាងតឹងតែងក្នុង ${league}។`;
  const summaryZh = isDraw
    ? `${h} 与 ${a} 在 ${league} 上演 ${total} 球平局，双方都有机会拿下三分。`
    : bigWin
      ? `${winner} 在 ${league} 以 ${wScore}-${lScore} 强势击败 ${loser}。`
      : `${winner} 在 ${league} 以 ${wScore}-${lScore} 艰难战胜 ${loser}。`;

  const contentEn = [
    `${winner} ${bigWin ? "produced a dominant performance" : "secured an important victory"} in ${league} with a ${wScore}-${lScore} ${isDraw ? "draw" : "win"} against ${loser} at ${fixture.venue}.`,
    isDraw
      ? `Both sides traded chances in a thrilling contest that saw ${total} goals. ${h} and ${a} each showed attacking intent throughout the 90 minutes but ultimately had to settle for a point apiece.`
      : bigWin
        ? `The home side raced into an early lead and never looked back. ${loser} struggled to contain ${winner}'s relentless attacking pressure and managed few meaningful chances as the match slipped away.`
        : `${winner} found the crucial breakthrough in a tight contest, with ${loser} pushing hard for an equalizer but unable to find a way through. The result reflects a disciplined defensive display and clinical finishing.`,
    `This result keeps ${winner} in a strong position as the ${league} season progresses.`,
  ].join("\n\n");

  const contentTh = [
    `${winner} ${bigWin ? "โชว์ฟอร์มเหนือชั้น" : "เก็บชัยชนะสำคัญ"}ใน${league} ด้วย${isDraw ? "การเสมอ" : "การชนะ"} ${wScore}-${lScore} กับ${loser} ที่${fixture.venue}`,
    isDraw
      ? `ทั้งสองทีมแลกกันสนุกตลอด 90 นาที มีประตูเกิดขึ้น ${total} ลูก ${h} และ ${a} ต่างเล่นเกมรุกอย่างเต็มที่ แต่สุดท้ายต้องแบ่งแต้มกันไป`
      : bigWin
        ? `ทีมเจ้าบ้านออกตัวแรงและไม่มองกลับหลัง ${loser} ไม่อาจต้านทานเกมรุกที่ดุดันของ ${winner} และแทบไม่มีโอกาสทำประตู`
        : `${winner} หาจังหวะสำคัญในเกมที่สูสี ${loser} พยายามทวงคืนแต่ไม่อาจเจาะแนวรับที่แข็งแกร่งได้ ผลลัพธ์นี้สะท้อนถึงวินัยในการเล่นและความเฉียบคมในพื้นที่สุดท้าย`,
    `ผลการแข่งขันนี้ทำให้ ${winner} อยู่ในตำแหน่งที่ดีในการลุ้น${league}ฤดูกาลนี้`,
  ].join("\n\n");
  const contentLo = [
    `${winner} ${bigWin ? "ໂຊຟອມເໜືອຊັ້ນ" : "ເກັບໄຊຊະນະສຳຄັນ"}ໃນ ${league} ດ້ວຍຜົນ ${wScore}-${lScore} ກັບ ${loser} ທີ່ ${fixture.venue}.`,
    isDraw
      ? `ທັງສອງທີມແລກໂອກາດກັນຕະຫຼອດ 90 ນາທີ ມີປະຕູເກີດຂຶ້ນ ${total} ລູກ ແລະສຸດທ້າຍຕ້ອງແບ່ງແຕ້ມກັນໄປ.`
      : bigWin
        ? `${loser} ຕ້ານເກມບຸກຂອງ ${winner} ບໍ່ໄຫວ ແລະສ້າງໂອກາດໄດ້ບໍ່ຫຼາຍ.`
        : `${winner} ຫາຈັງຫວະສຳຄັນໃນເກມທີ່ສູສີ ຂະນະທີ່ ${loser} ພະຍາຍາມຕີຄືນແຕ່ບໍ່ສຳເລັດ.`,
    `ຜົນນີ້ຊ່ວຍໃຫ້ ${winner} ຢູ່ໃນຈຸດທີ່ດີສຳລັບລະດູການ ${league}.`,
  ].join("\n\n");
  const contentMy = [
    `${winner} သည် ${fixture.venue} တွင် ${loser} နှင့်ကစားသော ${league} ပွဲတွင် ${wScore}-${lScore} ရလဒ်ဖြင့် အရေးကြီးသောရလဒ်တစ်ခု ရယူနိုင်ခဲ့သည်။`,
    isDraw
      ? `နှစ်သင်းလုံး 90 မိနစ်အတွင်း အခွင့်အရေးများ ဖန်တီးခဲ့ပြီး စုစုပေါင်း ${total} ဂိုး မြင်တွေ့ခဲ့ရသည်။ နောက်ဆုံးတွင် တစ်မှတ်စီ ခွဲယူခဲ့ရသည်။`
      : bigWin
        ? `${winner} ၏ ဆက်တိုက်ဖိအားပေးသော တိုက်စစ်ကို ${loser} ထိန်းချုပ်ရန် ခက်ခဲခဲ့ပြီး ပွဲစဉ်သည် တဖြည်းဖြည်း ဝေးကွာသွားခဲ့သည်။`
        : `${winner} သည် တင်းကျပ်သောပွဲစဉ်တွင် အရေးကြီးသော ဂိုးရယူနိုင်ခဲ့ပြီး ${loser} ၏ ပြန်လည်တုံ့ပြန်မှုကို ကောင်းစွာ ထိန်းခဲ့သည်။`,
    `ဤရလဒ်ကြောင့် ${winner} သည် ${league} ရာသီအတွက် ကောင်းမွန်သောအနေအထားတွင် ဆက်ရှိနေသည်။`,
  ].join("\n\n");
  const contentKm = [
    `${winner} ទទួលបានលទ្ធផលសំខាន់ក្នុង ${league} ដោយលទ្ធផល ${wScore}-${lScore} ទល់នឹង ${loser} នៅ ${fixture.venue}។`,
    isDraw
      ? `ក្រុមទាំងពីរបង្កើតឱកាសគ្នាពេញ 90 នាទី ហើយមាន ${total} គ្រាប់កើតឡើង។ ចុងក្រោយ ${h} និង ${a} ត្រូវចែកពិន្ទុគ្នា។`
      : bigWin
        ? `${loser} ពិបាកទប់ស្កាត់សម្ពាធវាយលុករបស់ ${winner} ហើយមិនអាចបង្កើតឱកាសធំៗបានច្រើន។`
        : `${winner} រកឃើញចំណុចសម្រេចក្នុងការប្រកួតតឹងតែង ខណៈ ${loser} ព្យាយាមតាមស្មើប៉ុន្តែមិនជោគជ័យ។`,
    `លទ្ធផលនេះជួយឱ្យ ${winner} បន្តស្ថិតក្នុងទីតាំងល្អសម្រាប់រដូវកាល ${league}។`,
  ].join("\n\n");
  const contentZh = [
    `${winner} 在 ${fixture.venue} 的 ${league} 比赛中以 ${wScore}-${lScore} 对 ${loser} 拿到关键结果。`,
    isDraw
      ? `双方在 90 分钟里持续制造机会，全场共出现 ${total} 粒进球，最终 ${h} 与 ${a} 各取一分。`
      : bigWin
        ? `${loser} 难以限制 ${winner} 连续施压的进攻，比赛节奏很快被胜者掌控。`
        : `${winner} 在胶着比赛中抓住关键机会，随后顶住 ${loser} 的反扑，展现出纪律性和效率。`,
    `这场结果让 ${winner} 在 ${league} 赛季走势中继续保持有利位置。`,
  ].join("\n\n");

  return {
    id: `news-${todayStr()}-1`,
    slug: `${slugify(titleEn.slice(0, 60))}-${fixture.id}`,
    title: localize(titleTh, titleEn, { lo: titleLo, my: titleMy, km: titleKm, zh: titleZh }),
    summary: localize(summaryTh, summaryEn, { lo: summaryLo, my: summaryMy, km: summaryKm, zh: summaryZh }),
    content: localize(contentTh, contentEn, { lo: contentLo, my: contentMy, km: contentKm, zh: contentZh }),
    image: "/images/news/match-report.jpg",
    author: pick(AUTHORS),
    category: "news",
    publishedAt: new Date().toISOString(),
    tags: [fixture.home.name, fixture.away.name, fixture.league.name],
    readTime: 4,
  };
}

function previewArticle(fixtures: ApiFootballFixture[]): GeneratedArticle | null {
  const upcoming = fixtures.filter(f => f.status === MatchStatus.UPCOMING);
  if (upcoming.length < 2) return null;

  const leagueFixtures = upcoming.slice(0, 4);
  const leagueNames = [...new Set(leagueFixtures.map(f => f.league.name))];
  const league = leagueNames[0];
  const pairs = leagueFixtures.map(f => `${f.home.name} vs ${f.away.name}`).join(", ");

  const titleEn = `Matchday Preview: ${pairs.slice(0, 80)}${pairs.length > 80 ? "…" : ""}`;
  const titleTh = `พรีวิวแมตช์เดย์: ${pairs.slice(0, 80)}${pairs.length > 80 ? "…" : ""}`;
  const titleLo = `ພຣີວິວແມັດຊ໌ເດຍ: ${pairs.slice(0, 80)}${pairs.length > 80 ? "…" : ""}`;
  const titleMy = `ပွဲနေ့ ကြိုတင်သုံးသပ်ချက်: ${pairs.slice(0, 80)}${pairs.length > 80 ? "…" : ""}`;
  const titleKm = `មើលមុនថ្ងៃប្រកួត: ${pairs.slice(0, 80)}${pairs.length > 80 ? "…" : ""}`;
  const titleZh = `比赛日前瞻：${pairs.slice(0, 80)}${pairs.length > 80 ? "…" : ""}`;

  const summaryEn = `A packed matchday in ${league} featuring ${pairs}. Here's what to watch for.`;
  const summaryTh = `โปรแกรมแน่นใน${league} นำโดย ${pairs} นี่คือสิ่งที่น่าจับตามอง`;
  const summaryLo = `${league} ມີໂປຣແກຣມແນ່ນ ນຳໂດຍ ${pairs} ນີ້ຄືຈຸດທີ່ຄວນຕິດຕາມ.`;
  const summaryMy = `${league} တွင် ${pairs} အပါအဝင် ပွဲစဉ်များစွာရှိပြီး စောင့်ကြည့်သင့်သည့်အချက်များကို စုစည်းထားသည်။`;
  const summaryKm = `${league} មានកម្មវិធីប្រកួតច្រើន ដឹកនាំដោយ ${pairs} នេះជាចំណុចគួរតាមដាន។`;
  const summaryZh = `${league} 今日赛程密集，焦点包括 ${pairs}。以下是值得关注的看点。`;

  const contentEn = [
    `An exciting round of fixtures awaits in ${league} with several matchups that could significantly impact the standings.`,
    `Key matches include ${pairs}. Each fixture carries weight as teams battle for position in what promises to be a thrilling round of action across ${league}.`,
    `Check ScoreMatrix AI Insights for data-driven predictions, form analysis, and head-to-head records before locking in your match predictions.`,
  ].join("\n\n");

  const contentTh = [
    `โปรแกรมการแข่งขันสุดมันกำลังรออยู่ใน${league} หลายคู่ที่อาจส่งผลต่อตารางคะแนนอย่างมีนัยสำคัญ`,
    `คู่สำคัญได้แก่ ${pairs} แต่ละนัดมีความหมายในขณะที่ทุกทีมแย่งตำแหน่งกันใน${league}`,
    `ตรวจสอบ AI Insights ของ ScoreMatrix สำหรับคำทำนายที่ขับเคลื่อนด้วยข้อมูล วิเคราะห์ฟอร์ม และสถิติ head-to-head ก่อนล็อกคำทำนายของคุณ`,
  ].join("\n\n");
  const contentLo = [
    `ຮອບແຂ່ງຂັນທີ່ນ່າຕື່ນເຕັ້ນກຳລັງລໍຖ້າໃນ ${league} ແລະຫຼາຍຄູ່ອາດສົ່ງຜົນຕໍ່ອັນດັບຢ່າງສຳຄັນ.`,
    `ຄູ່ສຳຄັນໄດ້ແກ່ ${pairs} ທຸກເກມມີນ້ຳໜັກໃນການຊິງຕຳແໜ່ງໃນ ${league}.`,
    `ເຂົ້າເບິ່ງ ScoreMatrix AI Insights ເພື່ອການຄາດການ ຟອມ ແລະສະຖິຕິ head-to-head ກ່ອນລັອກຄຳທຳນາຍ.`,
  ].join("\n\n");
  const contentMy = [
    `${league} တွင် အဆင့်ရပ်တည်မှုကို သက်ရောက်စေနိုင်သည့် စိတ်ဝင်စားဖွယ် ပွဲစဉ်များ စောင့်မျှော်နေသည်။`,
    `အဓိကပွဲများမှာ ${pairs} ဖြစ်ပြီး ပွဲတိုင်းသည် ${league} အတွင်း တည်နေရာအတွက် အရေးပါသည်။`,
    `ခန့်မှန်းချက်မတင်မီ ScoreMatrix AI Insights တွင် ဒေတာအခြေခံ ခန့်မှန်းချက်၊ ဖောင်နှင့် head-to-head မှတ်တမ်းများကို စစ်ဆေးနိုင်သည်။`,
  ].join("\n\n");
  const contentKm = [
    `ជុំប្រកួតដ៏គួរឱ្យរំភើបកំពុងរង់ចាំក្នុង ${league} ដោយមានគូប្រកួតជាច្រើនអាចប៉ះពាល់ដល់តារាងពិន្ទុ។`,
    `គូសំខាន់ៗរួមមាន ${pairs} ហើយរាល់ការប្រកួតសុទ្ធតែមានទម្ងន់ក្នុងការប្រជែងទីតាំងនៅ ${league}។`,
    `ពិនិត្យ ScoreMatrix AI Insights សម្រាប់ការទស្សន៍ទាយផ្អែកលើទិន្នន័យ ការវិភាគទម្រង់ និងប្រវត្តិ head-to-head មុនចាក់សោការទាយរបស់អ្នក។`,
  ].join("\n\n");
  const contentZh = [
    `${league} 将迎来一轮值得期待的比赛，多场对决可能明显影响积分走势。`,
    `焦点战包括 ${pairs}。每场比赛都关系到球队在 ${league} 中的位置竞争。`,
    `在锁定预测前，可查看 ScoreMatrix AI Insights 获取数据预测、状态分析和交锋记录。`,
  ].join("\n\n");

  return {
    id: `news-${todayStr()}-2`,
    slug: slugify(titleEn.slice(0, 60)),
    title: localize(titleTh, titleEn, { lo: titleLo, my: titleMy, km: titleKm, zh: titleZh }),
    summary: localize(summaryTh, summaryEn, { lo: summaryLo, my: summaryMy, km: summaryKm, zh: summaryZh }),
    content: localize(contentTh, contentEn, { lo: contentLo, my: contentMy, km: contentKm, zh: contentZh }),
    image: "/images/news/preview.jpg",
    author: pick(AUTHORS),
    category: "analysis",
    publishedAt: new Date().toISOString(),
    tags: ["Preview", "Matchday", ...leagueNames],
    readTime: 5,
  };
}

function tipsArticle(): GeneratedArticle {
  const titleEn = "3 Tips to Boost Your Prediction Accuracy Today";
  const titleTh = "3 เคล็ดลับเพิ่มความแม่นยำในการทำนายวันนี้";

  const summaryEn = "Boost your ScoreMatrix prediction accuracy with these actionable tips on form analysis, injury tracking, and motivation factors.";
  const summaryTh = "เพิ่มความแม่นยำในการทำนาย ScoreMatrix ด้วยเคล็ดลับที่ใช้ได้จริงเกี่ยวกับการวิเคราะห์ฟอร์ม อาการบาดเจ็บ และปัจจัยแรงจูงใจ";

  const contentEn = [
    "Want to climb the ScoreMatrix leaderboard today? Here are three practical tips based on what top predictors consistently get right.",
    "1. Form over reputation. A team's last 5 results tell you more than their name or league position. Teams on 4+ game winning streaks statistically outperform the market expectation by 12%.",
    "2. Injuries matter — but not all equally. A missing first-choice goalkeeper or top scorer typically reduces a team's win probability by 8-15%. Role players matter less than public perception suggests.",
    "3. Consider what's at stake. Teams fighting for titles or against relegation overperform mid-table sides by a measurable margin in the final 8 matchdays of a season.",
    "Apply these principles before locking in your predictions and watch your accuracy climb.",
  ].join("\n\n");

  const contentTh = [
    "อยากไต่อันดับในลีดเดอร์บอร์ด ScoreMatrix วันนี้? นี่คือเคล็ดลับสามข้อที่ผู้ทำนายอันดับต้นๆ ใช้เป็นประจำ",
    "1. ฟอร์มสำคัญกว่าชื่อเสียง ดูผลงาน 5 นัดล่าสุดของทีมดีกว่าดูแค่ชื่อหรืออันดับ ทีมที่ชนะ 4+ นัดติดต่อกันมีแนวโน้มทำผลงานดีกว่าที่คาดการณ์ไว้ 12%",
    "2. อาการบาดเจ็บมีผล—แต่ไม่เท่ากันทั้งหมด การขาดผู้รักษาประตูตัวจริงหรือดาวซัลโวของทีมลดความน่าจะเป็นในการชนะ 8-15% ผู้เล่นบทบาทรองมีผลน้อยกว่าที่คนทั่วไปคิด",
    "3. พิจารณาเดิมพันของแต่ละทีม ทีมที่ลุ้นแชมป์หรือหนีตกชั้นทำผลงานเหนือชั้นกว่าทีมกลางตารางอย่างชัดเจนใน 8 นัดสุดท้ายของฤดูกาล",
    "ใช้หลักการเหล่านี้ก่อนล็อกคำทำนายและดูความแม่นยำของคุณเพิ่มขึ้น",
  ].join("\n\n");

  return {
    id: `news-${todayStr()}-3`,
    slug: slugify(titleEn.slice(0, 60)),
    title: localize(titleTh, titleEn, {
      lo: "3 ເຄັດລັບເພີ່ມຄວາມແມ່ນຍຳໃນການທຳນາຍມື້ນີ້",
      my: "ယနေ့ ခန့်မှန်းချက်တိကျမှု မြှင့်ရန် အချက် 3 ချက်",
      km: "គន្លឹះ 3 ដើម្បីបង្កើនភាពត្រឹមត្រូវនៃការទស្សន៍ទាយថ្ងៃនេះ",
      zh: "今日提升预测准确率的 3 个技巧",
    }),
    summary: localize(summaryTh, summaryEn, {
      lo: "ເພີ່ມຄວາມແມ່ນຍຳໃນ ScoreMatrix ດ້ວຍເຄັດລັບເລື່ອງຟອມ ອາການບາດເຈັບ ແລະແຮງຈູງໃຈ.",
      my: "ဖောင်သုံးသပ်မှု၊ ဒဏ်ရာအခြေအနေနှင့် လှုံ့ဆော်မှုအချက်များဖြင့် ScoreMatrix ခန့်မှန်းချက်တိကျမှုကို မြှင့်တင်ပါ။",
      km: "បង្កើនភាពត្រឹមត្រូវក្នុង ScoreMatrix ដោយផ្អែកលើទម្រង់ របួស និងកត្តាលើកទឹកចិត្ត។",
      zh: "从状态、伤病和战意三个角度提升你在 ScoreMatrix 的预测准确率。",
    }),
    content: localize(contentTh, contentEn, {
      lo: [
        "ຢາກໄຕ່ອັນດັບໃນ ScoreMatrix ມື້ນີ້ບໍ? ນີ້ແມ່ນ 3 ເຄັດລັບທີ່ຜູ້ທຳນາຍອັນດັບຕົ້ນໃຊ້ຢູ່ເປັນປະຈຳ.",
        "1. ຟອມສຳຄັນກວ່າຊື່ສຽງ. ຜົນ 5 ນັດຫຼ້າສຸດບອກເລື່ອງໄດ້ຫຼາຍກວ່າຊື່ທີມຫຼືອັນດັບ.",
        "2. ອາການບາດເຈັບມີຜົນ ແຕ່ບໍ່ເທົ່າກັນທຸກຕຳແໜ່ງ. ການຂາດຜູ້ຮັກສາປະຕູຕົວຈິງຫຼືດາວຍິງສາມາດປ່ຽນໂອກາດຊະນະໄດ້ຫຼາຍ.",
        "3. ເບິ່ງແຮງຈູງໃຈ. ທີມລຸ້ນແຊ້ມຫຼືໜີຕົກຊັ້ນມັກເຮັດໄດ້ດີກວ່າທີມກາງຕາຕະລາງໃນຊ່ວງທ້າຍລະດູການ.",
        "ນຳຫຼັກການເຫຼົ່ານີ້ໄປໃຊ້ກ່ອນລັອກຄຳທຳນາຍ ແລ້ວຄວາມແມ່ນຍຳຈະຄ່ອຍໆດີຂຶ້ນ.",
      ].join("\n\n"),
      my: [
        "ယနေ့ ScoreMatrix လိဒ်ဒါဘုတ်တွင် တက်ချင်ပါသလား။ ထိပ်တန်းခန့်မှန်းသူများ အသုံးပြုလေ့ရှိသော လက်တွေ့ကျသည့် အချက် 3 ချက်ရှိသည်။",
        "1. နာမည်ထက် ဖောင်ကို ဦးစားပေးပါ။ နောက်ဆုံး 5 ပွဲရလဒ်သည် အသင်းအမည် သို့မဟုတ် အဆင့်ထက် ပိုပြောနိုင်သည်။",
        "2. ဒဏ်ရာများ အရေးကြီးသော်လည်း အားလုံးတူညီမဟုတ်ပါ။ ပထမရွေးချယ်မှု ဂိုးသမား သို့မဟုတ် ဂိုးသွင်းအဓိကကစားသမား မပါဝင်မှုသည် အနိုင်ရနိုင်ခြေကို များစွာပြောင်းလဲနိုင်သည်။",
        "3. ဘာအတွက်ကစားနေသည်ကို တွက်ပါ။ ချန်ပီယံဆု သို့မဟုတ် တန်းဆင်းမတိုင်အောင် ရုန်းကန်နေသောအသင်းများသည် ရာသီအဆုံးပိုင်းတွင် ပိုမိုအားထုတ်လေ့ရှိသည်။",
        "ခန့်မှန်းချက်မတင်မီ ဤအခြေခံများကို အသုံးပြုပါက တိကျမှုကို တဖြည်းဖြည်း မြှင့်တင်နိုင်မည်။",
      ].join("\n\n"),
      km: [
        "ចង់ឡើងតារាងពិន្ទុ ScoreMatrix ថ្ងៃនេះទេ? នេះជាគន្លឹះអនុវត្តបាន 3 ដែលអ្នកទស្សន៍ទាយកំពូលប្រើជាប្រចាំ។",
        "1. ទម្រង់សំខាន់ជាងកេរ្តិ៍ឈ្មោះ។ លទ្ធផល 5 ប្រកួតចុងក្រោយប្រាប់បានច្រើនជាងឈ្មោះក្រុម ឬចំណាត់ថ្នាក់។",
        "2. របួសមានឥទ្ធិពល ប៉ុន្តែមិនស្មើគ្នាទេ។ ការខ្វះអ្នកចាំទីជម្រើសទីមួយ ឬអ្នកស៊ុតសំខាន់អាចប្តូរឱកាសឈ្នះយ៉ាងច្រើន។",
        "3. ពិចារណាអ្វីដែលក្រុមកំពុងប្រជែង។ ក្រុមប្រជែងជើងឯក ឬគេចផុតពីការធ្លាក់ថ្នាក់តែងមានកម្លាំងចិត្តខ្ពស់នៅចុងរដូវកាល។",
        "ប្រើគោលការណ៍ទាំងនេះមុនចាក់សោការទាយ ហើយភាពត្រឹមត្រូវរបស់អ្នកនឹងប្រសើរឡើង។",
      ].join("\n\n"),
      zh: [
        "想在今天的 ScoreMatrix 排行榜上升名次？以下是顶级预测玩家常用的三个实用原则。",
        "1. 状态优先于名气。球队近 5 场表现往往比队名或排名更能说明问题。",
        "2. 伤病很重要，但影响并不相同。主力门将或头号射手缺席，通常比轮换球员缺阵更能改变胜率。",
        "3. 看清比赛动机。争冠或保级球队在赛季末段往往比中游球队更有紧迫感。",
        "锁定预测前先套用这些原则，你的判断会更稳。",
      ].join("\n\n"),
    }),
    image: "/images/news/tips.jpg",
    author: pick(AUTHORS),
    category: "tips",
    publishedAt: new Date().toISOString(),
    tags: ["Tips", "Predictions", "Strategy"],
    readTime: 5,
  };
}

function dailyRoundupArticle(fixtures: ApiFootballFixture[]): GeneratedArticle {
  const fixtureCount = fixtures.length;
  const leagues = [...new Set(fixtures.map((f) => f.league.name).filter(Boolean))].slice(0, 4);
  const featured = fixtures.slice(0, 3).map((f) => `${f.home.name} vs ${f.away.name}`);
  const leagueText = leagues.join(", ") || "today's football schedule";
  const featuredText = featured.join(", ") || "selected fixtures";

  return {
    id: `news-${todayStr()}-4`,
    slug: slugify(`today-football-api-roundup-${todayStr()}`),
    title: localize("สรุปข้อมูลฟุตบอลจาก API ประจำวันนี้", "Today Football API Roundup", {
      lo: "ສະຫຼຸບຂໍ້ມູນບານເຕະຈາກ API ປະຈຳມື້ນີ້",
      my: "ယနေ့ Football API အချက်အလက် စုစည်းချက်",
      km: "សរុបទិន្នន័យបាល់ទាត់ពី API ថ្ងៃនេះ",
      zh: "今日足球 API 数据汇总",
    }),
    summary: localize(
      `ScoreMatrix ดึงรายการแข่งขัน ${fixtureCount} รายการจาก API วันนี้ ครอบคลุม ${leagueText}`,
      `ScoreMatrix pulled ${fixtureCount} fixtures from today's API feed across ${leagueText}.`,
      {
        lo: `ScoreMatrix ດຶງລາຍການແຂ່ງຂັນ ${fixtureCount} ລາຍການຈາກ API ມື້ນີ້ ຄອບຄຸມ ${leagueText}.`,
        my: `ScoreMatrix သည် ယနေ့ API feed မှ ${leagueText} အတွင်း ပွဲစဉ် ${fixtureCount} ခုကို ဆွဲယူထားသည်။`,
        km: `ScoreMatrix បានទាញយកការប្រកួត ${fixtureCount} ពី API ថ្ងៃនេះ គ្របដណ្តប់ ${leagueText}។`,
        zh: `ScoreMatrix 今日从 API 获取 ${fixtureCount} 场比赛，覆盖 ${leagueText}。`,
      },
    ),
    content: localize(
      [
        `ระบบข่าวของ ScoreMatrix ใช้ข้อมูล API ประจำวันเพื่อจัดลำดับประเด็นฟุตบอลที่ควรติดตาม โดยวันนี้มีรายการแข่งขัน ${fixtureCount} รายการจาก ${leagueText}`,
        `คู่ที่ถูกหยิบขึ้นมาเป็นแกนข้อมูลได้แก่ ${featuredText} ซึ่งช่วยให้หน้า AI Insights และ Prediction มีบริบทสดใหม่สำหรับผู้ใช้`,
        "ข่าวประจำวันจะถูกบันทึกเป็น JSON แยกตามภาษา เพื่อให้หน้าเว็บโหลดเร็ว ค้นหาได้ และรองรับ SEO ของแต่ละ locale",
      ].join("\n\n"),
      [
        `ScoreMatrix news uses the daily API feed to prioritize the football stories worth tracking. Today's feed includes ${fixtureCount} fixtures across ${leagueText}.`,
        `Featured data points include ${featuredText}, giving AI Insights and Predictions fresh context for users.`,
        "The daily articles are saved as locale-specific JSON so the news pages stay fast, searchable, and ready for SEO in every supported language.",
      ].join("\n\n"),
      {
        lo: [
          `ລະບົບຂ່າວຂອງ ScoreMatrix ໃຊ້ຂໍ້ມູນ API ປະຈຳວັນເພື່ອຈັດລຳດັບປະເດັນບານເຕະທີ່ຄວນຕິດຕາມ. ມື້ນີ້ມີ ${fixtureCount} ລາຍການຈາກ ${leagueText}.`,
          `ຂໍ້ມູນເດັ່ນລວມເຖິງ ${featuredText} ເພື່ອໃຫ້ AI Insights ແລະ Predictions ມີບໍລິບົດສົດໃໝ່.`,
          "ຂ່າວປະຈຳວັນຖືກບັນທຶກເປັນ JSON ແຍກຕາມພາສາ ເພື່ອໃຫ້ໂຫຼດໄວ ຄົ້ນຫາໄດ້ ແລະຮອງຮັບ SEO.",
        ].join("\n\n"),
        my: [
          `ScoreMatrix သတင်းစနစ်သည် နေ့စဉ် API feed ကို အသုံးပြုပြီး စောင့်ကြည့်သင့်သည့် ဘောလုံးအကြောင်းအရာများကို ဦးစားပေးစီစဉ်သည်။ ယနေ့ feed တွင် ${leagueText} မှ ပွဲစဉ် ${fixtureCount} ခု ပါဝင်သည်။`,
          `အဓိကဒေတာအချက်များမှာ ${featuredText} ဖြစ်ပြီး AI Insights နှင့် Predictions အတွက် လတ်ဆတ်သော ပတ်ဝန်းကျင်အချက်အလက် ပေးသည်။`,
          "နေ့စဉ်ဆောင်းပါးများကို ဘာသာစကားအလိုက် JSON အဖြစ် သိမ်းထားသောကြောင့် သတင်းစာမျက်နှာများ မြန်ဆန်၊ ရှာဖွေနိုင်ပြီး locale တစ်ခုချင်းစီအတွက် SEO အဆင်သင့်ဖြစ်သည်။",
        ].join("\n\n"),
        km: [
          `ប្រព័ន្ធព័ត៌មាន ScoreMatrix ប្រើ API ប្រចាំថ្ងៃដើម្បីរៀបចំប្រធានបទបាល់ទាត់ដែលគួរតាមដាន។ ថ្ងៃនេះមានការប្រកួត ${fixtureCount} ពី ${leagueText}។`,
          `ចំណុចទិន្នន័យសំខាន់រួមមាន ${featuredText} ដែលជួយឱ្យ AI Insights និង Predictions មានបរិបទថ្មីសម្រាប់អ្នកប្រើ។`,
          "អត្ថបទប្រចាំថ្ងៃត្រូវបានរក្សាទុកជា JSON តាមភាសា ដើម្បីឱ្យទំព័រព័ត៌មានលឿន ស្វែងរកបាន និងរួចរាល់សម្រាប់ SEO គ្រប់ locale។",
        ].join("\n\n"),
        zh: [
          `ScoreMatrix 新闻系统使用每日 API 数据来排序值得关注的足球内容。今日数据包含 ${leagueText} 的 ${fixtureCount} 场比赛。`,
          `重点数据包括 ${featuredText}，为 AI Insights 与 Predictions 提供更新鲜的上下文。`,
          "每日文章会按语言保存为 JSON，让新闻页保持快速、可搜索，并支持每个 locale 的 SEO。",
        ].join("\n\n"),
      },
    ),
    image: "/brand/scorematrix-logo.png",
    author: "ScoreMatrix Data Desk",
    category: "feature",
    publishedAt: new Date().toISOString(),
    tags: ["API", "Fixtures", ...leagues],
    readTime: 3,
  };
}

async function generateArticles(fixtures: ApiFootballFixture[]): Promise<GeneratedArticle[]> {
  const articles: GeneratedArticle[] = [];
  const finished = fixtures.filter(f => f.status === MatchStatus.FINISHED && hasScore(f));

  if (finished.length > 0) {
    const best = finished.reduce((a, b) => {
      const ag = (a.score.home ?? 0) + (a.score.away ?? 0);
      const bg = (b.score.home ?? 0) + (b.score.away ?? 0);
      return ag >= bg ? a : b;
    });
    articles.push(matchResultArticle(best));
  }

  const preview = previewArticle(fixtures);
  if (preview && articles.length < 3) articles.push(preview);

  if (articles.length < 2) articles.push(dailyRoundupArticle(fixtures));
  if (articles.length < 3) articles.push(tipsArticle());

  return articles.slice(0, 3);
}

function articleForLocale(a: GeneratedArticle, locale: string): NewsArticle {
  // Keep the full i18n records available on the object so we can render any locale
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    summary: a.summary,
    content: a.content,
    image: a.image,
    author: a.author,
    category: a.category,
    publishedAt: a.publishedAt,
    tags: a.tags,
    readTime: a.readTime,
  } as NewsArticle;
}

async function saveArticlesToJson(date: string, articles: GeneratedArticle[]): Promise<void> {
  for (const locale of defaultLocales) {
    const dir = path.join(NEWS_DATA_DIR, date);
    await fs.mkdir(dir, { recursive: true });

    const simplified = articles.map(a => ({
      id: a.id,
      slug: a.slug,
      title: (a.title[locale] ?? a.title.en ?? "") as string,
      summary: (a.summary[locale] ?? a.summary.en ?? "") as string,
      content: (a.content[locale] ?? a.content.en ?? "") as string,
      image: a.image,
      author: a.author,
      category: a.category,
      publishedAt: a.publishedAt,
      tags: a.tags,
      readTime: a.readTime,
    }));

    const file = path.join(dir, `${locale}.json`);
    await fs.writeFile(file, JSON.stringify(simplified, null, 2), "utf-8");
  }
}

export interface NewsListResult {
  articles: NewsArticle[];
  generatedAt: string;
  source: "json" | "generated" | "fallback";
}

export async function getTodayArticles(locale: string): Promise<NewsListResult> {
  const today = todayStr();
  const safeLocale = normalizeLocale(locale);

  // Try reading cached JSON
  try {
    const file = path.join(NEWS_DATA_DIR, today, `${safeLocale}.json`);
    const raw = await fs.readFile(file, "utf-8");
    const articles = JSON.parse(raw) as NewsArticle[];
    if (articles.length > 0) {
      return { articles, generatedAt: today, source: "json" };
    }
  } catch { /* not cached yet */ }

  // Generate from API
  try {
    const fixtures = await loadFixturesForDate(50).catch(() => getMockApiFootballFixtures(50));
    const generated = await generateArticles(fixtures);

    if (generated.length > 0) {
      await saveArticlesToJson(today, generated);
    }

    const articles = generated.map(a => articleForLocale(a, safeLocale));
    return { articles, generatedAt: today, source: "generated" };
  } catch {
    return { articles: [], generatedAt: today, source: "fallback" };
  }
}

export async function getArticleBySlug(slug: string, locale: string): Promise<NewsArticle | null> {
  const today = todayStr();
  const safeLocale = normalizeLocale(locale);

  const { articles } = await getTodayArticles(safeLocale);
  const found = articles.find(a => a.slug === slug);
  if (found) return found;

  // Search past days
  try {
    const entries = await fs.readdir(NEWS_DATA_DIR, { withFileTypes: true });
    const dateDirs = entries.filter(e => e.isDirectory()).map(e => e.name).sort().reverse();

    for (const dateDir of dateDirs) {
      if (dateDir === today) continue;
      const file = path.join(NEWS_DATA_DIR, dateDir, `${safeLocale}.json`);
      try {
        const raw = await fs.readFile(file, "utf-8");
        const pastArticles = JSON.parse(raw) as NewsArticle[];
        const match = pastArticles.find(a => a.slug === slug);
        if (match) return match;
      } catch { /* skip */ }
    }
  } catch { /* no dir */ }

  return null;
}

export async function searchArticles(query: string, locale: string): Promise<NewsArticle[]> {
  const lower = query.toLowerCase();
  const safeLocale = normalizeLocale(locale);
  const all: NewsArticle[] = [];
  const seen = new Set<string>();

  // Today's articles first
  try {
    const { articles } = await getTodayArticles(safeLocale);
    for (const a of articles) {
      if (!seen.has(a.id)) { seen.add(a.id); all.push(a); }
    }
  } catch { /* skip */ }

  // Past days
  try {
    const entries = await fs.readdir(NEWS_DATA_DIR, { withFileTypes: true });
    for (const entry of entries.filter(e => e.isDirectory()).map(e => e.name).sort().reverse()) {
      const file = path.join(NEWS_DATA_DIR, entry, `${safeLocale}.json`);
      try {
        const raw = await fs.readFile(file, "utf-8");
        const past = JSON.parse(raw) as NewsArticle[];
        for (const a of past) {
          if (!seen.has(a.id)) { seen.add(a.id); all.push(a); }
        }
      } catch { /* skip */ }
    }
  } catch { /* skip */ }

  return all.filter(a => {
    const title = typeof a.title === "string" ? a.title : (a.title[safeLocale] ?? a.title.en ?? "");
    const summary = typeof a.summary === "string" ? a.summary : (a.summary[safeLocale] ?? a.summary.en ?? "");
    const content = typeof a.content === "string" ? a.content : (a.content[safeLocale] ?? a.content.en ?? "");
    const tags = a.tags.join(" ").toLowerCase();
    return (
      title.toLowerCase().includes(lower) ||
      summary.toLowerCase().includes(lower) ||
      content.toLowerCase().includes(lower) ||
      tags.includes(lower)
    );
  });
}

export async function getAllNewsStaticParams(): Promise<Array<{ locale: string; slug: string }>> {
  const params: Array<{ locale: string; slug: string }> = [];
  const seen = new Set<string>();

  try {
    const entries = await fs.readdir(NEWS_DATA_DIR, { withFileTypes: true });
    const dateDirs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);

    for (const dateDir of dateDirs) {
      for (const locale of defaultLocales) {
        const file = path.join(NEWS_DATA_DIR, dateDir, `${locale}.json`);
        try {
          const raw = await fs.readFile(file, "utf-8");
          const articles = JSON.parse(raw) as NewsArticle[];
          for (const article of articles) {
            const key = `${locale}:${article.slug}`;
            if (!seen.has(key)) {
              seen.add(key);
              params.push({ locale, slug: article.slug });
            }
          }
        } catch { /* skip missing locale files */ }
      }
    }
  } catch { /* no news directory yet */ }

  return params;
}

export async function regenerateTodayNews(): Promise<{ success: boolean; count: number }> {
  const today = todayStr();
  try {
    const fixtures = await loadFixturesForDate(50).catch(() => getMockApiFootballFixtures(50));
    const generated = await generateArticles(fixtures);
    await saveArticlesToJson(today, generated);
    return { success: true, count: generated.length };
  } catch {
    return { success: false, count: 0 };
  }
}
