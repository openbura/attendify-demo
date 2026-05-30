# Connex Live Demo Status - 2026-05-29

## Current Product State

Connex is a React + Vite local-first attendance demo for construction-site foreign workers. The current state is prepared for a live contractor demo and is still frontend-only.

The app has:

- Worker login with individual live-demo credentials from the Excel source.
- Admin login still available as `111 / 111`.
- Admin dashboard, sites, reports, worker details, site settings, and GPS settings.
- Worker mobile check-in/check-out flow.
- No Supabase or backend integration yet.

## Live-Demo Data State

- Live-demo workers: 21.
- Live-demo sites: 4.
- Worker usernames/passwords come from the worker credentials Excel source.
- Credentials and passport numbers are intentionally not listed in this status file.
- Current worker context: workers are marked as Nepal in the app seed data.

## Site List

1. פרוייקט נעמי שמר - נעמי שמר 2, הוד השרון
2. פרוייקט אבגד - גולומב 38, רמת השרון
3. פרוייקט חברת חשמל - לכיש 69, קריית ים
4. פורמה תל אביב - הברון הירש 3, תל אביב

## GPS And Check-In Behavior

- Check-in uses GPS validation against the worker assigned site.
- If location permission/GPS fails, the app shows a clear retry state and does not show the wrong-site selector.
- If GPS is granted but the worker is outside the assigned site radius, the app shows a wrong-site fallback selector with the other live-demo sites.
- Choosing another site does not bypass GPS. The app validates the current position again against the selected site.
- If the selected site passes GPS validation, attendance is recorded under the selected site and the app state can reflect the updated site.
- A dev-only GPS test query mode exists for local QA of permission, unavailable, timeout, insecure, outside-site, and inside-site states.

## Current Data Limitation

- Attendance/check-in data is still stored in client-side/local browser state.
- Attendance is not yet shared across phones/devices.
- Admin on a different device will not see real-time worker attendance from another phone until Supabase/backend persistence is added.
- Supabase has not been added yet.

## Language Defaults

- Worker dashboard default language: English.
- Admin dashboard default language: Hebrew.
- Saved language preferences are respected after the user changes language.
- Admin Hebrew screens are RTL.
- Worker English screens are LTR.

## Wage And Reports State

- Minimum hourly rate constant: `MINIMUM_HOURLY_RATE_ILS = 35.40`.
- Worker detail shows hourly rate, total hours, and simple payment calculation for admin only.
- Worker mobile dashboard does not show salary/payment data.
- Admin Reports show monthly site hours and minimum-wage value per site.
- This is simple demo visibility only: hours x minimum hourly rate. It is not payroll, tax, overtime, or legal wage logic.

## Ready Now

- Local live demo.
- Admin demo review on desktop.
- Worker mobile flow review on a phone.
- Public HTTPS preview after GitHub/Vercel update.

## Not Ready Yet

- True multi-device live attendance.
- Shared admin visibility of phone check-ins from separate devices.
- Supabase database schema, auth, policies, or realtime sync.
- Production security model for live credentials.

## QA Status

Latest local checks before this handoff:

- `npm run build` passed.
- Browser QA passed for admin login, worker login, language defaults, reports, GPS fallback test mode, and login screen credential-hint removal.
- Known limitation: real mobile GPS must be tested on an HTTPS public link or physically near the configured sites.
- Current local HTTP LAN URLs may block mobile geolocation in modern mobile browsers.

## Git And Deployment Notes

- GitHub remote is expected to be `https://github.com/openbura/attendify-demo.git`.
- Current local branch should be reviewed before push.
- Vercel project config exists locally, but current local changes are not public until committed, pushed, and deployed/previewed.
- Do not push or deploy without explicit approval.

## Next Steps

1. Commit the current live-demo version after reviewing the staged file list.
2. Push to the correct GitHub branch without force-push.
3. Create or verify a public HTTPS Vercel preview link.
4. Test mobile GPS from the HTTPS link.
5. Start Supabase integration only after the public preview is stable.

## Update - 2026-05-30

- Connex is now connected to Supabase for shared live-demo attendance.
- Supabase is the main attendance source when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured.
- `localStorage` remains only for UI preferences and local fallback when Supabase is missing.
- Production URL: `https://connex-worker-attendance.vercel.app`.
- Daily health command: `npm run health:connex`.
- Healthy output starts with `CONNEX_HEALTH_OK`.
- Failure output starts with `CONNEX_HEALTH_FAIL` and includes failed check, likely cause, and next action.
- The health check validates production HTTP 200, app shell, Supabase reads, 21 workers, 4 sites, `active_punches`, `attendance_records`, and a browser/admin fallback-mode smoke check when practical.
- Admin dashboard includes a compact admin-only system health panel showing data source, Supabase status, loaded workers/sites, active attendance, last server read, and last server write.
- Free-plan note: expected usage for 21 workers is low, but Vercel/Supabase free tiers may have limits or inactivity pauses. For a real pilot/production rollout, review Supabase Auth, RLS, backup policy, monitoring, and paid-plan limits.
