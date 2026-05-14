import type { LocaleCode } from "@/i18n";

export type LeaguesPageCopy = {
  title: string;
  subtitle: string;
  joinLeague: string;
  createLeague: string;
  stats: {
    activeLeagues: string;
    totalMembers: string;
    averageAccuracy: string;
    openSlots: string;
  };
  sections: {
    myLeagues: string;
    suggested: string;
    howItWorks: string;
  };
  labels: {
    members: string;
    inviteCode: string;
    weeklyLeader: string;
    yourRank: string;
    points: string;
    accuracy: string;
    available: string;
    owner: string;
    member: string;
    copyCode: string;
    copied: string;
    viewBoard: string;
    capacity: string;
    leagueName: string;
    maxMembers: string;
    privacy: string;
    inviteOnly: string;
    publicDiscoverable: string;
    create: string;
    join: string;
    invitePlaceholder: string;
    namePlaceholder: string;
  };
  empty: {
    title: string;
    description: string;
  };
  modal: {
    createTitle: string;
    createDescription: string;
    joinTitle: string;
    joinDescription: string;
  };
  discover: Array<{
    title: string;
    description: string;
    tag: string;
  }>;
  how: Array<{
    title: string;
    description: string;
  }>;
};

const leaguesCopy: Record<LocaleCode, LeaguesPageCopy> = {
  th: {
    title: "ลีกส่วนตัว",
    subtitle:
      "สร้างกลุ่มทายผลกับเพื่อน ทีมงาน หรือคอมมูนิตี้ แล้ววัดอันดับจากคะแนน ความแม่นยำ และสถิติรายสัปดาห์ในที่เดียว",
    joinLeague: "เข้าร่วมลีก",
    createLeague: "สร้างลีก",
    stats: {
      activeLeagues: "ลีกที่เข้าร่วม",
      totalMembers: "สมาชิกทั้งหมด",
      averageAccuracy: "ความแม่นยำเฉลี่ย",
      openSlots: "ที่ว่างรับสมาชิก",
    },
    sections: {
      myLeagues: "ลีกของฉัน",
      suggested: "ไอเดียลีกแนะนำ",
      howItWorks: "วิธีใช้งาน",
    },
    labels: {
      members: "สมาชิก",
      inviteCode: "รหัสเชิญ",
      weeklyLeader: "ผู้นำสัปดาห์นี้",
      yourRank: "อันดับของคุณ",
      points: "คะแนน",
      accuracy: "ความแม่นยำ",
      available: "ว่าง",
      owner: "เจ้าของลีก",
      member: "สมาชิก",
      copyCode: "คัดลอกรหัส",
      copied: "คัดลอกแล้ว",
      viewBoard: "ดูอันดับ",
      capacity: "จำนวนสมาชิก",
      leagueName: "ชื่อลีก",
      maxMembers: "จำนวนสมาชิกสูงสุด",
      privacy: "การเข้าร่วม",
      inviteOnly: "ต้องมีรหัสเชิญ",
      publicDiscoverable: "เปิดให้ค้นหาได้",
      create: "สร้างลีก",
      join: "เข้าร่วม",
      invitePlaceholder: "กรอกรหัสเชิญ เช่น WKND-WAR-2025",
      namePlaceholder: "เช่น ทีมเพื่อนดูบอล",
    },
    empty: {
      title: "ยังไม่มีลีก",
      description: "สร้างลีกใหม่หรือใช้รหัสเชิญเพื่อเริ่มแข่งขันกับเพื่อน",
    },
    modal: {
      createTitle: "สร้างลีกใหม่",
      createDescription:
        "ตั้งชื่อลีก กำหนดจำนวนสมาชิก และแชร์รหัสเชิญให้คนที่ต้องการเข้าร่วม",
      joinTitle: "เข้าร่วมลีก",
      joinDescription:
        "กรอกรหัสเชิญจากเจ้าของลีก ระบบจะเพิ่มลีกนั้นลงในรายการของคุณ",
    },
    discover: [
      {
        title: "กลุ่มบอลโลก 2026",
        description: "เหมาะสำหรับแข่งทายผลตลอดทัวร์นาเมนต์กับเพื่อน",
        tag: "ทัวร์นาเมนต์",
      },
      {
        title: "ลีกออฟฟิศ",
        description: "จัดอันดับรายสัปดาห์สำหรับทีมงานหรือบริษัท",
        tag: "ทีมงาน",
      },
      {
        title: "สายวิเคราะห์",
        description: "เน้นคะแนนจากความแม่นยำและสถิติหลังจบเกม",
        tag: "สถิติ",
      },
    ],
    how: [
      {
        title: "สร้างหรือเข้าร่วม",
        description: "เปิดลีกใหม่หรือใช้รหัสเชิญเพื่อเข้ากลุ่มที่มีอยู่",
      },
      {
        title: "ทายผลตามแมตช์",
        description: "คะแนนจากการทายผลจะถูกนับรวมในอันดับลีกอัตโนมัติ",
      },
      {
        title: "แข่งกันทุกสัปดาห์",
        description: "ติดตามผู้นำ คะแนนสะสม และความแม่นยำของสมาชิก",
      },
    ],
  },
  en: {
    title: "Private Leagues",
    subtitle:
      "Create prediction groups for friends, teams, or communities and compare points, accuracy, and weekly form in one place.",
    joinLeague: "Join League",
    createLeague: "Create League",
    stats: {
      activeLeagues: "Active leagues",
      totalMembers: "Total members",
      averageAccuracy: "Average accuracy",
      openSlots: "Open slots",
    },
    sections: {
      myLeagues: "My Leagues",
      suggested: "Suggested League Ideas",
      howItWorks: "How It Works",
    },
    labels: {
      members: "Members",
      inviteCode: "Invite code",
      weeklyLeader: "Weekly leader",
      yourRank: "Your rank",
      points: "points",
      accuracy: "accuracy",
      available: "available",
      owner: "Owner",
      member: "Member",
      copyCode: "Copy code",
      copied: "Copied",
      viewBoard: "View board",
      capacity: "Capacity",
      leagueName: "League name",
      maxMembers: "Max members",
      privacy: "Privacy",
      inviteOnly: "Invite code required",
      publicDiscoverable: "Publicly discoverable",
      create: "Create league",
      join: "Join league",
      invitePlaceholder: "Enter an invite code, e.g. WKND-WAR-2025",
      namePlaceholder: "e.g. Matchday Crew",
    },
    empty: {
      title: "No leagues yet",
      description: "Create a league or enter an invite code to compete with friends.",
    },
    modal: {
      createTitle: "Create a New League",
      createDescription:
        "Name the league, choose a member limit, and share the invite code with your group.",
      joinTitle: "Join a League",
      joinDescription:
        "Enter the invite code from a league owner and it will appear in your league list.",
    },
    discover: [
      {
        title: "World Cup 2026 Pool",
        description: "Run a tournament-long prediction group with friends.",
        tag: "Tournament",
      },
      {
        title: "Office League",
        description: "Track weekly standings for your workplace or team.",
        tag: "Team",
      },
      {
        title: "Analytics League",
        description: "Reward accuracy, streaks, and post-match stats.",
        tag: "Stats",
      },
    ],
    how: [
      {
        title: "Create or Join",
        description: "Start a new league or use an invite code to join an existing group.",
      },
      {
        title: "Predict Matches",
        description: "Prediction points automatically count toward the league table.",
      },
      {
        title: "Compete Weekly",
        description: "Follow leaders, total points, and member accuracy every week.",
      },
    ],
  },
  lo: {
    title: "ລີກສ່ວນຕົວ",
    subtitle:
      "ສ້າງກຸ່ມທາຍຜົນສໍາລັບໝູ່ເພື່ອນ ທີມ ຫຼືຊຸມຊົນ ແລ້ວປຽບທຽບຄະແນນ ຄວາມແມ່ນຍໍາ ແລະອັນດັບປະຈໍາອາທິດ",
    joinLeague: "ເຂົ້າຮ່ວມລີກ",
    createLeague: "ສ້າງລີກ",
    stats: {
      activeLeagues: "ລີກທີ່ເຂົ້າຮ່ວມ",
      totalMembers: "ສະມາຊິກທັງໝົດ",
      averageAccuracy: "ຄວາມແມ່ນຍໍາສະເລ່ຍ",
      openSlots: "ບ່ອນວ່າງ",
    },
    sections: {
      myLeagues: "ລີກຂອງຂ້ອຍ",
      suggested: "ໄອເດຍລີກແນະນໍາ",
      howItWorks: "ວິທີໃຊ້ງານ",
    },
    labels: {
      members: "ສະມາຊິກ",
      inviteCode: "ລະຫັດເຊີນ",
      weeklyLeader: "ຜູ້ນໍາອາທິດນີ້",
      yourRank: "ອັນດັບຂອງທ່ານ",
      points: "ຄະແນນ",
      accuracy: "ຄວາມແມ່ນຍໍາ",
      available: "ວ່າງ",
      owner: "ເຈົ້າຂອງ",
      member: "ສະມາຊິກ",
      copyCode: "ຄັດລອກລະຫັດ",
      copied: "ຄັດລອກແລ້ວ",
      viewBoard: "ເບິ່ງອັນດັບ",
      capacity: "ຈໍານວນສະມາຊິກ",
      leagueName: "ຊື່ລີກ",
      maxMembers: "ຈໍານວນສູງສຸດ",
      privacy: "ການເຂົ້າຮ່ວມ",
      inviteOnly: "ຕ້ອງມີລະຫັດເຊີນ",
      publicDiscoverable: "ເປີດໃຫ້ຄົ້ນຫາ",
      create: "ສ້າງລີກ",
      join: "ເຂົ້າຮ່ວມ",
      invitePlaceholder: "ໃສ່ລະຫັດເຊີນ ເຊັ່ນ WKND-WAR-2025",
      namePlaceholder: "ເຊັ່ນ ກຸ່ມເພື່ອນບານເຕະ",
    },
    empty: {
      title: "ຍັງບໍ່ມີລີກ",
      description: "ສ້າງລີກໃໝ່ ຫຼືໃຊ້ລະຫັດເຊີນເພື່ອແຂ່ງກັບໝູ່",
    },
    modal: {
      createTitle: "ສ້າງລີກໃໝ່",
      createDescription: "ຕັ້ງຊື່ລີກ ກໍານົດຈໍານວນສະມາຊິກ ແລະແບ່ງປັນລະຫັດເຊີນ",
      joinTitle: "ເຂົ້າຮ່ວມລີກ",
      joinDescription: "ໃສ່ລະຫັດເຊີນຈາກເຈົ້າຂອງລີກ",
    },
    discover: [
      { title: "ກຸ່ມ World Cup 2026", description: "ແຂ່ງທາຍຜົນຕະຫຼອດທົວນາເມນຕ໌", tag: "ທົວນາເມນຕ໌" },
      { title: "ລີກຫ້ອງການ", description: "ຈັດອັນດັບປະຈໍາອາທິດສໍາລັບທີມງານ", tag: "ທີມ" },
      { title: "ລີກສະຖິຕິ", description: "ເນັ້ນຄວາມແມ່ນຍໍາ ແລະຂໍ້ມູນຫຼັງເກມ", tag: "ສະຖິຕິ" },
    ],
    how: [
      { title: "ສ້າງຫຼືເຂົ້າຮ່ວມ", description: "ເປີດລີກໃໝ່ ຫຼືໃຊ້ລະຫັດເຊີນ" },
      { title: "ທາຍຜົນແມຕຊ໌", description: "ຄະແນນຈະເຂົ້າຕາຕະລາງລີກອັດຕະໂນມັດ" },
      { title: "ແຂ່ງທຸກອາທິດ", description: "ຕິດຕາມຜູ້ນໍາ ຄະແນນ ແລະຄວາມແມ່ນຍໍາ" },
    ],
  },
  my: {
    title: "ကိုယ်ပိုင်လိဂ်များ",
    subtitle:
      "မိတ်ဆွေ၊ အဖွဲ့ သို့မဟုတ် ကွန်မြူနิตี้အတွက် ခန့်မှန်းပွဲအုပ်စုများ ဖန်တီးပြီး အမှတ်၊ တိကျမှုနှင့် အပတ်စဉ်အဆင့်များကို တစ်နေရာတည်းတွင် နှိုင်းယှဉ်ပါ။",
    joinLeague: "လိဂ်ဝင်ရန်",
    createLeague: "လိဂ်ဖန်တီးရန်",
    stats: {
      activeLeagues: "ပါဝင်ထားသောလိဂ်",
      totalMembers: "စုစုပေါင်းအသင်းဝင်",
      averageAccuracy: "ပျမ်းမျှတိကျမှု",
      openSlots: "နေရာလွတ်",
    },
    sections: {
      myLeagues: "ကျွန်ုပ်၏လိဂ်များ",
      suggested: "အကြံပြုလိဂ်စိတ်ကူးများ",
      howItWorks: "အသုံးပြုပုံ",
    },
    labels: {
      members: "အသင်းဝင်",
      inviteCode: "ဖိတ်ကြားကုဒ်",
      weeklyLeader: "ဒီအပတ်ဦးဆောင်သူ",
      yourRank: "သင့်အဆင့်",
      points: "အမှတ်",
      accuracy: "တိကျမှု",
      available: "လွတ်နေ",
      owner: "ပိုင်ရှင်",
      member: "အသင်းဝင်",
      copyCode: "ကုဒ်ကူးရန်",
      copied: "ကူးပြီး",
      viewBoard: "အဆင့်ကြည့်ရန်",
      capacity: "အသင်းဝင်အရေအတွက်",
      leagueName: "လိဂ်အမည်",
      maxMembers: "အများဆုံးအသင်းဝင်",
      privacy: "ဝင်ရောက်မှု",
      inviteOnly: "ဖိတ်ကြားကုဒ်လိုအပ်သည်",
      publicDiscoverable: "ရှာဖွေနိုင်အောင်ဖွင့်ရန်",
      create: "လိဂ်ဖန်တီးရန်",
      join: "ဝင်ရန်",
      invitePlaceholder: "ဖိတ်ကြားကုဒ်ထည့်ပါ ဥပမာ WKND-WAR-2025",
      namePlaceholder: "ဥပမာ ဘောလုံးမိတ်ဆွေများ",
    },
    empty: {
      title: "လိဂ်မရှိသေးပါ",
      description: "လိဂ်ဖန်တီးပါ သို့မဟုတ် ဖိတ်ကြားကုဒ်ဖြင့် မိတ်ဆွေများနှင့်ယှဉ်ပြိုင်ပါ။",
    },
    modal: {
      createTitle: "လိဂ်အသစ်ဖန်တီးရန်",
      createDescription: "လိဂ်အမည်၊ အသင်းဝင်ကန့်သတ်ချက်နှင့် ဖိတ်ကြားကုဒ်မျှဝေမှုကို စီစဉ်ပါ။",
      joinTitle: "လိဂ်ဝင်ရန်",
      joinDescription: "လိဂ်ပိုင်ရှင်ထံမှရထားသော ဖိတ်ကြားကုဒ်ကို ထည့်ပါ။",
    },
    discover: [
      { title: "World Cup 2026 အုပ်စု", description: "ပြိုင်ပွဲတစ်လျှောက် မိတ်ဆွေများနှင့် ခန့်မှန်းယှဉ်ပြိုင်ရန်", tag: "ပြိုင်ပွဲ" },
      { title: "ရုံးအဖွဲ့လိဂ်", description: "အဖွဲ့အတွက် အပတ်စဉ်အဆင့်များကို စောင့်ကြည့်ရန်", tag: "အဖွဲ့" },
      { title: "ဒေတာလိဂ်", description: "တိကျမှု၊ streak နှင့် ပွဲပြီးသည့်စถิติများကို အလေးထားရန်", tag: "စတက်" },
    ],
    how: [
      { title: "ဖန်တီးပါ သို့မဟုတ် ဝင်ပါ", description: "လိဂ်အသစ်စပါ သို့မဟုတ် ဖိတ်ကြားကုဒ်ဖြင့် ဝင်ပါ။" },
      { title: "ပွဲများခန့်မှန်းပါ", description: "ခန့်မှန်းအမှတ်များကို လိဂ်ဇယားထဲ အလိုအလျောက်တွက်ပါသည်။" },
      { title: "အပတ်စဉ်ယှဉ်ပြိုင်ပါ", description: "ဦးဆောင်သူ၊ စုစုပေါင်းအမှတ်နှင့် တိကျမှုကို စောင့်ကြည့်ပါ။" },
    ],
  },
  km: {
    title: "លីគឯកជន",
    subtitle:
      "បង្កើតក្រុមទស្សន៍ទាយសម្រាប់មិត្តភក្តិ ក្រុមការងារ ឬសហគមន៍ ហើយប្រៀបធៀបពិន្ទុ ភាពត្រឹមត្រូវ និងចំណាត់ថ្នាក់ប្រចាំសប្តាហ៍។",
    joinLeague: "ចូលរួមលីគ",
    createLeague: "បង្កើតលីគ",
    stats: {
      activeLeagues: "លីគសកម្ម",
      totalMembers: "សមាជិកសរុប",
      averageAccuracy: "ភាពត្រឹមត្រូវមធ្យម",
      openSlots: "កន្លែងនៅទំនេរ",
    },
    sections: {
      myLeagues: "លីគរបស់ខ្ញុំ",
      suggested: "គំនិតលីគណែនាំ",
      howItWorks: "របៀបប្រើ",
    },
    labels: {
      members: "សមាជិក",
      inviteCode: "លេខកូដអញ្ជើញ",
      weeklyLeader: "អ្នកនាំមុខសប្តាហ៍នេះ",
      yourRank: "ចំណាត់ថ្នាក់អ្នក",
      points: "ពិន្ទុ",
      accuracy: "ភាពត្រឹមត្រូវ",
      available: "ទំនេរ",
      owner: "ម្ចាស់",
      member: "សមាជិក",
      copyCode: "ចម្លងកូដ",
      copied: "បានចម្លង",
      viewBoard: "មើលតារាង",
      capacity: "ចំនួនសមាជិក",
      leagueName: "ឈ្មោះលីគ",
      maxMembers: "សមាជិកអតិបរមា",
      privacy: "ការចូលរួម",
      inviteOnly: "ត្រូវការកូដអញ្ជើញ",
      publicDiscoverable: "អាចស្វែងរកជាសាធារណៈ",
      create: "បង្កើតលីគ",
      join: "ចូលរួម",
      invitePlaceholder: "បញ្ចូលកូដអញ្ជើញ ឧ. WKND-WAR-2025",
      namePlaceholder: "ឧ. ក្រុមមិត្តបាល់ទាត់",
    },
    empty: {
      title: "មិនទាន់មានលីគ",
      description: "បង្កើតលីគ ឬប្រើកូដអញ្ជើញដើម្បីប្រកួតជាមួយមិត្តភក្តិ។",
    },
    modal: {
      createTitle: "បង្កើតលីគថ្មី",
      createDescription: "ដាក់ឈ្មោះលីគ កំណត់ចំនួនសមាជិក និងចែករំលែកកូដអញ្ជើញ។",
      joinTitle: "ចូលរួមលីគ",
      joinDescription: "បញ្ចូលកូដអញ្ជើញពីម្ចាស់លីគ។",
    },
    discover: [
      { title: "ក្រុម World Cup 2026", description: "ប្រកួតទស្សន៍ទាយពេញមួយទួរណាម៉ង់ជាមួយមិត្តភក្តិ", tag: "ទួរណាម៉ង់" },
      { title: "លីគការិយាល័យ", description: "តាមដានចំណាត់ថ្នាក់ប្រចាំសប្តាហ៍សម្រាប់ក្រុមការងារ", tag: "ក្រុម" },
      { title: "លីគវិភាគ", description: "ផ្តោតលើភាពត្រឹមត្រូវ និងស្ថិតិបន្ទាប់ពីការប្រកួត", tag: "ស្ថិតិ" },
    ],
    how: [
      { title: "បង្កើត ឬចូលរួម", description: "ចាប់ផ្តើមលីគថ្មី ឬប្រើកូដអញ្ជើញដើម្បីចូលរួម។" },
      { title: "ទស្សន៍ទាយការប្រកួត", description: "ពិន្ទុទស្សន៍ទាយនឹងបញ្ចូលក្នុងតារាងលីគដោយស្វ័យប្រវត្តិ។" },
      { title: "ប្រកួតរៀងរាល់សប្តាហ៍", description: "តាមដានអ្នកនាំមុខ ពិន្ទុសរុប និងភាពត្រឹមត្រូវ។" },
    ],
  },
  zh: {
    title: "私人联赛",
    subtitle:
      "为朋友、团队或社区创建预测小组，在同一页面比较积分、准确率和每周排名。",
    joinLeague: "加入联赛",
    createLeague: "创建联赛",
    stats: {
      activeLeagues: "已加入联赛",
      totalMembers: "总成员",
      averageAccuracy: "平均准确率",
      openSlots: "可加入名额",
    },
    sections: {
      myLeagues: "我的联赛",
      suggested: "推荐联赛创意",
      howItWorks: "使用方式",
    },
    labels: {
      members: "成员",
      inviteCode: "邀请码",
      weeklyLeader: "本周领先者",
      yourRank: "你的排名",
      points: "积分",
      accuracy: "准确率",
      available: "可加入",
      owner: "创建者",
      member: "成员",
      copyCode: "复制代码",
      copied: "已复制",
      viewBoard: "查看榜单",
      capacity: "容量",
      leagueName: "联赛名称",
      maxMembers: "最多成员",
      privacy: "加入方式",
      inviteOnly: "需要邀请码",
      publicDiscoverable: "允许公开发现",
      create: "创建联赛",
      join: "加入联赛",
      invitePlaceholder: "输入邀请码，例如 WKND-WAR-2025",
      namePlaceholder: "例如 比赛日好友群",
    },
    empty: {
      title: "还没有联赛",
      description: "创建联赛或输入邀请码，与朋友一起竞争。",
    },
    modal: {
      createTitle: "创建新联赛",
      createDescription: "设置联赛名称、成员上限，并把邀请码分享给你的成员。",
      joinTitle: "加入联赛",
      joinDescription: "输入联赛创建者提供的邀请码。",
    },
    discover: [
      { title: "2026 世界杯小组", description: "和朋友进行贯穿整届赛事的预测比拼。", tag: "赛事" },
      { title: "办公室联赛", description: "为团队或公司追踪每周排名。", tag: "团队" },
      { title: "数据分析联赛", description: "强调准确率、连胜和赛后数据。", tag: "数据" },
    ],
    how: [
      { title: "创建或加入", description: "创建新联赛，或使用邀请码加入已有小组。" },
      { title: "预测比赛", description: "预测积分会自动计入联赛排行榜。" },
      { title: "每周竞争", description: "跟踪领先者、总积分和成员准确率。" },
    ],
  },
};

export function getLeaguesPageCopy(locale: string): LeaguesPageCopy {
  return leaguesCopy[(locale as LocaleCode) in leaguesCopy ? (locale as LocaleCode) : "th"];
}
