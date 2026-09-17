# Changelog

Public release history for the Cordy family of products. Each product has its
own section, newest version first.

Only the most recent release of each product has downloadable builds attached —
see [README.md](README.md). Versions listed here without a download are part of
the product's history, published for reference.

Dates are the release dates recorded by each product. 中文版本见
[CHANGELOG.zh-CN.md](CHANGELOG.zh-CN.md)。

## Cordy Desktop

### 0.5.3 — 2026-09-17

- Added native macOS (Apple Silicon) and Linux (x86_64 and arm64) packages, in the same install channels Windows already has: `.dmg`/`.zip` on macOS and `.AppImage`/`.deb` on Linux, installable side by side with independent data.
- macOS terminals and coding-agent launches now start reliably when Cordy is opened from Finder.
- Restarting the background runtime now leaves terminals usable and shows accurate agent status, instead of leaving stale "running" agents behind.
- A terminal-creation timeout no longer leaves a hidden shell process running in the background.
- Cmd+Q now quits Cordy properly on macOS even while a coding agent's terminal UI has focus.
- This release does not include a Windows installer.
- The macOS build uses a local development signing identity and is not notarized.
- Linux sandboxed startup and AppImage mounting on an ordinary desktop have not been fully verified.

### 0.5.2 — 2026-09-15

- A new keyboard shortcut, Ctrl+Alt+T, opens a new terminal tab, pairing with the existing Ctrl+Alt+W that closes one.
- When a terminal's shell exits normally (typing `exit`, or Ctrl+D / Ctrl+C), its tab now closes automatically, matching Windows Terminal and VS Code.
- If a shell crashes or is closed unexpectedly, its tab now stays open with the exit status shown and Restart / Close options, instead of going stale silently.
- Pinned terminal tabs are never closed automatically, and quitting Cordy with "Stop all sessions" no longer risks closing tabs on the way out.

### 0.5.1 — 2026-09-14

- The performance indicator and its overview now show memory, GPU, CPU and process count as independent, toggleable readings instead of one combined figure you had to do arithmetic on.
- The process overview is now a single table of the heaviest processes, each colour-matched to its line on the memory chart, with a total row and a separate row for the runtime, shells and agents.

### 0.5.0 — 2026-09-14

- Keyboard shortcuts (switch, jump, close and duplicate workspace, TUI zoom, and more) now work immediately when Cordy opens, instead of only after clicking into a terminal or switching workspaces once.
- The file editor now soft-wraps long lines to fit the pane width, for every file type.
- The General settings page now uses the same layout and styling as the other settings pages.
- A diff tab opened from Git History now shows its file's own icon instead of a generic one.
- The performance indicator now shows GPU process memory separately from the rest of the app's memory.
- The Windows installer is still not code-signed, so Windows SmartScreen shows an "unrecognised app" warning on first run (choose "More info → Run anyway").
- The detailed performance monitor's Workload view remains Windows-only; macOS and Linux show the app memory total alone.

### 0.4.0 — 2026-09-12

- The terminal now supports the keyboard protocols that CLIs like Claude Code and Codex rely on, so Shift+Enter (and Ctrl+J in Codex) insert a newline instead of submitting the message.
- A TUI that requests mouse input now receives clicks, drags and hover directly; select text yourself with Shift+drag (Option also forces a selection on macOS).
- The compact performance overview is back: clicking the CPU/memory indicator opens live charts, the six heaviest processes, and a workload total, with a link through to the full monitor.
- The toolbar's editor button now opens your default editor in a single click, with a separate menu to switch editors.
- Fixed a terminal tab opened right after startup occasionally missing the very first output of its session.
- Fixed the quit confirmation window, shown when Cordy is closed to the tray, not filling its own window.
- Importing passwords from CSV now opens the file picker in your configured downloads folder.
- The Windows installer remains uncertified, still triggering the SmartScreen warning on first run, and the performance monitor's Workload view remains Windows-only.

### 0.3.0 — 2026-09-04

