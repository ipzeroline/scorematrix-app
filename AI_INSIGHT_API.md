# AI Insight API — Frontend Documentation

Endpoint: `GET /api/v1/soccer/ai-insights/{fixtureId}`

Each response has two top-level keys: `data` (AI prediction) and `fixture` (match metadata).

---

## 1. Top-Level Scores

แสดงคะแนนความมั่นใจและความน่าจะเป็น — ใช้เป็นหัวข้อหลักของหน้าพยากรณ์

| Field | Type | Range | คำอธิบาย | UI Suggestion |
|---|---|---|---|---|
| `confidenceScore` | int | 0–100 | คะแนนความมั่นใจโดยรวมของ AI จาก API-Football percent | วงกลม % |
| `homeWinProbability` | int | 0–100 | โอกาสทีมเหย้าชนะ (จาก API-Football percent) | แท่ง progress bar |
| `drawProbability` | int | 0–100 | โอกาสเสมอ | แท่ง progress bar |
| `awayWinProbability` | int | 0–100 | โอกาสทีมเยือนชนะ | แท่ง progress bar |
| `heatMeter` | int | **0–100** | **100=สูสีมาก, 0=ขาดลอย** | แถบความร้อน (70+ แดง, 40-69 เหลือง, <40 เขียว) |
| `favoriteTeam` | string | home/away | ทีมที่เป็นต่อจาก comparison weighted score | ดาวข้างทีมเต็ง |
| `homeStrength` | int | 0–100 | คะแนนความแข็งแกร่งเจ้าบ้าน | แท่งคู่ |
| `awayStrength` | int | 0–100 | คะแนนความแข็งแกร่งทีมเยือน | แท่งคู่ |
| `strengthGap` | int | 0–100 | ผลต่างความแข็งแกร่ง | heatMeter = 100 - strengthGap |
| `homeAdvantageFactor` | float | 0.0–5.0 | แต้มต่อเจ้าบ้าน | 🏠 x2.41 |

### Strength Score คำนวณจาก comparison (ไม่ใช่ percent)

```
homeStrength = form.home × 0.4 + att.home × 0.3 + def.home × 0.3
awayStrength = form.away × 0.4 + att.away × 0.3 + def.away × 0.3

strengthGap = |homeStrength - awayStrength|
heatMeter   = 100 - strengthGap
```

### ตัวอย่าง

```json
{
  "confidenceScore": 45,
  "homeWinProbability": 45,
  "drawProbability": 45,
  "awayWinProbability": 10,
  "heatMeter": 89,
  "favoriteTeam": "home",
  "homeStrength": 55,
  "awayStrength": 44,
  "strengthGap": 11
}
```

**การตีความ:** percent บอก 45-45-10 (ดูสูสี) แต่ comparison บอกเจ้าบ้านเหนือกว่านิดหน่อย (strengthGap=11, heatMeter=89)

---

## 2. Comparison (เปรียบเทียบ %)

| Field | คำอธิบาย | ใช้ใน |
|---|---|---|
| `comparison.form` | ฟอร์มการเล่น | strengthScore (40%) |
| `comparison.att` | ศักยภาพเกมรุก | strengthScore (30%) |
| `comparison.def` | ความแข็งแกร่งเกมรับ | strengthScore (30%) |
| `comparison.total` | คะแนนรวมทุกมิติจาก API-Football | debug/audit |
| `comparison.poisson_distribution` | การกระจายประตู (Poisson) | อ้างอิง |
| `comparison.h2h` | head-to-head โดยรวม | อ้างอิง |
| `comparison.goals` | สถิติการทำประตู | อ้างอิง |

### UI Pattern: Strength Bar

```
ทีมเหย้า ██████████████████░░░░  55
ทีมเยือน ██████████████░░░░░░░░  44
         ช่องว่าง 11 = strengthGap
```

---

## 3. Form Comparison (ฟอร์มละเอียด)

`formComparison.homeLastFive` และ `formComparison.awayLastFive`

| Field | คำอธิบาย |
|---|---|
| `played` | จำนวนนัดที่ลงเล่น |
| `form` | ฟอร์มรวมเป็น % |
| `att` / `def` | คะแนนเกมรุก/รับ % |
| `goals.for.total` / `goals.for.average` | ประตูที่ยิงได้ |
| `goals.against.total` / `goals.against.average` | ประตูที่เสีย |
| `goals.for.minute.{0-15..106-120}` | ช่วงเวลาที่ยิงประตู |
| `goals.for.under_over.{0.5..4.5}` | สถิติ over/under |
| `cards.yellow` / `.red` | สถิติใบเหลือง/แดงแยกตามช่วงเวลา |
| `biggest.streak` / `.wins` / `.loses` | สถิติชนะ/แพ้สูงสุด |
| `clean_sheet` / `failed_to_score` / `penalty` | สถิติเพิ่มเติม |
| `lineups` | แผนที่ใช้บ่อย `[{formation, played}]` |

