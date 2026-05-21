# Connex - Project Context

## Project Name
Connex

## Product Goal
מערכת נוכחות עובדים זרים בענף הבניין. ה-MVP נבנה שלב-שלב. שלב הפועל הושלם ברמת MVP, והשלב הבא הוא Admin Dashboard.

## Current Tech Stack
- React 19
- Vite 7
- CSS רגיל בקובץ אחד
- ללא Backend
- ללא Database
- ללא ספריית i18n חיצונית

## Important Project Structure
- `.gitignore` - מתעלם מ-`node_modules`, `dist`, env files וקבצי בדיקה זמניים.
- `src/main.jsx` - נקודת הכניסה של React.
- `src/App.jsx` - כל ה-flow הנוכחי: Login, Worker Dashboard, היסטוריה, שפות ונתוני דמו.
- `src/styles.css` - כל העיצוב הנוכחי של Login ושל Worker Dashboard.
- `assets/` - קבצי תמונות ורפרנסים.
- `dist/` - תוצר build של Vite.
- `package.json` - סקריפטים ותלויות.

## Existing Assets
- `assets/logo.jpg` - לוגו/רפרנס Connex המקורי.
- `assets/login_mobile.jpg` - רפרנס Login מובייל.
- `assets/login_web.jpg` - רפרנס Login ווב.
- `assets/user_dash_enter.png` - רפרנס דשבורד עובד במצב כניסה ירוק.
- `assets/user_dash_exit.png` - רפרנס דשבורד עובד במצב יציאה אדום.
- `assets/workers sheet.xlsx` - נתוני עובדים עתידיים ל-Admin Dashboard בלבד. לא להשתמש בו כרגע.

## Current User Flow
1. המשתמש נכנס למסך Login.
2. פרטי דמו:
   - Username: `123`
   - Password: `123`
3. אחרי Login תקין עוברים למסך Worker Dashboard.
4. מצב ראשוני בדשבורד:
   - סטטוס: לא בעבודה / Not at work
   - כפתור מרכזי ירוק: כניסה / Check In
5. לחיצה על כניסה:
   - הכפתור הופך לאדום.
   - הטקסט הופך ליציאה / Check Out.
   - מוצג זמן כניסה קטן בתוך הכפתור לפי השעה הנוכחית.
   - הסטטוס משתנה לבעבודה / At work.
6. לחיצה על יציאה:
   - נוצרת רשומת נוכחות live עבור `30/04/2026`.
   - זמן הכניסה והיציאה נלקחים מהפעולה הנוכחית.
   - סך השעות מחושב לפי זמן הכניסה והיציאה.
   - הכפתור חוזר לירוק.
   - הסטטוס חוזר ללא בעבודה.
7. כפתור היסטוריה מלאה מציג רשימת נוכחות לחודש אפריל 2026.
8. בסוף ההיסטוריה המלאה מוצג סיכום שעות חודשי שמחושב לפי שעת כניסה ושעת יציאה.

## Current App Status - Worker Flow Complete
שלב Worker Dashboard הושלם כרגע ומוכן להמשך עבודה:
- Login עובד עם demo credentials.
- Worker Dashboard mobile-only עובד.
- כפתור כניסה/יציאה עובד.
- סטטוס עובד משתנה לפי מצב.
- רשומת נוכחות live ל-`30/04/2026` נוצרת אחרי כניסה ויציאה.
- היסטוריה ראשית והיסטוריה מלאה עובדות.
- סיכום שעות חודשי מחושב.
- החלפת שפות עובדת במסך Login ובדשבורד עובד.

אין כרגע Backend, Database או authentication אמיתי. הכל frontend demo בלבד.

## Demo Data
- עובד דמו: `MINGQIANG SONG`
- מספר דרכון: `EL6998320`
- מדינה: China / סין
- חודש דמו להיסטוריה: April 2026
- לפני פעולת כניסה/יציאה, רשומות הדמו מתחילות ב-`29/04/2026` וממשיכות עד `01/04/2026`.
- אחרי פעולת כניסה ואז יציאה, מתווספת לראש ההיסטוריה רשומת live עבור `30/04/2026`.

## Languages
קיימת תמיכה פנימית בשפות:
- English - ברירת מחדל
- עברית - RTL
- ไทย
- हिन्दी
- Română
- සිංහල

בחירת השפה נשמרת ב-`localStorage` תחת `connex-language`.

## UI/UX Decisions
- Login נשאר בעיצוב Connex נקי, כחול, פרימיום, עם לוגו גדול וללא Powered by.
- Worker Dashboard הוא Mobile Only כרגע.
- בדשבורד נשמרים:
  - לוגו Connex למעלה.
  - language selector בצד ימין.
  - logout בצד שמאל.
  - כרטיס עובד לבן.
  - כפתור כניסה/יציאה עגול, גדול ומרכזי.
  - היסטוריה קצרה במסך הראשי.
  - מסך היסטוריה חודשית מלא.

