# วิเคราะห์ระบบ ScoreMatrix และแผนจัดทำสกิล

วันที่ทบทวน: 2026-06-21

## วัตถุประสงค์

เอกสารนี้ใช้เป็นแหล่งอ้างอิงระยะยาวสำหรับทำความเข้าใจระบบ ScoreMatrix frontend และใช้ตัดสินใจว่าจะเพิ่มสกิลหรือ workflow แบบผู้เชี่ยวชาญเฉพาะทางในจุดใด เพื่อให้การพัฒนาระบบต่อจากนี้เร็วขึ้น ปลอดภัยขึ้น และลดความผิดพลาดซ้ำในงาน routing, API, SEO, UI, auth, football data, localization และระบบสมาชิก

## สรุปภาพรวม

ScoreMatrix เป็นเว็บแอปฟุตบอลหลายภาษา มีฟีเจอร์หลักคือ live score, fixtures, prediction, AI insight, rewards, missions, leaderboard, private leagues, wallet, affiliate, events, profile และ news/analysis

โครงสร้างระบบปัจจุบันแยกชั้นชัดเจน:

1. `src/app` เป็น App Router, route handlers และ page/layout
2. `src/lib` เป็น domain API wrappers, normalizers, backend clients และ utility สำคัญ
3. `src/components` เป็น UI/layout/shared/feature components
4. `src/stores` เป็น Zustand client state
5. `src/data` เป็น mock/static data, SEO content และ page copy บางส่วน
6. `src/messages` เป็นข้อความ localized runtime ของ 6 ภาษา

แนวทางเพิ่มความสามารถใหม่ที่ปลอดภัยที่สุดคือเพิ่ม typed wrapper ใน `src/lib` ก่อน แล้วค่อยเชื่อมกับ route handler หรือ UI ตามความจำเป็น ไม่ควรให้ component เรียก backend ภายนอกหรือ external service โดยตรงถ้าเกี่ยวกับ token, secret, auth, normalization หรือ error contract

## 1. Tech Stack, Framework และ Library หลัก

