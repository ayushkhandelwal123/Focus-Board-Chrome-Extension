# PRD: Chrome Extension Personal Productivity New Tab Dashboard

## 1. Overview

### Product name
Personal Productivity New Tab Dashboard

### Purpose
Replace the Chrome new tab page with a visually calm, personal productivity dashboard that helps the user stay focused, capture tasks quickly, and avoid distracting websites during focus sessions.

### Primary value proposition
Every new tab becomes a lightweight personal command center:
- the user sees a personalized greeting and the current time immediately,
- their daily focus is always visible,
- they can capture and complete small tasks without friction,
- they can enable Focus Mode to reduce distractions.

### Target user
A single individual user who wants a private, customizable new tab dashboard for daily planning and distraction reduction.

### Product principles
- Fast to open, fast to use.
- Minimal, calm, visually clean.
- Personal by default.
- No unnecessary complexity in early phases.
- Focus-related states should be visible and persistent.

---

## 2. Problem Statement

A browser new tab is usually blank or distracting. The user wants that space to become a daily productivity surface that:
- displays a motivating wallpaper,
- greets the user by name,
- asks for a daily focus each morning,
- keeps that focus visible throughout the day,
- provides a simple task list,
- blocks distracting websites when Focus Mode is enabled,
- allows easy personalization through settings.

---

## 3. Goals and Non-Goals

### Goals
1. Replace the default Chrome new tab page.
2. Show a full-screen wallpaper with optional custom upload.
3. Display a personalized greeting and live clock.
4. Prompt the user each morning: “What is your main focus today?”
5. Save the daily focus and keep it visible until the next day.
6. Provide a simple task list with add / complete / delete actions.
7. Add a Focus Mode toggle that blocks distracting websites.
8. Replace blocked site errors with a custom focus message.
9. Provide a settings panel for name, wallpaper, and block list management.
10. Build the product in phases so each step is independently usable.

### Non-Goals
- Multi-user accounts or cloud sync.
- Collaborative task sharing.
- Complex project management features.
- Calendar integrations in the first version.
- AI-generated task suggestions in the first version.
- Mobile app support.
- Web app version outside the extension.

---

## 4. Success Metrics

### Core success metrics
- Daily active usage of the new tab dashboard.
- Percentage of users who set a daily focus.
- Percentage of days with at least one task added.
- Focus Mode toggle usage.
- Number of blocked visits while Focus Mode is enabled.

### Product quality metrics
- New tab loads in under 1 second on typical machines.
- Settings persist reliably across browser restarts.
- Wallpaper loading should not break the dashboard layout.
- Focus reset happens exactly once per new day.

---

## 5. User Personas

### Persona 1: Daily planner
Wants a simple home screen that shows today’s intention and a few tasks.

### Persona 2: Deep work user
Needs website blocking to reduce temptation while working.

### Persona 3: Minimalist user
Cares about speed, aesthetics, and a clean interface.

---

## 6. Core User Journeys

### Journey A: First-time setup
1. User installs the extension.
2. New tab opens to the dashboard.
3. User enters their name.
4. User uploads a wallpaper or keeps the default.
5. User adds a few websites to the block list.
6. User enters their first daily focus.
7. Dashboard becomes personalized and ready to use.

### Journey B: Daily use
1. User opens a new tab.
2. Dashboard shows wallpaper, greeting, live clock, daily focus, and tasks.
3. User adds or checks off tasks.
4. User turns Focus Mode on when working.
5. Distracting websites are blocked and replaced with a custom focus screen.

### Journey C: Next day reset
1. A new day begins.
2. The previous day’s focus is no longer shown as today’s focus.
3. The user is prompted again for a new main focus.
4. Tasks remain unless deleted or completed.

---

## 7. Functional Requirements

## 7.1 New Tab Dashboard

### Requirements
- Override the Chrome new tab page.
- Display a full-screen wallpaper background.
- Support either a default wallpaper or a user-uploaded wallpaper.
- Show a greeting with the user’s name.
- Show a live digital clock.
- Show the current daily focus.
- Show a prompt for daily focus if none has been set for the current day.
- Display the task list.
- Include a Focus Mode toggle.
- Include a settings icon.