## What Works Now
- פרויקט React + Vite עולה.
- Login עובד עם `123 / 123`.
- שגיאה מוצגת אם השדות ריקים או אם פרטי הדמו לא נכונים.
- מעבר ל-Worker Dashboard אחרי Login תקין.
- כפתור כניסה/יציאה משנה מצב.
- זמן כניסה מוצג במצב יציאה.
- רשומת נוכחות מתעדכנת אחרי יציאה.
- שורת הזמן בתוך הכפתור העגול מוגבלת וממורכזת כדי שלא תברח מהעיגול בשפות ארוכות.
- היסטוריה קצרה והיסטוריה מלאה קיימות.
- לפני פעולה, ההיסטוריה הראשית מתחילה ב-`29/04/2026`.
- אחרי כניסה ויציאה, ההיסטוריה הראשית והמלאה מציגות את `30/04/2026` בראש עם זמני הפעולה.
- התצוגה מסננת state ישן או רשומות לא תקינות כך שתאריכי מאי לא יכולים להופיע במסכי ההיסטוריה.
- סיכום שעות חודשי מחושב לפי הרשומות עם כניסה ויציאה.
- החלפת שפה עובדת ב-Login וב-Worker Dashboard.
- עברית מוגדרת RTL; שאר השפות LTR.

## What Is Not Built Yet
- Dashboard מנהל.
- ניהול עובדים.
- ניהול אתרי עבודה.
- דוחות שעות אמיתיים.
- Backend.
- Database.
- Authentication אמיתי.
- שימוש ב-Excel/CSV.
- התאמות Desktop מלאות לדשבורד עובד.

## Admin Dashboard - Next Scope
השלב הבא בשיחה חדשה:
1. לקרוא את `PROJECT_CONTEXT.md` בתחילת העבודה.
2. לא לשנות את Worker Dashboard בלי צורך.
3. להתחיל לבנות Admin Login / Admin Dashboard לפי שלב העבודה הבא.
4. להשתמש ב-`assets/workers sheet.xlsx` רק כשמתחילים את Admin Dashboard, כי הוא שמור לנתוני עובדים/אדמין.
5. לשמור על אותו מיתוג Connex ושפה עיצובית: כחול, נקי, מקצועי, SaaS, מתאים לענף הבנייה.
6. לא לבנות Backend בשלב הראשון של Admin אלא אם המשתמש מבקש.

## Known Notes / Risks
- הלוגו בנוי כרגע ב-CSS כדי להיראות חד ולא חתוך. לא לשנות אותו בלי צורך.
- PowerShell עלול להציג עברית כג'יבריש בגלל encoding של הטרמינל, גם כשהדפדפן מציג נכון.
- יש קבצי root ישנים מגרסת static מוקדמת (`script.js`, `styles.css`, `logo.jpg`, `login_mobile.jpg`, `login_web.jpg`) שאינם חלק מה-React flow הנוכחי. לא למחוק בלי לוודא שאין בהם צורך.
- קובצי React הפעילים נמצאים ב-`src/`; הקבצים הישנים בשורש אינם ה-flow הנוכחי.
- אין git זמין בסביבת PowerShell הנוכחית לפי בדיקה קודמת.

## Next Tasks By Priority
1. להתחיל Admin Login / Admin Dashboard.
2. להחליט עם המשתמש מה המסך הראשון באדמין צריך להציג.
3. להשתמש ב-`assets/workers sheet.xlsx` בהמשך, כשצריך נתוני עובדים.
4. להשאיר את Worker Dashboard כמו שהוא, אלא אם יש תיקון נקודתי.

## How To Run
- התקנה כבר קיימת: `node_modules` נמצא בפרויקט.
- להרצה:
  `npm run dev -- --host 0.0.0.0 --port 5173`
- פתיחה בדפדפן:
  `http://localhost:5173/`
- בדיקת build:
  `npm run build`

## Handoff Summary For New Chat
אם פותחים שיחה חדשה, להתחיל כך:
- הפרויקט נמצא ב-`C:\Users\openb\Documents\New project`.
- לקרוא קודם את `PROJECT_CONTEXT.md`.
- האפליקציה היא React + Vite.
- המותג הוא Connex בלבד.
- Login עובד עם `123 / 123`.
- Worker Dashboard גמור לשלב MVP.
- לא להשתמש עדיין ב-Backend.
- השלב הבא הוא Admin Dashboard.
- קובץ `assets/workers sheet.xlsx` קיים ויועד לשלב האדמין.
- יש לשמור על עבודה ממוקדת, לא לבנות מסכים קדימה בלי אישור, ולעדכן את `PROJECT_CONTEXT.md` בסוף כל שלב משמעותי.