- Framework: Next.js `16.2.9`, App Router อยู่ใน `src/app`
- React: `19.2.4`
- Language: TypeScript strict mode
- Styling: Tailwind CSS v4 ผ่าน `src/styles/globals.css`
- i18n: `next-intl`
- Client state: Zustand
- Icons: `lucide-react`
- Charts: `recharts`
- Package manager: npm เพราะมี `package-lock.json`
- Scripts สำคัญ: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`
- Path alias: `@/*` ชี้ไปที่ `src/*`

ข้อควรจำ: โปรเจกต์นี้ใช้ Next.js เวอร์ชันใหม่ตามที่ติดตั้งจริง จึงต้องอ่าน docs ใน `node_modules/next/dist/docs/` ก่อนแก้ behavior ที่เกี่ยวกับ App Router, routing, metadata, cache, route handlers, proxy, middleware หรือ Server/Client Component boundary

## 2. Architecture และ Flow การทำงานปัจจุบัน

### Routing และ Locale

- `/` redirect ไป `/th`
- locale routes อยู่ที่ `src/app/[locale]`
- locales ที่รองรับคือ `th`, `en`, `lo`, `my`, `km`, `zh`
- default locale คือ `th`
- locale prefix เป็นแบบ always และปิด locale detection
- public auth routes อยู่ใน `src/app/[locale]/(public)/auth`
- member protected routes อยู่ใน `src/app/[locale]/(member)`
- route group ไม่กระทบ URL จริง
- locale pages ใช้ pattern `params: Promise<{ locale: string }>`

### Layout Flow

`src/app/[locale]/layout.tsx` เป็น locale shell หลัก ทำหน้าที่:

- validate locale
- โหลด messages ผ่าน `next-intl`
- ตั้งค่า request locale
- ครอบด้วย `NextIntlClientProvider`
- mount `StoreInitializer`, `ScrollToTop`, `ToastContainer`
- render `Header`, `Sidebar`, `Footer`, `MobileBottomNav`

ผลคือ layout ไม่ควรกลายเป็นที่ใส่ business logic หนัก ๆ หรือ external integration ควรเก็บ layout เป็น shell และกระจายงานไปยัง route/page/domain wrapper

### Auth และ Protected Routes

- `src/proxy.ts` ใช้ i18n middleware และตรวจ protected member routes
- ถ้าเข้า protected path โดยไม่มี access token และ refresh token จะ redirect ไป login พร้อม `next`
- auth BFF routes อยู่ใน `src/app/api/auth/**`
- server-only auth cookie logic อยู่ใน `src/lib/auth-session-server.ts`
- client/member auth wrappers อยู่ใน `src/lib/auth-api.ts`
- client API transport อยู่ใน `src/lib/api-client.ts`
- user state อยู่ใน `src/stores/user-store.ts`

ระบบ auth ใช้ same-origin BFF เพื่อป้องกัน refresh token หลุดไป browser-visible JSON และรองรับ refresh/retry เมื่อ access token หมดอายุ

### Backend-for-Frontend Flow

ระบบนี้ไม่ใช่ frontend ที่เรียก backend ตรงทุกจุด แต่ใช้ BFF pattern:

1. Client หรือ Server Component เรียก typed wrapper ใน `src/lib`
2. Browser request ที่ต้องใช้ auth/data backend เรียก same-origin `/api/data/**`
3. `src/app/api/data/[...path]/route.ts` ตรวจ same-origin mutation, allowlist path, เติม headers/token/locale แล้ว proxy ไป backend จริง
4. response ถูก normalize เป็น structured JSON error/success
5. UI ใช้ข้อมูล normalized แล้ว ไม่ควร parse raw backend shape เองใน component

### Football Data Flow

- football backend หลักอยู่ใน `src/lib/api-football.ts`
- page loader helpers อยู่ใน `src/lib/football-page-data.ts`
- local BFF routes อยู่ใน `src/app/api/football/**`
- media/flags ใช้ proxy helpers ใน `src/lib/football-media.ts`
- live score, matches, AI insight, predict, team/player/league pages ใช้ provider IDs และ normalization หลายชั้น

จุดสำคัญคือ realtime data ต้องแยก “backend error” ออกจาก “ไม่มีข้อมูล” และต้องระวังไม่ fallback เป็น mock/stale data ถ้าหน้านั้นตั้งใจใช้ข้อมูลสด

### Member Product Loops

ฟีเจอร์สมาชิกส่วนใหญ่ใช้ pattern เดียวกัน:

- typed wrapper ใน `src/lib/{domain}-api.ts`
- normalizer แปลง payload backend ให้ UI ใช้ shape ที่เสถียร
- Server page โหลดข้อมูลตั้งต้นเมื่อเหมาะสม
- Client component จัดการ interaction เช่น tabs, filters, forms, mutation, polling
- Zustand ใช้เฉพาะ state ที่ต้องแชร์หรือ persist ระหว่าง component

กลุ่ม product loop ปัจจุบันประกอบด้วย check-ins, achievements, credits, credit purchases, events, leaderboard, missions, levels, leagues, referrals, rewards, stats, profile, wallet และ prediction

### UI และ Styling

- shared primitives อยู่ใน `src/components/ui`
- layout shell อยู่ใน `src/components/layout`
- shared cross-page logic อยู่ใน `src/components/shared`
- feature components อยู่ตาม folder ของฟีเจอร์ เช่น `home`, `predict`, `matches`, `wallet`
- style หลักคือ dark cyber sports dashboard ใช้ dark surfaces พร้อม cyan, magenta, green, gold accents
- responsive behavior ต้องรองรับ desktop sidebar/header และ mobile bottom navigation
- active global stylesheet คือ `src/styles/globals.css`

### SEO, News และ Structured Data

- SEO copy อยู่ใน `src/data/*-seo-content.ts`
- runtime translations อยู่ใน `src/messages/*.json`
- JSON-LD serialization ใช้ `src/lib/json-ld.ts`
- sitemap อยู่ใน `src/app/sitemap.ts`
- robots อยู่ใน `src/app/robots.ts`
- backend articles ใช้ `src/lib/articles-api.ts`
- legacy/generated news ใช้ `src/lib/news-generator.ts`

งาน public page ต้องตรวจ metadata, canonical, hreflang, visible FAQ, JSON-LD, sitemap และ robots เสมอ

## 3. Integration Points สำคัญ

### เพิ่ม backend integration ใหม่

ตำแหน่งที่ควรเพิ่ม:

- `src/lib/{domain}-api.ts`
- normalizer ในไฟล์เดียวกันหรือ helper ที่เกี่ยวข้อง
- ถ้าต้อง browser-access ผ่าน generic proxy ให้เพิ่ม path ใน `ALLOWED_DATA_PROXY_PREFIXES` ของ `src/app/api/data/[...path]/route.ts`

### เพิ่ม external service หรือ secret-based integration

ตำแหน่งที่ควรเพิ่ม:

- `src/lib/{service}.ts` สำหรับ server-side service wrapper
- `src/app/api/{service}/route.ts` หรือ `src/app/api/notifications/{channel}/route.ts` สำหรับ same-origin endpoint

ห้ามใส่ secret ใน Client Component หรือ public env ถ้า service นั้นต้องใช้ token ลับ

### เพิ่มหน้า public

ตำแหน่งที่ควรเพิ่ม:

- `src/app/[locale]/{feature}/page.tsx`
- localized copy ใน `src/messages/*.json` หรือ `src/data/*-seo-content.ts`
- metadata/canonical/hreflang/JSON-LD ตาม pattern ของ public pages เดิม
- พิจารณา sitemap/robots

### เพิ่มหน้า member

ตำแหน่งที่ควรเพิ่ม:

- `src/app/[locale]/(member)/{feature}/page.tsx`
- client component เฉพาะเมื่อมี hooks, forms, Zustand, event handlers หรือ browser APIs
- protected route guard ใน `src/lib/auth-guard.ts` ถ้าเป็น route protected ใหม่
- navigation และ translations ที่เกี่ยวข้อง

### เพิ่ม football feature

ตำแหน่งที่ควรเพิ่ม:

- `src/lib/api-football.ts`
- `src/lib/football-page-data.ts`
- football detail normalizers ที่มีอยู่
- `src/app/api/football/**` ถ้าต้องมี same-origin refresh endpoint
- proxy media/flags ผ่าน helper เดิม

### เพิ่ม notification behavior

ตำแหน่งที่ควรเพิ่ม:

- in-app state: `src/stores/notification-store.ts`
- UI surface: `src/components/layout/Header.tsx` notification bell และหน้า member notifications
- external channel: `src/lib/{channel}.ts` และ route handler ใต้ `src/app/api/notifications/**`
- trigger ควรอยู่หลัง action สำเร็จใน domain นั้น เช่น reward redeem, mission claim, prediction result ไม่ควรฝังใน global layout

## ประวัติการทำงานที่เห็นจาก Git

commit ล่าสุด ๆ สะท้อนว่างานหลักวนอยู่กับ:

- SEO/news
- league/private league
- AI insight
- match detail/live score
- mobile fixes
- auth/profile/change password
- backend API integration หลายรอบ
- UI/UX system updates

สัญญาณนี้บอกว่าทีมจะได้ประโยชน์มากจากสกิลที่ช่วยตรวจความสอดคล้องของ route, API contract, localization, SEO, responsive UI และ validation มากกว่าสกิลแบบกว้าง ๆ ตัวเดียว

## สกิลที่ควรจัดทำเพื่อเพิ่มประสิทธิภาพ

### 1. Next.js App Router Guardian

ใช้เมื่อแก้:

- `src/app/**/page.tsx`
- `src/app/**/layout.tsx`
- `src/app/api/**/route.ts`
- metadata, sitemap, robots, proxy, route caching

หน้าที่:

- อ่าน Next.js docs ที่ติดตั้งจริงก่อนแก้
- ตรวจ Server/Client Component boundary
- ตรวจ dynamic/static/cache behavior
- ตรวจ route handler method และ Web Request/Response API
- แนะนำให้ run `npm run build` เมื่อแก้ routing/rendering/API boundary

### 2. Backend Contract And Normalizer Specialist

ใช้เมื่อแก้:

- `src/lib/*-api.ts`
- `src/lib/api-client.ts`
- `src/app/api/data/[...path]/route.ts`
- auth/member/economy/product loop integrations

หน้าที่:

- ออกแบบ typed API wrapper
- normalize snake_case, aliases, null, optional payload
- รักษา structured error และ backend `code`
- ป้องกัน UI ผูกกับ raw backend response
- ตรวจ allowlist proxy path

### 3. Football Data Reliability Specialist

ใช้เมื่อแก้:

- `src/lib/api-football.ts`
- `src/lib/football-page-data.ts`
- `src/app/api/football/**`
- livescore, matches, AI insight, predict, World Cup, team/player/league pages

หน้าที่:

- ตรวจ no-store/realtime refresh
- แยก backend error ออกจาก empty state
- ตรวจ provider ID, canonical route, media proxy
- ป้องกัน stale/mock fallback ที่ผิดบริบท

### 4. Multilingual Content And SEO Specialist

ใช้เมื่อแก้:

- `src/messages/*.json`
- `src/data/*-seo-content.ts`
- public locale pages
- news/article pages
- sitemap/robots/JSON-LD

หน้าที่:

- ตรวจครบ 6 locale
- ตรวจ metadata, canonical, hreflang
- ตรวจ FAQ/JSON-LD และใช้ `serializeJsonLd()`
- ตรวจ sitemap/robots โดยไม่ใส่ protected routes

### 5. Cyber Sports UI Systems Designer

ใช้เมื่อแก้:

- `src/components/ui`
- `src/components/layout`
- feature dashboards
- mobile/desktop navigation

หน้าที่:

- รักษา visual language แบบ dark cyber sports
- ใช้ component เดิมก่อนสร้างใหม่
- ใช้ `lucide-react` icon
- ตรวจ responsive layout, text overflow, spacing, hover/focus states
- หลีกเลี่ยง global CSS ถ้าไม่จำเป็น

### 6. Member Economy And Rewards Analyst

ใช้เมื่อแก้:

- prediction submit
- scoring rules
- missions/claims
- rewards redemption
- check-ins
- wallet/credits
- league entry fees

หน้าที่:

- ตรวจ points และ credits แยกกัน
- ตรวจ wallet refresh event และ header sync
- ตรวจ Zustand update หลัง mutation
- ตรวจ guest/logged-in flows
- ลดความเสี่ยงจาก reward/economy regression

### 7. Auth And Session Security Specialist

ใช้เมื่อแก้:

- auth BFF routes
- `src/lib/auth-session-server.ts`
- `src/lib/auth-api.ts`
- `src/lib/api-client.ts`
- `src/proxy.ts`
- login/register/logout/profile flows

หน้าที่:

- ป้องกัน refresh token หลุดเข้า browser-visible JSON
- รักษา same-origin mutation checks
- ตรวจ refresh-and-retry behavior
- ตรวจ session expiry event และ user store cleanup
- ตรวจ protected redirect behavior

### 8. Notification And External Messaging Integrator

ใช้เมื่อเพิ่ม:

- LINE, Telegram, email, webhook, push notifications
- notification preferences
- match-result alert
- mission/reward/wallet alert

หน้าที่:

- วาง service wrapper ใน `src/lib/{channel}.ts`
- วาง endpoint ใน `src/app/api/notifications/{channel}/route.ts`
- เก็บ secrets server-side เท่านั้น
- trigger จาก domain action หลังสำเร็จ
- mirror in-app notification ผ่าน `notification-store` เมื่อเหมาะสม

### 9. QA And Regression Specialist

ใช้หลังแก้งานทุกประเภทที่มี risk

หน้าที่:

- งานแคบ: run `npm run lint`
- route/API/rendering/metadata: run `npm run build`
- UI: start dev server และ verify route จริง
- football realtime: ตรวจ live, empty, backend failure, refresh failure
- localization: ตรวจครบ 6 locale
- member economy: ตรวจ balance, points, credits, mutation failure

## Operating Model ที่แนะนำ

ไม่ควรทำสกิลเดียวที่พยายามครอบทุกอย่าง เพราะจะกว้างเกินไปและให้ผลไม่สม่ำเสมอ ควรทำสกิลเฉพาะทางหลายตัวและให้ trigger ตามไฟล์ที่แก้:

- `src/app/**` เรียก Next.js App Router Guardian
- `src/lib/*-api.ts` เรียก Backend Contract And Normalizer Specialist
- football modules/pages เรียก Football Data Reliability Specialist
- public page/copy/SEO เรียก Multilingual Content And SEO Specialist
- member economy เรียก Member Economy And Rewards Analyst
- auth/session เรียก Auth And Session Security Specialist
- UI/layout/components เรียก Cyber Sports UI Systems Designer
- external notifications เรียก Notification And External Messaging Integrator
- ก่อนจบงาน เรียก QA And Regression Specialist

แนวทางนี้ทำให้ระบบเหมือนมีทีมผู้เชี่ยวชาญหลายสายช่วยตรวจงาน โดยแต่ละสกิลมีขอบเขตชัดเจนและไม่ทับซ้อนกันเกินไป

## Caveats สำคัญสำหรับงานในอนาคต

- worktree มี uncommitted changes อยู่แล้ว ต้องห้าม revert หรือเขียนทับโดยไม่ตรวจ
- `CODEBASE_INDEX.md` เป็น project map หลัก อัปเดตเมื่อมีการเปลี่ยน routing, architecture, data flow, scripts หรือ caveats สำคัญ
- โปรเจกต์มี codebase knowledge graph ควรใช้ graph discovery ก่อน grep
- ต้องอ่าน Next.js docs ที่ติดตั้งจริงก่อนแก้ behavior ที่ version-sensitive
- ห้ามเพิ่ม dependencies ถ้าไม่จำเป็น และถ้าจำเป็นต้องใช้ npm
- ข้อความที่ผู้ใช้เห็นต้อง update ทุก locale หรือใช้ localized data pattern เดิม