- Cordy ships its first installer: a Windows installer attached to this release. (macOS and Linux packages build from the same pipeline but have seen far less real-world use.)
- Importing a repository and creating a workspace are now single-keystroke actions.
- Terminal presets can now be split-launched: right-click a preset to open its agent beside your current tab instead of replacing it.
- A full performance monitor now shows exactly which half of Cordy — the app itself, or the coding-agent workload — is using memory, down to the process.
- Settings can now list and select from the shells actually installed on your machine (PowerShell 7, Command Prompt, Git Bash, each WSL distribution, or a custom command).
- Project-wide search arrives in the side panel, with case-sensitivity, whole-word and regex options.
- File icons now appear everywhere files are listed, with a choice of icon themes including a colored, brand-accurate set.
- The Files and Git side panels no longer freeze the app while a coding agent writes many files, and the Git panel now reliably lists every untracked file.
- The Windows installer is not code-signed, so Windows SmartScreen shows an "unrecognised app" warning on first run; the performance monitor's Workload view is Windows-only.

### 0.2.0 — 2026-08-12

- Every workspace now has a built-in browser pane you can open beside the terminal, with tabs, navigation controls and a bookmarks bar.
- Coding agents can now use that browser too, either the built-in pane or a real Chrome session connected through the Cordy for Chrome extension, with an explicit pairing approval step.
- Launching a coding agent now opens a supervised terminal tab with a visible status badge (working / waiting / exited / failed), instead of running invisibly.
- The commit history view now expands each commit to its changed files, with syntax-highlighted diffs and infinite scrolling through history.
- New diagnostics tools let you export a time-scoped log bundle and see a breakdown of disk usage, with one-click cache cleanup.
- Cordy now auto-detects the code editor installed on your machine instead of erroring until one is configured.
- Fixed passwords typed into the built-in browser being readable back through an agent's browser tool; credential fields are now excluded from that read path.
- Fixed opening a URL in the built-in browser failing silently when the browser had already normalized the address.

### 0.1.3 — 2026-07-15

- Fixed three distinct Chinese IME character-loss bugs in the terminal, including one where already-typed text before a composition could be silently truncated.
- Voice-dictation tools that paste without a simulated keyboard can now paste into terminals again.
- Fully quitting and reopening Cordy no longer corrupts a restored terminal's display.
- The Source Control view now reliably stays in sync with your working tree after staging, discarding or pulling changes.
- Added Zen Mode, a Commit Graph tab, git status indicators in the file tree, and renamable terminal tabs.
- Added local, on-device crash and log diagnostics, never uploaded anywhere.
- This is a source-only release, like 0.1.2 and 0.1.1: no packaged installer is attached.

### 0.1.2 — 2026-07-12

- Restoring Cordy, from the tray or a reload, now returns to the workspace you actually left active, instead of always the most recently created one.
- Chinese IME input in terminals is reliable again for long sentences, with the candidate window staying in place.
- Switching back to a terminal no longer briefly shows a stale, cursor-less frame.
- Windows terminals now run on the modern, Microsoft-signed Windows Terminal engine, so tools like Codex correctly detect light vs. dark themes.
- This is a source-only release, like 0.1.1: no packaged installer is attached.

### 0.1.1 — 2026-07-11

- Fixed duplicated shell startup output appearing after reopening the window or restoring from the tray.
- Full-screen terminal UIs (an editor, a monitor, a coding agent) are now correctly rebuilt after a reload or tray restore, instead of only redrawing on their next update.
- This is a source-only release: no packaged installer is attached while the packaging pipeline is paused.

### 0.1.0 — 2026-07-11

- First public release of Cordy, a local-first personal AI coding workbench for Windows, macOS and Linux.
- Launch and supervise multiple CLI coding agents (Claude Code, Codex, Cursor Agent, Gemini CLI, OpenCode and others) side by side, each in its own isolated, Git-worktree-backed workspace.
- A background runtime keeps terminals, TUIs and running agents alive across app reloads, window crashes, and closing to the tray on Windows.
- Includes a command palette, a Files/editor panel, a Git panel with hunk-level staging, per-workspace notebooks, and custom themes.
- Live status monitoring, per-agent diff aggregation, and notifications tell you when an agent finishes or needs attention.
- Everything is stored locally on your machine; Cordy does not store, proxy or read your agents' prompts or responses, and does not embed its own chatbot.
- This is a source-only release: no packaged installer is attached.
- No code-signing certificate yet, so Windows SmartScreen and macOS Gatekeeper will warn on first launch; there is no auto-update; and full-screen terminal UIs redraw on their next update rather than being perfectly restored after a reload.

## Cordy for Chrome

### 2.5.4 — 2026-09-16