## Latest Task Log
- 2026-05-02 Admin refinement pass completed.
- Compact desktop Admin Dashboard layout so the main 3-card dashboard fits better in a single desktop viewport.
- Admin present workers now receive deterministic realistic demo entry/exit times and calculated hours based on the Excel-derived worker list.
- Any non-present admin status clears entry/exit and turns the full worker table row red.
- Reports page site rows now open a detailed monthly Excel-style report per site.
- Detailed site reports show Excel-derived worker fields, daily April columns, per-worker monthly totals, and site monthly total hours.
- Demo date logic is aligned to April 2026: admin worker history runs `29/04/2026` back to `01/04/2026`; reports include `30/04/2026` as the demo current date.
- Mobile admin tables now use a top horizontal scroll helper in addition to the table scroll area.
- Fixed mobile Hebrew RTL grid overflow caused by desktop RTL grid overrides.
- Ran `npm run build` successfully and verified with Playwright: worker login/history, admin login, compact cards, generated attendance times, red status rows, April-only worker history, detailed reports, and mobile admin table usability.
- 2026-05-02 Admin Dashboard MVP implemented.
- Added admin login credentials `111 / 111` alongside existing worker login `123 / 123`.
- Added workbook-derived admin data layer in `src/data/adminDemoData.js` based on `assets/workers sheet.xlsx`.
- Added 3 admin sites: `דניה ווסט הוד השרון`, `גולומב 38 רמת השרון`, `פורמה תל אביב`, with workers divided roughly evenly.
- Added admin dashboard site cards, site workers table, editable entry/exit/status fields, worker monthly history, reports page, and sites/projects page.
- Sidebar contains only `דשבורד מנהל`, `אתרים`, `דוחות`; no print button and no `מגמת נוכחות` section.
- Added cropped site visuals from the Admin Dashboard mockups under `assets/admin-site-images/`.
- Admin layout supports desktop and mobile; Hebrew RTL keeps sidebar on the right, other languages are LTR.
- Ran `npm run build` successfully.
- Verified with Playwright: worker login/history, admin login, 3 site cards, workers table, editing, status dropdown, worker history, reports, projects, 3-item sidebar, no print/trend text, Hebrew RTL sidebar, and mobile no-overflow card stacking.
- נוצר קובץ `PROJECT_CONTEXT.md`.
- תועד מצב הפרויקט, flow עובד, assets, החלטות UI/UX ומשימות הבאות.
- עודכן `.gitignore` כדי להתעלם מקבצי בדיקה זמניים של דפדפן וצילומי מסך.
- נוקו מהשורש קבצי בדיקה זמניים: `.edge-test-profile*`, `dashboard-*.png`, `preview-*.png`.
- הורץ `npm run build` בהצלחה.
- נבדק flow בדפדפן מובייל 390px: Login עם `123/123`, מעבר לדשבורד, כניסה ירוקה -> יציאה אדומה עם `07:00`, יציאה חזרה לירוק, היסטוריה מלאה, ועברית RTL.
- עודכן Worker Dashboard: נתוני הדמו עברו מאי לאפריל 2026, החל מ-`22/04/2026`.
- נוסף חישוב שעות אמיתי לפי זמני כניסה/יציאה וסיכום שעות חודשי במסך ההיסטוריה המלאה.
- שופר טקסט הכפתור העגול כך שגם באנגלית ובשאר השפות שורת השעה נשארת בתוך העיגול.
- הורץ `npm run build` בהצלחה אחרי השינויים.
- נבדק בדפדפן מובייל 390px: Login `123/123`, כניסה/יציאה, היסטוריה מלאה של אפריל בלבד, סיכום חודשי `72:41`, והתאמת טקסט הכפתור בכל השפות.
- עודכנה היסטוריית הדמו כך שגם המסך הראשי וגם ההיסטוריה המלאה משתמשים באותה רשימת אפריל מלאה.
- נבדק בדפדפן מובייל 390px: המסך הראשי מציג `30/04/2026` עד `26/04/2026`, ההיסטוריה המלאה מציגה `30/04/2026` עד `01/04/2026`, אין אף תאריך ממאי, הדף ניתן לגלילה, וסיכום השעות מופיע אחרי `01/04/2026`.
- נוסף איפוס/נרמול לרשומות ההיסטוריה כדי למחוק state ישן של React Fast Refresh שהחזיק תאריכי מאי ב-preview.
- נבדק שוב בדפדפן מובייל 390px: הראשי מציג רק `30/04/2026` עד `26/04/2026`, ההיסטוריה המלאה מציגה רק אפריל מלא, ואין אף תאריך במאי.
- עודכן ה-flow: ההיסטוריה מתחילה מ-`29/04/2026`; רשומת `30/04/2026` לא קיימת מראש ונוצרת רק אחרי שהמשתמש עושה כניסה ואז יציאה.
- זמני הכניסה/יציאה עבור `30/04/2026` נלקחים מהשעה הנוכחית בזמן הפעולה, והסיכום מחושב מהם.
- נבדק בדפדפן מובייל 390px: לפני פעולה ההיסטוריה מתחילה ב-`29/04/2026`; אחרי כניסה/יציאה נוסף `30/04/2026` בראש עם זמני live; ההיסטוריה המלאה מציגה `30/04/2026` עד `01/04/2026`; אין תאריכי מאי.
- נשמר סיכום מצב מלא לקראת מעבר לשיחה חדשה ולעבודה על Admin Dashboard.