### League season stats

`formComparison.homeLastFive.league` — สถิติทั้งฤดูกาล (โครงสร้างเดียวกับด้านบน)

### ฟอร์มล่าสุด (Form String)

`league.form` เช่น `"LLW"` → W=🟢 D=🟡 L=🔴

---

## 4. Head-to-Head

```json
[
  {
    "fixtureId": 123456,
    "date": "2024-01-15",
    "league": { "name": "Friendlies", "season": 2024 },
    "teams": {
      "home": { "name": "Colombia", "winner": true },
      "away": { "name": "Jordan", "winner": false }
    },
    "goals": { "home": 2, "away": 0 },
    "score": { "halftime": "1-0", "fulltime": "2-0" }
  }
]
```

ถ้าไม่เคยเจอกัน → `[]`

---

## 5. Injury Impact

```json
{
  "homeImpact": 0,
  "awayImpact": 0,
  "homeInjuries": [],
  "awayInjuries": []
}
```

---

## 6. Upset Risk / Upset Alert

| Field | Type | คำอธิบาย |
|---|---|---|
| `upsetRisk` | int (0–100) | คะแนนความเสี่ยงพลิกล็อก — **0=ชัวร์, 100=เสี่ยงสูง** |
| `upsetAlert` | bool | `true` เมื่อ `upsetRisk >= 75` |
| `upsetDescription` | string/null | คำอธิบายสั้นๆ |

### สูตร

```
upsetRisk = (100 - strengthGap) × 0.7 + (100 - percentSpread) × 0.3
```

- `strengthGap` จาก comparison weighted score (น้ำหนัก 70%)
- `percentSpread` = max(percent) − min(percent)  (น้ำหนัก 30%)

| ตัวอย่าง | strengthGap | percentSpread | upsetRisk | upsetAlert |
|---|---|---|---|---|
| สูสีมาก | 5 | 0 | 96 | ✅ |
| สูสี | 15 | 35 | 79 | ✅ |
| เหนือกว่า | 30 | 45 | 65 | ❌ |
| ขาดลอย | 70 | 50 | 36 | ❌ |

**UI:** upsetAlert=true → แสดงแบนเนอร์ ⚠️ พร้อม upsetRisk %

---

## 7. Community Sentiment

```json
{
  "homePercentage": 65,
  "drawPercentage": 20,
  "awayPercentage": 15,
  "totalVotes": 1542
}
```

---

## 8. Key Factors

Array ของข้อความสรุป — เอาไปแสดงผลได้เลย

```json
[
  "Combo Double chance : Colombia or draw and +1.5 goals",
  "Goals prediction: +1.5",
  "Form: Home 60% vs Away 40%"
]
```

---

## 9. API-Football Raw

| Field | Type | คำอธิบาย |
|---|---|---|
| `apiAdvice` | string | คำแนะนำการแทง |
| `apiWinner` | object/null | `{id, name, comment}` |
| `apiWinOrDraw` | bool | เต็งชนะหรือเสมอ |
| `apiUnderOver` | string | เช่น `"+1.5"` |
| `apiPredictedGoals` | object/null | `{home, away}` |

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

## 11. List Endpoint

`GET /api/v1/soccer/ai-insights?league=39`

```json
{
  "data": {
    "live": [...],
    "highConfidence": [...],
    "upsetAlert": [...],
    "all": [...]    // flat list sorted by starts_at asc
  }
}
```

- `all` — ทุกรายการเรียงตามเวลาแข่ง (น้อย→มาก)
- `live` / `highConfidence` / `upsetAlert` — แยกกลุ่มตามสถานะ

---

## Status Mapping

| `status.short` | ความหมาย | UI |
|---|---|---|
| `NS` | ยังไม่เริ่ม | แสดงเวลาเริ่ม |
| `1H` | ครึ่งแรก | LIVE ● + นาที |
| `HT` | พักครึ่ง | พักครึ่ง |
| `2H` | ครึ่งหลัง | LIVE ● + นาที |
| `FT` | จบแล้ว | จบการแข่งขัน |
| `PST` | เลื่อน | เลื่อน |
| `TBD` | รอยืนยัน | รอยืนยัน |

## Edge Cases

1. **`headToHead = []`** → "ยังไม่มีสถิติการพบกัน"
2. **`injuryImpact.homeInjuries = []`** → ซ่อนส่วนนี้
3. **`communitySentiment.totalVotes = 0`** → "ยังไม่มีโหวต เป็นคนแรก!"
4. **`upsetAlert: false`** → ไม่แสดงแบนเนอร์
5. **`heatMeter < 40`** → ขาดลอย — สีเขียว
6. **ทุกฟิลด์ที่เป็น `null`** → API ไม่มีข้อมูล → แสดง `-`
7. **`is_live: true`** → รีเฟรช auto ทุก 30-60 วิ