- Updated the bundled privacy policy (English and Chinese) to more clearly distinguish local browsing data you have on your device from content you explicitly attach with @ mentions or that AI tools retrieve, including tab and bookmark titles, URLs, and visit times pulled into history-based context.
- Removed outdated descriptions of AI bookmark tagging and categorization, and removed the incorrect claim that history and tab data never leave your device.
- Clarified how API keys authenticate your requests to an AI provider, what data-use consent applies when using cloud AI, and the difference between on-device inference and AI running on a runtime endpoint you configure yourself.
- This is the version currently published on the Chrome Web Store. The `.zip` attached to this release is the same reviewed package, provided so it can be audited — not as an alternate way to install.

### 2.5.3 — 2026-09-16

- Removed the custom New Tab page (its clock, wallpaper, and quick links), keeping the extension focused on its core productivity features.
- Moved search back to the Dashboard with its own navigation entry restored; you can still scope a search to bookmarks, history, open tabs, read-later items, or collections, and general web search continues to use your default search engine.
- Search results now open in a new tab, or bring an existing matching tab into focus, while the Dashboard search page stays open for further searching.
- Removing the New Tab feature does not delete any wallpaper or preference data you had previously saved.
- Updated the Chrome Web Store listing and screenshots to remove New Tab promotional material.

### 2.4.4 — 2026-09-10

- Redesigned the sidebar navigation: it keeps a fixed, predictable order and clearly highlights the page you're on, with more compact icons and spacing.
- The active navigation item is now visually connected to its page's toolbar with a continuous highlight line.
- Fixed a glitch where dismissing a tooltip could briefly make the page layout jump.
- The Current / History / Read Later / Collections tabs moved to the right side of the page toolbar, with their counts shown as numbers next to the icons.
- Added full appearance settings to both the side panel and the dashboard: choose a light, dark, or system theme, and pick from eight built-in themes (including Catppuccin, Nord, and Dracula) plus four fonts, all synced across the extension and available offline.
- Your chosen font applies to interface text and content while code stays in a monospace font; new-tab wallpaper settings remain independently configurable.
- Added contextual help for the new appearance settings and a way to reset only appearance, with support for all 12 languages and narrow window layouts.

### 2.4.3 — 2026-09-08

- Data cleanup tools no longer delete your bookmarks: both full and selective cleanup now leave bookmark data and your Chrome bookmarks untouched; deleting API keys remains a separate, explicit choice.
- Fixed incorrect coloring on destructive action buttons, and you can now clean up application data even when you have no chat messages yet.
- Reorganized the sidebar's bookmark tools into clearer Refresh, View, and More buttons, moving sorting and collapse options into menus.
- The command palette now follows your light, dark, or system theme and shows Cordy's logo in its search bar.
- Added page headings to Overview, Search, AI Management, Browsing History, Read Later, Bookmarks, and Settings for easier orientation.
- Redesigned AI provider settings around a searchable list of providers with one editor open at a time, plus a separate tab for choosing which model handles each feature, with contextual help throughout.
- You can now generate and compare multiple answer versions for a single message, and branch a conversation by continuing from an earlier answer or editing a previous prompt, without losing the original thread.
- Translation settings (runtime, source/target languages, last-used models) now persist across sessions; long translations are no longer cut off partway through, and failures now explain which part of the text failed.

### 2.4.2 — 2026-09-04

- Important: this version requires Chrome 148 or later (previously 142), because it relies on Chrome's built-in AI features that only fully work starting in Chrome 148; Chrome 142–147 can no longer install or update the extension.
- Unified the model picker used across the dashboard, side panel settings, translation, and chat composer into one consistent picker, with clearer provider status indicators and pricing now shown correctly in USD per million tokens.
- Translation: identical source and target languages now pass text through unchanged instead of being rejected or unnecessarily billed to a cloud or local model; the translation workbench also gained a swap button and a resizable side-by-side view.
- Bookmarks: a small toolbar badge now shows whether the current page is already saved; the bookmarks sidebar gained a proper tree view that stays smooth with large libraries, and the collections start page loads noticeably faster.
- Data management: automatic cleanup now defaults to "notify only" instead of silently deleting data, and can be turned off; "Delete all data" now actually deletes everything it claims to, with API keys as a separate opt-in checkbox, and deleting a bookmark always removes it from Chrome too.
- Chat: your messages now render exactly as typed, the "clear" command resets the view without jumping around, and several cases where a message chain or attachment could silently vanish or hang are fixed.
- Security: after you revoke a site's permission, any of Cordy's scripts still running on already-open tabs of that site immediately lose access to cloud AI, page content, and text-to-speech; dead-link checking no longer contacts sites you haven't granted access to.
- Reduced the install size from roughly 50MB to 32MB, and fixed several local audio and AI playback issues, including a voice pack file that had been silently rejected.

