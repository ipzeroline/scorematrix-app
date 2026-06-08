# AI Insight API — Frontend Documentation

Endpoint: `GET /api/v1/soccer/ai-insights/{fixtureId}`

Each response has two top-level keys: `data` (AI prediction) and `fixture` (match metadata).

---

## 1. Top-Level Scores

แสดงคะแนนความมั่นใจและความน่าจะเป็น — ใช้เป็นหัวข้อหลักของหน้าพยากรณ์

| Field | Type | Value Range | คำอธิบาย | UI Suggestion |
|---|---|---|---|---|
| `confidenceScore` | int | 0–100 | คะแนนความมั่นใจโดยรวมของ AI ยิ่งสูงยิ่งมั่นใจ | วงกลม % ตรงกลาง มีสีตามระดับ (>70 เขียว, 50-70 เหลือง, <50 แดง) |
| `homeWinProbability` | int | 0–100 | โอกาสทีมเหย้าชนะ | แท่ง progress bar แนวนอน |
| `drawProbability` | int | 0–100 | โอกาสเสมอ | แท่ง progress bar แนวนอน |
| `awayWinProbability` | int | 0–100 | โอกาสทีมเยือนชนะ | แท่ง progress bar แนวนอน |
| `heatMeter` | float | 0.0–10.0 | ระดับความดุเดือด/สูสีของคู่นี้ — ยิ่งสูงยิ่งสูสี | แถบความร้อน (Low 0-3 → เขียว, Mid 3-6 → เหลือง, High 6-10 → แดง) |
| `homeAdvantageFactor` | float | 0.0–5.0 | แต้มต่อเจ้าบ้าน คำนวณจากฟอร์ม + เสียงเชียร์ในสนาม | แสดงเป็นไอคอนบ้าน ⬆️ x2.41 |

### ตัวอย่าง
```json
{
  "confidenceScore": 45,
  "homeWinProbability": 45,
  "drawProbability": 45,
  "awayWinProbability": 10,
  "heatMeter": 10,
  "homeAdvantageFactor": 2.41
}
```

**การตีความ:** เกมนี้ Colombia มีโอกาสชนะ 45% เสมอ 45% Jordan ชนะ 10% — สูสีมาก (heatMeter=10 เต็ม) — AI มั่นใจต่ำ (45/100)

---

## 2. Comparison (เปรียบเทียบ %)

เปรียบเทียบระหว่างทีมเหย้า-เยือนเป็นเปอร์เซ็นต์ ใช้แสดง matchup bar

| Field | คำอธิบาย | UI |
|---|---|---|
| `comparison.form.home` / `.away` | ฟอร์มการเล่น | แถบคู่ H vs A |
| `comparison.att.home` / `.away` | ศักยภาพเกมรุก | แถบคู่ H vs A |
| `comparison.def.home` / `.away` | ความแข็งแกร่งเกมรับ | แถบคู่ H vs A |
| `comparison.poisson_distribution` | การกระจายประตูที่คาดการณ์ (Poisson model) | แถบคู่ H vs A |
| `comparison.h2h` | ผล head-to-head โดยรวม | แถบคู่ H vs A (อาจเป็น 0 ถ้ายังไม่เคยเจอกัน) |
| `comparison.goals` | สถิติการทำประตู | แถบคู่ H vs A |
| `comparison.total` | คะแนนรวมทุกมิติ | แถบคู่ H vs A — **ใช้เป็น summary bar หลัก** |

### UI Pattern: Matchup Bar

```
ทีมเหย้า ████████████░░░░░░░░ ทีมเยือน
         59%          41%
```

---

## 3. Form Comparison (ฟอร์มละเอียด)

`formComparison.homeLastFive` และ `formComparison.awayLastFive` — สถิติย้อนหลัง 5 นัดของแต่ละทีม

| Field | คำอธิบาย |
|---|---|
| `played` | จำนวนนัดที่ลงเล่น |
| `form` | ฟอร์มรวมเป็น % |
| `att` / `def` | คะแนนเกมรุก/รับ % |
| `goals.for.total` / `goals.for.average` | ประตูที่ยิงได้ (รวม/เฉลี่ยต่อนัด) |
| `goals.against.total` / `goals.against.average` | ประตูที่เสีย (รวม/เฉลี่ยต่อนัด) |
| `goals.for.minute.{0-15..106-120}` | ช่วงเวลาที่ยิงประตู — `total`=จำนวนลูก, `percentage`=คิดเป็นกี่% |
| `goals.for.under_over.{0.5..4.5}` | สถิติ over/under — `over`=กี่นัดที่เกิน, `under`=กี่นัดที่ต่ำกว่า |
| `cards.yellow` / `cards.red` | สถิติใบเหลือง/แดง แยกตามช่วงเวลา |
| `biggest.streak` | สถิติชนะ/เสมอ/แพ้ ติดต่อกันมากที่สุด |
| `biggest.wins` / `.loses` | ชนะ/แพ้ สกอร์สูงสุด |
| `biggest.goals` | ยิงได้/เสียมากที่สุดในหนึ่งนัด |
| `clean_sheet` | จำนวนนัดที่ไม่เสียประตู |
| `failed_to_score` | จำนวนนัดที่ยิงไม่ได้ |
| `penalty` | สถิติจุดโทษ |
| `lineups` | แผนที่ใช้บ่อย `[{formation, played}]` |

