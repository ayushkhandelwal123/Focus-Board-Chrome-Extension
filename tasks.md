# Implementation Plan: Personal Productivity New Tab Dashboard

This document breaks down the Product Requirements Document (PRD) into atomic, executable tasks organized by phased dependencies.

## Phase 1: Foundation, New Tab Override & Basic Personalization

**Objective:** Get the basic extension skeleton running, overriding the new tab, and implementing the core personalized view (clock, greeting, daily focus).

*   [x] **Task 1.1: Project Setup & Manifest**
    *   Create `manifest.json` (Manifest V3).
    *   Configure `chrome_url_overrides` to point to an `index.html` for the new tab.
    *   Set up basic project structure (`index.html`, `styles.css`, `script.js`).
    *   Ensure required permissions (`storage`) are requested.
*   [x] **Task 1.2: Basic UI Layout & Default Wallpaper**
    *   Implement full-screen background in `styles.css` with a default fallback image.
    *   Add a subtle dark overlay for text readability.
    *   Create the main semantic container structure in `index.html`.
*   [x] **Task 1.3: Live Clock Component**
    *   Create HTML structure for the clock.
    *   Write JavaScript to update the time every second using `setInterval` or `requestAnimationFrame`.
    *   Format time clearly (e.g., HH:MM) and style it prominently.
*   [x] **Task 1.4: User Greeting Implementation**
    *   Create an onboarding UI state for "What is your name?" if no name is set.
    *   Save the inputted user name to `chrome.storage.local`.
    *   Update UI to display a dynamic greeting (e.g., "Good morning, [Name]") based on the time of day.
*   [x] **Task 1.5: Daily Focus Feature - UI & Storage**
    *   Create the UI input field for entering the "Main focus today".
    *   Save the focus text and current local date (YYYY-MM-DD) to `chrome.storage.local`.
    *   Display the saved focus in a prominent text block if it exists for the current day.
*   [x] **Task 1.6: Daily Focus Feature - Reset Logic**
    *   Implement logic to check if the saved focus date matches the current local date on page load and periodically (or when tab regains focus).
    *   If the date has changed, clear the displayed focus and show the input prompt again.
*   [x] **Task 1.7: Custom Wallpaper Upload (Basic)**
    *   Create a hidden file input for wallpaper upload.
    *   Convert the uploaded image to a Data URL (Base64) using `FileReader`.
    *   Save the Data URL to `chrome.storage.local` and apply it as the background.

## Phase 2: Task List Management

**Objective:** Implement a lightweight, local-only task list.

*   [x] **Task 2.1: Task List UI Skeleton**
    *   Add a task panel container to the main layout.
    *   Create an input field for adding new tasks.
    *   Create an empty state message for the task list.
*   [x] **Task 2.2: Task State Management**
    *   Define the task object structure (`id`, `text`, `completed`, `createdAt`).
    *   Write helper functions to load tasks from and save tasks to `chrome.storage.local`.
*   [x] **Task 2.3: Adding Tasks**
    *   Listen for the "Enter" keypress on the task input.
    *   Append the new task to the state array and save to storage.
    *   Render the new task in the DOM without a page refresh.
*   [x] **Task 2.4: Task Completion & Deletion**
    *   Add a checkbox/toggle for each task. Update the `completed` status on click and persist.
    *   Add a delete button/icon for each task. Remove from state on click and persist.
    *   Apply distinct visual styling for completed tasks (e.g., strikethrough, faded opacity).

## Phase 3: Focus Mode & Website Blocking

**Objective:** Implement the core distraction-blocking feature using background service workers.

*   [x] **Task 3.1: Focus Mode Toggle UI**
    *   Add a toggle switch/button to the main dashboard.
    *   Save the `focusModeEnabled` boolean to `chrome.storage.local`.
    *   Update the visual state of the toggle based on the saved value.
*   [x] **Task 3.2: Default Block List Setup**
    *   Define an initial list of distracting domains (e.g., `instagram.com`, `youtube.com`, `twitter.com`).
    *   Save this default list to `chrome.storage.local` on initial installation (using `chrome.runtime.onInstalled`).
*   [x] **Task 3.3: Background Service Worker Setup**
    *   Register a background script (`background.js`) in `manifest.json`.
    *   Ensure permissions for `webNavigation` or `declarativeNetRequest` (depending on chosen implementation approach) are in manifest.
    *   Implement a listener for changes in `chrome.storage.local` to keep the background worker synced with `focusModeEnabled` and the block list.
*   [x] **Task 3.4: Navigation Interception**
    *   Use `chrome.declarativeNetRequest` (recommended for MV3) to set up dynamic rules, OR use `chrome.webNavigation.onBeforeNavigate` to monitor outgoing requests.
    *   If `focusModeEnabled` is true, check if the URL matches the block list.
    *   Redirect matched URLs to a custom internal extension page (e.g., `chrome-extension://[id]/blocked.html`).
*   [x] **Task 3.5: Custom Blocked Page UI**
    *   Create `blocked.html` and `blocked.css`.
    *   Display a calm message: "You are in Focus Mode. Return to your main focus today."
    *   (Optional enhancement) Read from storage to display the user's current Daily Focus on this blocked page.

## Phase 4: Settings & Final Polish

**Objective:** Consolidate settings, allow user customization, and polish the UI to be "calm, minimal, modern".

*   [x] **Task 4.1: Settings UI Modal/Panel**
    *   Add a settings icon to a corner of the dashboard.
    *   Create a modal overlay or side panel structure in HTML/CSS for the settings menu.
*   [x] **Task 4.2: Settings - Profile & Appearance**
    *   Add an input field to edit the user's name (updates `chrome.storage.local` and immediately reflects on the dashboard).
    *   Add UI for wallpaper upload (reusing logic from Task 1.7).
    *   Add a "Restore Default Wallpaper" button that clears the saved Data URL.
*   [x] **Task 4.3: Settings - Block List Editor**
    *   Create UI to display the current list of blocked domains.
    *   Add an input field to append new domains to the list.
    *   Add delete buttons next to each domain to remove them.
    *   Ensure changes update `chrome.storage.local` and the background worker updates its blocking rules immediately.
*   [x] **Task 4.4: Data Management & Reset**
    *   Add a "Reset All Data" button in settings.
    *   Implement logic to clear `chrome.storage.local` and reload the extension/dashboard to the initial setup state.
*   [x] **Task 4.5: UX & Visual Polish**
    *   Review all UI states (empty name, empty focus, empty tasks).
    *   Ensure responsive behavior on different window sizes.
    *   Refine colors, typography, shadows, and spacing. Implement high contrast text over wallpapers and rounded cards/soft shadows as specified in the PRD.