### 2.4.1 — 2026-08-13

- Fixed a serious bug where the offline "clean up dead links" tool could end up with every bookmark in your library pre-selected for deletion, including live links it simply couldn't reach at that moment; now only bookmarks confirmed to be genuinely dead are pre-selected, and everything else stays visible and can still be removed individually.
- Fixed backup restore being completely broken for any backup that included chat history — restoring now actually works.
- Fixed the duplicate-bookmark cleanup step, which previously could not be used at all, and would otherwise have removed every copy of a duplicate instead of keeping one.
- Security: bookmarks, browsing history, and open tabs could previously be read by a script on any page you had granted access to — even without opening Cordy's command palette, and even after you'd revoked that site's access if a script was already running there. Both gaps are closed: reading now requires you to have just opened the palette, and access ends immediately when you revoke a site's permission.
- Security: closed a way a malicious page or a bookmark title could smuggle instructions past Cordy's "untrusted content" boundary, and restricted which browser addresses and windows Cordy's tools are allowed to open or focus.
- Fixed switching AI models mid-conversation silently shrinking the available context window, which could cause part of what you sent to be dropped without warning.
- Editing a previously saved tab now actually works (it had shown a "coming soon" message since it was first added), and batch actions in Collections and Read Later are now reachable from the interface.
- Translated roughly 5,500 previously English-only interface strings across all 12 supported languages, and added proper right-to-left layout support for Arabic.

### 2.4.0 — 2026-08-12

- Removed AI-powered bookmark tagging, categorization, and the "Insights" summary feature; your existing bookmarks and tags are unaffected, but new AI tags or summaries can no longer be generated from this version onward.
- Removed the experimental cross-device "browser connector" companion feature entirely; it never shipped in a stable release, so most users will not notice any difference.
- As a result, Cordy no longer requests the "communicate with native applications," "show notifications," or "debug this browser" permissions, shrinking the install-time permission prompt.
- Bookmarks: the list now supports checkbox multi-select with bulk rename, move, tag, and delete; column sorting; and a full folder-path column. "Open all" gained current-window, new-window, and tab-group options with a confirmation for large batches, and bookmark icons now load instantly from Chrome itself.
- Collections (saved groups of tabs) gained pinning, archiving, duplicate removal, paste-to-import, four copy formats, and the option to reopen automatically when the browser starts.
- Browsing history is now grouped by day (Today, Yesterday, older dates) with quick filters for the last 3, 7, or 30 days, or a custom range — the same filter was added to conversation history.
- Added a single-turn mode toggle for chat, so a conversation can skip carrying forward earlier context when you want a clean, one-off exchange.
- Refreshed the visual design with a unified icon-button style, a simplified two-group sidebar, and a redesigned date-range picker.

### 2.3.3 — 2026-07-16

- Restructured the Settings page for clearer organization, and added local, exportable logs so you can see what happened during a session.
- Chat now shows a context-usage ring so you can see how much of the model's context window a conversation is using, and conversations are automatically named after your first message.
- Reopening or switching back to a chat panel no longer drops its context, and messages interrupted mid-reply are now clearly marked as incomplete instead of looking finished.
- Text-to-speech playback speed is now kept within a sane range and takes effect immediately when changed.
- Bookmarks gained AI-generated tags and summaries, plus new domain and grid view layouts.
- Site-access permissions are now requested only when needed rather than granted automatically at install, and several inaccuracies in the bundled privacy policy were corrected.
- Completed translations for the context-usage ring, bookmarks, settings, and other recently added features across all 12 supported languages.

### 2.3.2 — 2026-07-12