### Acceptance criteria
- Opening a new tab loads the dashboard instead of Chrome’s default new tab page.
- The dashboard remains readable over any wallpaper.
- The greeting and clock are visible without scrolling.

---

## 7.2 Daily Focus

### Requirements
- The dashboard must ask the user: “What is your main focus today?”
- The focus should be editable.
- The focus should persist for the current day.
- The focus should remain visible all day on the dashboard.
- At the start of a new day, the focus should reset and the user should be prompted again.
- The product should use the browser’s local date to determine day changes.

### Suggested behavior
- If no focus exists for today, show an input field immediately.
- After submission, collapse the input and show the focus prominently.
- Allow changing the focus later in the day.
- Treat the focus as a daily value keyed by local date.

### Acceptance criteria
- The focus entered on a given date is shown on that same date across reloads.
- On the next local calendar day, the previous focus is not shown as today’s focus.

---

## 7.3 Task List

### Requirements
- Allow adding a task from a simple input.
- Allow marking a task as done.
- Allow deleting a task.
- Show active and completed tasks clearly.
- Keep the list lightweight and low-friction.

### Suggested behavior
- Press Enter to add a task.
- Completed tasks are visually distinct and can be toggled back if desired.
- Deletion requires a single click/tap.
- Tasks persist locally across sessions.

### Acceptance criteria
- User can add, complete, and delete tasks without page refresh.
- Changes persist after browser restart.

---

## 7.4 Focus Mode

### Requirements
- Provide a Focus Mode toggle on the dashboard.
- When enabled, block access to distracting websites.
- The block list should be editable in Settings.
- Blocked sites should be replaced with a custom message instead of the browser’s default error or blank page.
- The blocked page should reinforce the user’s focus instead of feeling punitive.

### Suggested behavior
- Default blocked page message: “You are in Focus Mode. Return to your main focus today.”
- Optionally show the daily focus on the blocked page.
- The block list should include common distracting domains such as Instagram, YouTube, and LinkedIn by default, but remain editable.

### Acceptance criteria
- When Focus Mode is enabled, navigation to any listed domain is intercepted.
- The replacement page loads successfully and is branded like the dashboard.
- Turning off Focus Mode immediately stops blocking.

---

## 7.5 Settings

### Requirements
- Settings should be accessible through a visible icon.
- Settings should allow the user to:
  - change their name,
  - upload or replace wallpaper,
  - reset to default wallpaper,
  - manage the block list,
  - review or change extension preferences.

### Suggested settings sections
- Profile: name
- Appearance: wallpaper upload, default wallpaper restore
- Focus Mode: block list management
- General: reset data, export/import later if needed

### Acceptance criteria
- All settings changes persist locally.
- Users can safely change and save their name.
- Users can add and remove blocked websites.

---

## 8. Data Model

### Suggested local storage objects

#### User profile
- `name`
- `createdAt`

#### Appearance
- `wallpaperType` (default | custom)
- `wallpaperData` (data URL or extension asset reference)

#### Daily focus
- `focusDate` (local date string, e.g. YYYY-MM-DD)
- `focusText`

#### Tasks
- `id`
- `text`
- `completed`
- `createdAt`
- `updatedAt`

#### Focus Mode
- `enabled`
- `blockedDomains` (array of domain strings)

### Storage guidance
- Use `chrome.storage.local` for persistence.
- Keep all data available offline.
- Prefer simple JSON structures.

---

## 9. UX / UI Requirements

### Layout
- Full-screen background wallpaper.
- A subtle overlay for readability.
- Center or top-left hero area for greeting and clock.
- Daily focus section in a prominent card or text block.
- Task list in a compact panel.
- Settings icon in a corner.
- Focus Mode toggle visible but not visually dominant.

### Visual style
- Calm, minimal, modern.
- High contrast text over wallpaper.
- Rounded cards and soft shadows.
- Avoid clutter.
- Use clear spacing and hierarchy.

### States to design
- Empty state for no name set.
- Empty state for no daily focus set.
- Empty task list state.
- Focus Mode on state.
- Focus Mode off state.
- Blocked page state.
- Settings modal or side panel state.

---

## 10. Functional Edge Cases