### `formComparison.homeLastFive.league` — สถิติทั้งฤดูกาล

โครงสร้างเดียวกับ `homeLastFive` ด้านบน แต่เป็นข้อมูลรวมทั้ง season ปัจจุบัน

ตัวอย่าง:
```json
"league": {
  "form": "LLW",          // W=ชนะ, D=เสมอ, L=แพ้ (5 นัดล่าสุด)
  "fixtures": {
    "played": { "home": 3, "away": 0, "total": 3 },
    "wins":    { "home": 1, "away": 0, "total": 1 },
    "draws":   { "home": 0, "away": 0, "total": 0 },
    "loses":   { "home": 2, "away": 0, "total": 2 }
  }
}
```

### ฟอร์มล่าสุด (Form String)

`form` field เช่น `"LLW"` → แสดงเป็นไอคอน 3 ลูก:
- `W` = 🟢 ชนะ
- `D` = 🟡 เสมอ
- `L` = 🔴 แพ้

---

## 4. Head-to-Head

`headToHead` — ประวัติการเจอกันของสองทีมนี้

```json
[
  {
    "fixtureId": 123456,
    "date": "2024-01-15",
    "venue": { "name": "Estadio Metropolitano", "city": "Barranquilla" },
    "league": { "name": "Friendlies", "country": "World", "season": 2024 },
    "teams": {
      "home": { "name": "Colombia", "winner": true },
      "away": { "name": "Jordan", "winner": false }
    },
    "goals": { "home": 2, "away": 0 },
    "score": { "halftime": "1-0", "fulltime": "2-0" }
  }
]
```

ถ้าไม่เคยเจอกัน → `[]` (empty array)

---

## 5. Injury Impact

`injuryImpact` — ผลกระทบจากผู้เล่นบาดเจ็บ

```json
{
  "homeImpact": 0,          // 0=ไม่มีผล, 1-3=ปานกลาง, 4-7=มาก, 8-10=รุนแรง
  "awayImpact": 0,
  "homeInjuries": [],       // รายชื่อผู้บาดเจ็บ
  "awayInjuries": []
}
```

---

## 6. Upset Alert

| Field | คำอธิบาย |
|---|---|
| `upsetAlert` | `true` = มีโอกาสพลิกล็อก |
| `upsetDescription` | คำอธิบายสั้นๆ เช่น _"Low-confidence prediction — home favored at only 45%."_ |

**UI:** แสดงแบนเนอร์สีเหลือง/ส้ม เตือน "_⚠️ โอกาสพลิกล็อก_"

---

## 7. Community Sentiment

`communitySentiment` — เสียงโหวตจากผู้ใช้ Scorm ที่แทงบอลคู่นี้

```json
{
  "homePercentage": 65,
  "drawPercentage": 20,
  "awayPercentage": 15,
  "totalVotes": 1542
}
```

**UI:** โชว์แท่งเปอร์เซ็นต์ 3 แท่ง + จำนวนโหวตทั้งหมด

---

## 8. Key Factors

`keyFactors` — array ของข้อความสรุปจุดสำคัญ สั้นๆ เอาไปแสดงผลได้เลย

```json
[
  "Combo Double chance : Colombia or draw and +1.5 goals",
  "Win or draw",
  "Goals prediction: +1.5",
  "Form: Home 60% vs Away 40%"
]
```

**UI:** ใช้เป็น bullet points หรือแท็ก

---

## 9. API-Football Raw

ข้อมูลดิบจาก API-Football พยากรณ์

| Field | Type | คำอธิบาย |
|---|---|---|
| `apiAdvice` | string | คำแนะนำการแทง เช่น _"Combo Double chance : Colombia or draw and +1.5 goals"_ |
| `apiWinner` | object/null | `{id, name, comment}` — ทีมที่ API ทำนายว่าจะชนะ |
| `apiWinOrDraw` | bool | API คิดว่าทีมเต็งจะชนะหรือเสมอ |
| `apiUnderOver` | string | ทำนาย over/under เช่น `"+1.5"` |
| `apiPredictedGoals` | object/null | `{home, away}` — จำนวนประตูที่คาดการณ์ |

---

## 10. Fixture (Match Metadata)