- Rebuilt the chat engine end to end: branching a conversation, by editing a past message or continuing from an earlier answer, is now handled correctly everywhere, and having the same conversation open in two windows no longer corrupts message order.
- Stopping a reply partway through no longer discards it — the partial answer is saved, and tool actions you declined now show as declined instead of appearing to hang or silently succeed.
- Opening a chat with hundreds of past messages is noticeably faster, with older messages loaded in on demand.
- Before anything is sent to a cloud AI provider for the first time, you'll see a one-time consent prompt explaining what will be shared, which you can withdraw at any time from Settings → Data & Privacy.
- Site permissions are now optional: after upgrading, in-page features like the text-selection assistant need to be re-enabled once from Settings → General (the side panel is unaffected); the text-selection popup can also be turned off entirely.
- Local AI and text-to-speech fixes: a crash affecting certain emoji or foreign-language text is fixed, downloading a local AI model can now be cancelled cleanly, and the Hindi local voice pack has been removed — Hindi text now uses your system's voice instead.
- Reduced the extension's install size from about 97MB to 25.5MB.
- Browsing history, read-later, favorites, and conversation history are now part of the main dashboard, and bookmarks gained a real folder tree you can reorganize by dragging.

### 2.3.1 — 2026-06-24

- Page content and text you select on a page are now always treated as untrusted input before being sent to the AI, closing a way malicious page content could hijack the assistant's instructions.
- Added a master switch to disable the AI's ability to use browser tools (like opening tabs) entirely, and turned on manual approval by default for any tool action that writes data or does something sensitive.
- Added one-click "collect all tabs" — save every open tab and close them at once, with restoring a tab removing it from the saved list — available from the toolbar icon's right-click menu or a keyboard shortcut.
- Added full-text search across your conversation history, and quick AI actions you can run directly from an open tab.
- Added a per-conversation token-usage view, and translation results can now be compared side by side across multiple runs.
- History and bookmark access are now requested only when needed instead of required at install, and a backup file now has to match the expected format and version before it can be imported.
- Performance: on-page text-selection features unload after a minute of inactivity to save memory, streaming replies keep the extension active so long conversations no longer fail with a fetch error, and reply text now streams in noticeably smoother instead of in stuttering bursts.
- Fixed several rough edges, including switching conversation tabs with a touchpad and a text-selection menu that could get stuck if dismissed and reopened quickly.

### 2.3.0 — 2026-06-15

- You can now bring browser content into a chat by typing @ and picking an open tab, bookmark, or history entry; the referenced page's content is automatically pulled in as context for the AI.
- Added a dedicated Translation page in the dashboard: choose source and target languages and a default, local, or cloud translation engine, translate long text in chunks with live streaming output, and stop, retry, copy, or clear at any time.
- Chat context is now assembled based on an actual token budget rather than a fixed number of past messages, so more relevant history fits without exceeding the model's limit; a banner now tells you when older messages had to be left out, and long conversations can be automatically compressed into a summary (with an undo option) to save space.
- Added support for connecting to AI models running on your own machine or network (Ollama, LM Studio, llama.cpp, vLLM, LocalAI, or any OpenAI-compatible endpoint), shown as its own category alongside Chrome's built-in AI and in-browser models.
- Added two new cloud AI providers (Vercel AI Gateway and Volcano Engine's Ark platform) and cloud text-to-speech through Volcano Engine's voice synthesis service, with its own voice library and preview.
- Rebuilt the command palette with better search ranking, recent-history suggestions, and tab navigation, plus an inline confirmation step before destructive actions.
- Browsing history in the tabs panel is now deduplicated and sorted by how frequently and recently you visit each page, instead of a flat list capped at 200 raw entries, and bookmarks now sync automatically into the dashboard.
- Performance: the assistant's on-page interface now loads as a separate, smaller bundle so ordinary page loads are faster; opening a conversation with hundreds of messages is faster; and a reply in progress can now survive the extension's background process restarting instead of getting stuck.

## CordyAI

### 0.5.0 — 2026-07-16

- End-to-end image input with photo picker, camera, and share-to-app integration, plus vision model capability checking
- Voice input with editable transcripts
- Real-time Markdown rendering during response streaming
- Dynamic model catalog with pricing and token usage analytics
- Support for OpenRouter reasoning models and Anthropic prompt caching
- Generations continue across conversation, provider, or model switches
- Enhanced security: attachments excluded from backup, iOS file encryption at rest, sensitive header redaction, and encrypted credential storage
- This is a changelog-only release; no public build is available for download

## Tabmori

_No public release yet._