- If the wallpaper fails to load, fall back to a default background.
- If the user has not set a name, show a neutral greeting.
- If the daily focus has not been set yet, show the prompt immediately.
- If the date changes while the tab is open, the app should recognize the new day.
- If browser storage is cleared, show setup state again.
- If the block list is empty, Focus Mode should still be usable, but with no sites blocked.

---

## 11. Privacy and Security Requirements

- All data should stay local to the device unless future sync is explicitly added.
- Do not send personal data to external servers in the first version.
- Uploaded wallpaper should be handled securely through browser extension storage and/or local data URL handling.
- Blocked page replacement should not leak browsing activity.

---

## 12. Technical Considerations

### Suggested Chrome extension architecture
- Manifest V3.
- New tab override page.
- Background service worker for block enforcement logic.
- Content or navigation interception strategy for redirecting blocked sites.
- Settings UI within the extension.
- Use `chrome.storage.local` for persistence.

### Recommended implementation notes
- Split UI into reusable components.
- Keep date logic centralized.
- Store daily focus by local date.
- Build a small domain normalization utility for the block list.
- Use a lightweight state management approach.

---

## 13. Phase Plan

## Phase 1: New tab replacement and basic personalization
### Scope
- Replace new tab page.
- Show wallpaper.
- Allow name input.
- Show greeting.
- Show live clock.
- Add daily focus prompt and persistence.

### Deliverables
- Working dashboard on every new tab.
- Name and wallpaper persistence.
- Daily focus entry and display.

### Exit criteria
- The dashboard feels complete enough for daily use without tasks or blocking.

---

## Phase 2: Task list
### Scope
- Add task input.
- Mark task complete.
- Delete task.
- Persist tasks locally.

### Deliverables
- Lightweight task management panel.

### Exit criteria
- User can maintain a small list of tasks without friction.

---

## Phase 3: Focus Mode and blocked page
### Scope
- Add Focus Mode toggle.
- Add block list management.
- Block distracting sites.
- Replace blocked sites with custom focus message.

### Deliverables
- Operational distraction blocker integrated into the extension.

### Exit criteria
- Focus Mode can be enabled and reliably blocks configured sites.

---

## Phase 4: Settings and polish
### Scope
- Add settings panel.
- Manage name, wallpaper, and block list.
- Add reset and cleanup actions.
- Improve visuals and responsiveness.

### Deliverables
- Clean, usable settings experience.
- Polished UI across states.

### Exit criteria
- The extension is stable, visually coherent, and easy to customize.

---

## 14. Detailed Build Requirements by Phase

## Phase 1 build checklist
- Manifest configured for new tab override.
- Dashboard page renders with fallback default wallpaper.
- User name stored locally.
- Wallpaper upload works and persists.
- Live clock updates every second.
- Daily focus input saves and displays.
- Focus resets based on local day.

## Phase 2 build checklist
- Task create input.
- Task completion toggle.
- Task deletion.
- Task persistence.
- Empty and completed states.

## Phase 3 build checklist
- Focus Mode toggle UI.
- Block list stored and editable.
- Navigation interception logic.
- Custom blocked page.
- Smooth on/off state switching.

## Phase 4 build checklist
- Settings modal or panel.
- Editable name.
- Wallpaper upload and reset.
- Block list editor.
- General reset action.
- UI cleanup and responsive behavior.

---

## 15. Acceptance Criteria Summary

The product is considered successful when:
- every new tab opens the custom dashboard,
- the dashboard greets the user by name,
- the live clock works correctly,
- the daily focus appears every morning and resets daily,
- tasks can be created, completed, and deleted,
- Focus Mode blocks configured distracting domains,
- blocked pages show a custom message,
- settings allow the user to personalize the experience,
- all key data persists locally.

---

## 16. Future Enhancements

Potential later phases, not required for the first build:
- Inspirational quote rotation.
- Pomodoro timer.
- Calendar integration.
- Weather widget.
- Focus streak tracking.
- Optional cloud sync.
- Theme presets.
- Keyboard shortcuts.
- Quick note pad.
- Search bar for focused web search.

---

## 17. Handoff Notes for AI Coding Tool

Use this PRD as the source of truth. Build the product in the listed phases and validate each phase before moving to the next. Keep the UI simple, fast, and local-first. Favor reliability over feature breadth. The dashboard should feel calm and useful immediately on install.

