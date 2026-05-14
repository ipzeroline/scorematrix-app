import type { LocaleCode } from "@/i18n";

export type LeaderboardPageCopy = {
  title: string;
  subtitle: string;
  notice: string;
  periods: {
    daily: string;
    weekly: string;
    seasonal: string;
  };
  stats: {
    rankedPlayers: string;
    topScore: string;
    averageAccuracy: string;
    activeStreaks: string;
  };
  labels: {
    rank: string;
    player: string;
    level: string;
    points: string;
    accuracy: string;
    streak: string;
    you: string;
    currentPosition: string;
    topThree: string;
    leaderboard: string;
    rewardsHint: string;
    climbTarget: string;
    pointsBehind: string;
    nextRank: string;
    bestStreak: string;
    entries: string;
  };
  empty: {
    title: string;
    description: string;
  };
  guide: Array<{
    title: string;
    description: string;
  }>;
};

const leaderboardCopy: Record<LocaleCode, LeaderboardPageCopy> = {
  th: {
    title: "ตารางอันดับ",
    subtitle:
      "ติดตามอันดับผู้เล่นจากคะแนนทายผล ความแม่นยำ สตรีค และเลเวล แยกตามรายวัน รายสัปดาห์ และฤดูกาล",
    notice: "อันดับใช้เพื่อการแข่งขันในแพลตฟอร์ม แต้มไม่มีมูลค่าเป็นเงินสดและถอนไม่ได้",
    periods: { daily: "รายวัน", weekly: "รายสัปดาห์", seasonal: "ฤดูกาล" },
    stats: {
      rankedPlayers: "ผู้เล่นในอันดับ",
      topScore: "คะแนนสูงสุด",
      averageAccuracy: "ความแม่นยำเฉลี่ย",
      activeStreaks: "สตรีคที่ยังร้อนแรง",
    },
    labels: {
      rank: "อันดับ",
      player: "ผู้เล่น",
      level: "เลเวล",
      points: "คะแนน",
      accuracy: "ความแม่นยำ",
      streak: "สตรีค",
      you: "คุณ",
      currentPosition: "ตำแหน่งของคุณ",
      topThree: "สามอันดับแรก",
      leaderboard: "อันดับทั้งหมด",
      rewardsHint: "รักษาอันดับเพื่อปลดล็อกภารกิจและรางวัลที่เกี่ยวข้อง",
      climbTarget: "เป้าหมายถัดไป",
      pointsBehind: "คะแนนตามหลัง",
      nextRank: "อันดับถัดไป",
      bestStreak: "สตรีคสูงสุด",
      entries: "รายการ",
    },
    empty: {
      title: "ยังไม่มีข้อมูลอันดับ",
      description: "ลองเลือกช่วงเวลาอื่นเพื่อดูอันดับ",
    },
    guide: [
      { title: "คะแนนมาก่อน", description: "ทายผลถูกและทำภารกิจสำเร็จเพื่อเพิ่มคะแนนรวมในแต่ละช่วงเวลา" },
      { title: "ความแม่นยำช่วยแยกอันดับ", description: "เมื่อคะแนนใกล้เคียง ความแม่นยำและสตรีคจะช่วยให้เห็นฟอร์มของผู้เล่น" },
      { title: "รีเซ็ตตามช่วงเวลา", description: "รายวันและรายสัปดาห์ช่วยให้ผู้เล่นใหม่มีโอกาสไต่ขึ้นอันดับได้เสมอ" },
    ],
  },
  en: {
    title: "Leaderboard",
    subtitle:
      "Track players by prediction points, accuracy, streaks, and levels across daily, weekly, and seasonal periods.",
    notice: "Rankings are for platform competition only. Points have no cash value and cannot be withdrawn.",
    periods: { daily: "Daily", weekly: "Weekly", seasonal: "Seasonal" },
    stats: {
      rankedPlayers: "Ranked players",
      topScore: "Top score",
      averageAccuracy: "Average accuracy",
      activeStreaks: "Active streaks",
    },
    labels: {
      rank: "Rank",
      player: "Player",
      level: "Level",
      points: "Points",
      accuracy: "Accuracy",
      streak: "Streak",
      you: "You",
      currentPosition: "Your Position",
      topThree: "Top Three",
      leaderboard: "Full Ranking",
      rewardsHint: "Keep your rank to unlock related missions and rewards.",
      climbTarget: "Next target",
      pointsBehind: "points behind",
      nextRank: "Next rank",
      bestStreak: "Best streak",
      entries: "entries",
    },
    empty: {
      title: "No ranking data yet",
      description: "Try another period to view standings.",
    },
    guide: [
      { title: "Points come first", description: "Correct predictions and completed missions increase your score for each period." },
      { title: "Accuracy shows form", description: "When scores are close, accuracy and streaks reveal who is performing best." },
      { title: "Periods refresh", description: "Daily and weekly boards keep the competition open for new climbers." },
    ],
  },
  lo: {
    title: "ຕາຕະລາງອັນດັບ",
    subtitle: "ຕິດຕາມອັນດັບຈາກຄະແນນທາຍຜົນ ຄວາມແມ່ນຍໍາ ສະຕຣີກ ແລະເລເວວ ແຍກຕາມມື້ ອາທິດ ແລະລະດູການ",
    notice: "ອັນດັບໃຊ້ເພື່ອການແຂ່ງຂັນໃນແພລດຟອມ ຄະແນນບໍ່ມີມູນຄ່າເປັນເງິນສົດ ແລະຖອນບໍ່ໄດ້",
    periods: { daily: "ລາຍມື້", weekly: "ລາຍອາທິດ", seasonal: "ລະດູການ" },
    stats: { rankedPlayers: "ຜູ້ຫຼິ້ນໃນອັນດັບ", topScore: "ຄະແນນສູງສຸດ", averageAccuracy: "ຄວາມແມ່ນຍໍາສະເລ່ຍ", activeStreaks: "ສະຕຣີກກໍາລັງດີ" },
    labels: {
      rank: "ອັນດັບ",
      player: "ຜູ້ຫຼິ້ນ",
      level: "ເລເວວ",
      points: "ຄະແນນ",
      accuracy: "ຄວາມແມ່ນຍໍາ",
      streak: "ສະຕຣີກ",
      you: "ທ່ານ",
      currentPosition: "ຕໍາແໜ່ງຂອງທ່ານ",
      topThree: "ສາມອັນດັບແລກ",
      leaderboard: "ອັນດັບທັງໝົດ",
      rewardsHint: "ຮັກສາອັນດັບເພື່ອປົດລັອກພາລະກິດແລະລາງວັນ",
      climbTarget: "ເປົ້າໝາຍຕໍ່ໄປ",
      pointsBehind: "ຄະແນນຕາມຫຼັງ",
      nextRank: "ອັນດັບຕໍ່ໄປ",
      bestStreak: "ສະຕຣີກດີສຸດ",
      entries: "ລາຍການ",
    },
    empty: { title: "ຍັງບໍ່ມີຂໍ້ມູນອັນດັບ", description: "ລອງເລືອກຊ່ວງເວລາອື່ນ" },
    guide: [
      { title: "ຄະແນນສໍາຄັນກ່ອນ", description: "ທາຍຖືກແລະເຮັດພາລະກິດສໍາເລັດເພື່ອເພີ່ມຄະແນນ" },
      { title: "ຄວາມແມ່ນຍໍາສະແດງຟອມ", description: "ເມື່ອຄະແນນໃກ້ກັນ ຄວາມແມ່ນຍໍາແລະສະຕຣີກຊ່ວຍແຍກຟອມ" },
      { title: "ຣີເຊັດຕາມຊ່ວງເວລາ", description: "ລາຍມື້ແລະລາຍອາທິດໃຫ້ຜູ້ຫຼິ້ນໃໝ່ມີໂອກາດ" },
    ],
  },
  my: {
    title: "အဆင့်ဇယား",
    subtitle: "ခန့်မှန်းအမှတ်၊ တိကျမှု၊ streak နှင့် level များဖြင့် နေ့စဉ်၊ အပတ်စဉ်၊ ရာသီအလိုက် အဆင့်များကိုကြည့်ပါ။",
    notice: "အဆင့်ဇယားသည် ပလက်ဖောင်းအတွင်းယှဉ်ပြိုင်မှုအတွက်သာဖြစ်ပြီး အမှတ်များကို ငွေသားအဖြစ်ထုတ်ယူ၍မရပါ။",
    periods: { daily: "နေ့စဉ်", weekly: "အပတ်စဉ်", seasonal: "ရာသီ" },
    stats: { rankedPlayers: "အဆင့်ဝင်ကစားသမား", topScore: "အမြင့်ဆုံးအမှတ်", averageAccuracy: "ပျမ်းမျှတိကျမှု", activeStreaks: "လက်ရှိ streak" },
    labels: {
      rank: "အဆင့်",
      player: "ကစားသမား",
      level: "လယ်ဗယ်",
      points: "အမှတ်",
      accuracy: "တိကျမှု",
      streak: "စထရိ",
      you: "သင်",
      currentPosition: "သင့်အဆင့်",
      topThree: "ထိပ်ဆုံး ၃ ဦး",
      leaderboard: "အဆင့်အားလုံး",
      rewardsHint: "ဆက်စပ် mission နှင့် reward များဖွင့်ရန် အဆင့်ကိုထိန်းပါ။",
      climbTarget: "နောက်ထပ်ပစ်မှတ်",
      pointsBehind: "အမှတ်နောက်ကျ",
      nextRank: "နောက်အဆင့်",
      bestStreak: "အကောင်းဆုံး streak",
      entries: "စာရင်း",
    },
    empty: { title: "အဆင့်ဒေတာမရှိသေးပါ", description: "အခြားကာလကိုရွေးပြီးကြည့်ပါ။" },
    guide: [
      { title: "အမှတ်သည်အရေးကြီးဆုံး", description: "ခန့်မှန်းမှန်ခြင်းနှင့် mission ပြီးခြင်းက ကာလအလိုက်အမှတ်တိုးစေသည်။" },
      { title: "တိကျမှုကဖောင်မ်ကိုပြသည်", description: "အမှတ်နီးစပ်လျှင် တိကျမှုနှင့် streak ကကောင်းမွန်မှုကိုပြသည်။" },
      { title: "ကာလအလိုက်ပြန်စ", description: "နေ့စဉ်နှင့်အပတ်စဉ်ဇယားများက ကစားသမားအသစ်များအတွက်အခွင့်အရေးပေးသည်။" },
    ],
  },
  km: {
    title: "តារាងចំណាត់ថ្នាក់",
    subtitle: "តាមដានអ្នកលេងតាមពិន្ទុទស្សន៍ទាយ ភាពត្រឹមត្រូវ streak និងកម្រិត សម្រាប់ប្រចាំថ្ងៃ ប្រចាំសប្តាហ៍ និងរដូវកាល។",
    notice: "ចំណាត់ថ្នាក់ប្រើសម្រាប់ការប្រកួតក្នុងវេទិកាប៉ុណ្ណោះ។ ពិន្ទុមិនមានតម្លៃជាសាច់ប្រាក់ ហើយមិនអាចដកបានទេ។",
    periods: { daily: "ប្រចាំថ្ងៃ", weekly: "ប្រចាំសប្តាហ៍", seasonal: "រដូវកាល" },
    stats: { rankedPlayers: "អ្នកលេងក្នុងតារាង", topScore: "ពិន្ទុខ្ពស់បំផុត", averageAccuracy: "ភាពត្រឹមត្រូវមធ្យម", activeStreaks: "streak សកម្ម" },
    labels: {
      rank: "ចំណាត់ថ្នាក់",
      player: "អ្នកលេង",
      level: "កម្រិត",
      points: "ពិន្ទុ",
      accuracy: "ភាពត្រឹមត្រូវ",
      streak: "streak",
      you: "អ្នក",
      currentPosition: "ទីតាំងរបស់អ្នក",
      topThree: "កំពូល ៣",
      leaderboard: "ចំណាត់ថ្នាក់ទាំងអស់",
      rewardsHint: "រក្សាចំណាត់ថ្នាក់ដើម្បីបើក mission និងរង្វាន់ពាក់ព័ន្ធ។",
      climbTarget: "គោលដៅបន្ទាប់",
      pointsBehind: "ពិន្ទុខ្វះ",
      nextRank: "ចំណាត់ថ្នាក់បន្ទាប់",
      bestStreak: "streak ល្អបំផុត",
      entries: "ធាតុ",
    },
    empty: { title: "មិនទាន់មានទិន្នន័យ", description: "សូមជ្រើសរើសរយៈពេលផ្សេងទៀត។" },
    guide: [
      { title: "ពិន្ទុមកមុន", description: "ទស្សន៍ទាយត្រឹមត្រូវ និងបញ្ចប់ mission ដើម្បីបង្កើនពិន្ទុ។" },
      { title: "ភាពត្រឹមត្រូវបង្ហាញទម្រង់", description: "ពេលពិន្ទុជិតគ្នា ភាពត្រឹមត្រូវ និង streak ជួយបង្ហាញអ្នកលេងល្អ។" },
      { title: "ធ្វើថ្មីតាមរយៈពេល", description: "តារាងប្រចាំថ្ងៃ និងសប្តាហ៍ផ្តល់ឱកាសឲ្យអ្នកថ្មីឡើងចំណាត់ថ្នាក់។" },
    ],
  },
  zh: {
    title: "排行榜",
    subtitle: "按预测积分、准确率、连胜和等级查看每日、每周与赛季排名。",
    notice: "排行榜仅用于平台内竞赛。积分没有现金价值，也不能提现。",
    periods: { daily: "每日", weekly: "每周", seasonal: "赛季" },
    stats: { rankedPlayers: "上榜玩家", topScore: "最高积分", averageAccuracy: "平均准确率", activeStreaks: "活跃连胜" },
    labels: {
      rank: "排名",
      player: "玩家",
      level: "等级",
      points: "积分",
      accuracy: "准确率",
      streak: "连胜",
      you: "你",
      currentPosition: "你的位置",
      topThree: "前三名",
      leaderboard: "完整排名",
      rewardsHint: "保持排名可解锁相关任务和奖励。",
      climbTarget: "下一个目标",
      pointsBehind: "积分差距",
      nextRank: "下一排名",
      bestStreak: "最佳连胜",
      entries: "条目",
    },
    empty: { title: "暂无排名数据", description: "请选择其他周期查看排名。" },
    guide: [
      { title: "积分优先", description: "预测正确并完成任务，可以提升当前周期积分。" },
      { title: "准确率体现状态", description: "当积分接近时，准确率和连胜能体现玩家表现。" },
      { title: "按周期刷新", description: "每日和每周榜让新玩家也有机会向上攀升。" },
    ],
  },
};

export function getLeaderboardPageCopy(locale: string): LeaderboardPageCopy {
  return leaderboardCopy[(locale as LocaleCode) in leaderboardCopy ? (locale as LocaleCode) : "th"];
}