```json
{
  "provider_id": 1528288,
  "league_id": 10,
  "status": { "short": "1H", "long": "First Half", "elapsed": 13 },
  "goals": { "home": 0, "away": 0 },
  "teams": {
    "home": { "id": 8, "name": "Colombia", "logo": "https://..." },
    "away": { "id": 1548, "name": "Jordan", "logo": "https://..." }
  },
  "starts_at": "2026-06-08T06:00:00+07:00",
  "is_live": true,
  "league": { "id": 10, "name": "Friendlies", "logo": "https://..." }
}
```

---

## UI Layout แนะนำ

```
┌─────────────────────────────────────────┐
│  🏆 Colombia  vs  Jordan 🇯🇴              │
│  Friendlies · เริ่ม 06:00 น. · LIVE ● 13' │
├─────────────────────────────────────────┤
│                                         │
│     ╭───────────╮                        │
│     │    45%    │  Confidence Score      │
│     │  มั่นใจต่ำ  │  ⚠️ โอกาสพลิกล็อก        │
│     ╰───────────╯                        │
│                                         │
│  เหย้าชนะ  45%  █████████░░░░░           │
│  เสมอ     45%  █████████░░░░░           │
│  เยือนชนะ  10%  ███░░░░░░░░░░░           │
│                                         │
│  🔥 Heat Meter: ██████████ 10/10 สูสีสุด │
│  🏠 Home Advantage: 2.41x                │
├─────────────────────────────────────────┤
│  Match-Up Comparison                    │
│  Colombia  59% ████████████░░  41% Jordan│
│  ฟอร์ม     60% ████████████░░  40%        │
│  เกมรุก    50% ██████████░░░░  50%        │
│  เกมรับ    57% ███████████░░░  43%        │
├─────────────────────────────────────────┤
│  📊 Key Factors                         │
│  • Combo Double chance: Colombia or draw │
│  • Goals prediction: +1.5               │
│  • Form: Home 60% vs Away 40%           │
├─────────────────────────────────────────┤
│  👥 Community: 1,542 votes              │
│  Colombia 65% ██████████████░░░░░░       │
│  Draw     20% ████████░░░░░░░░░░░░       │
│  Jordan   15% ██████░░░░░░░░░░░░░░       │
├─────────────────────────────────────────┤
│  📋 ฟอร์มล่าสุด                          │
│  Colombia:  L L W  (1-0-2 ในบ้าน)        │
│  Jordan:    D D L  (0-2-1 นอกบ้าน)       │
│                                         │
│  ⚽ สถิติการยิง                          │
│  Colombia: ยิง 1.7 / เสีย 2.0 ต่อนัด     │
│  Jordan:   ยิง 1.7 / เสีย 2.7 ต่อนัด     │
├─────────────────────────────────────────┤
│  🩹 Injury Impact                       │
│  Colombia: ไม่มีผล | Jordan: ไม่มีผล      │
└─────────────────────────────────────────┘
```

---

## Status Mapping

| `status.short` | ความหมาย | UI |
|---|---|---|
| `NS` | ยังไม่เริ่ม | แสดงเวลาเริ่ม |
| `1H` | ครึ่งแรก | LIVE ● + นาที `elapsed` |
| `HT` | พักครึ่ง | พักครึ่ง |
| `2H` | ครึ่งหลัง | LIVE ● + นาที |
| `ET` | ต่อเวลา | LIVE ● |
| `P` | ดวลจุดโทษ | ยิงจุดโทษ |
| `FT` | จบแล้ว | จบการแข่งขัน |
| `PST` | เลื่อน | เลื่อนการแข่งขัน |
| `TBD` | รอยืนยัน | รอยืนยันเวลา |

## Edge Cases ที่ Frontend ต้อง Handle

1. **`headToHead` = `[]`** — สองทีมนี้ยังไม่เคยเจอกัน → แสดง "ยังไม่มีสถิติการพบกัน"
2. **`injuryImpact.homeInjuries` = `[]`** — ไม่มีข้อมูลผู้บาดเจ็บ → ซ่อนส่วนนี้ หรือแสดง "ไม่มีรายงานผู้บาดเจ็บ"
3. **`communitySentiment.totalVotes` = 0** — ยังไม่มีใครโหวต → แสดง "ยังไม่มีเสียงโหวต เป็นคนแรกที่โหวต!"
4. **`upsetAlert: false`** — ไม่มีโอกาสพลิกล็อก → ไม่ต้องแสดงแบนเนอร์
5. **`confidenceScore < 50`** — ความมั่นใจต่ำ → เปลี่ยนสีเป็นแดง/ส้ม แทนเขียว
6. **ทุกฟิลด์ใน `formLastFive` ที่เป็น `null`** — API-Football ไม่มีข้อมูล → แสดง `-` หรือซ่อน
7. **`apiWinner: null`** — API ไม่ฟันธง → ไม่ต้องแสดง "ทีมเต็ง"
8. **`is_live: true` + `elapsed`** — แสดง LIVE พร้อมนาที, รีเฟรช auto ทุก 30-60 วิ
