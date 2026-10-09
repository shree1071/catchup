# 🚀 Hackathon 2026 — Quick Adaptation Guide

This project is built directly on the **Raycast Design System (Midnight Command Center & Coral Neon)**:
- **Canvas:** `#040506` (Void Black)
- **Surfaces:** `#07080a` (Ink), `#111214` (Obsidian), `#1b1c1e` (Graphite)
- **Accent:** `#ff6363` (Coral Pulse) rationed strictly for brand identity, AI badges, and active selections
- **Typography:** Inter (56px 400 hero heading with +0.22px tracking) & Geist Mono for technical micro-labels
- **Tactile Details:** Inset keyboard-key shadow stacks and hairline borders

---

## ⚡ How to Adapt This for Tomorrow's Problem Statement in 60 Seconds

All content, features, commands, and metadata are centralized in a single file:
👉 **[`src/config/siteConfig.ts`](file:///d:/projects%202026/ai/src/config/siteConfig.ts)**

When the Problem Statement (PS) is announced tomorrow:

### 1. Update Project Name & Tagline
Open `src/config/siteConfig.ts` and modify:
```typescript
export const defaultSiteConfig: SiteConfig = {
  hackathonName: "HACKATHON 2026",
  projectName: "YOUR_PROJECT_NAME",       // e.g. "NEUROCARE // AI"
  tagline: "Your killer 1-sentence punchline",  // 56px hero headline
  subheadline: "2-3 sentences explaining your solution to the PS...",
  heroBadgeText: "YOUR TRACK • HACKATHON 2026",
  installCommand: "npm run demo",
  // ...
};
```

### 2. Update Feature Cards
In `features: [...]`, change the 6 items to match your hackathon project architecture:
- `title`: Core capability (e.g., "Vector Graph RAG", "Sub-5ms Inference", "Zero-Knowledge Vault")
- `description`: Plain-English explanation of why your solution wins
- `metric` & `metricLabel`: Impressive stats to show judges (e.g. `99.4%` accuracy, `4.2ms` latency)
- `icon`: Any Lucide icon name (`Zap`, `Bot`, `Cpu`, `ShieldCheck`, `Layers`, `Activity`, `Database`, `Sparkles`, etc.)

### 3. Update the Interactive Command Palette & Launcher
In `commands: [...]`, list the actions your team is demonstrating to judges:
- e.g. "Spawn Clinical Diagnosis Agent", "Run Live Fraud Benchmark", "Connect Healthcare EHR"
- When you click or press `Enter` on any command during your pitch, it triggers interactive visual feedback!

---

## 🎮 Live Testing & Demo Presets (Interactive Drawer)
You can also tweak everything directly in the browser!
1. Click the **"Problem Statement"** button in the top navigation or the **"Hackathon PS Config"** pill at the bottom-left.
2. Choose from 4 ready-to-use domain presets:
   - **AI Agent & DevTools**
   - **Healthcare & Clinical AI**
   - **Fintech & Fraud Sentinel**
   - **Cyber Security & Zero Trust**
3. Or type your exact hackathon problem text into the fields live!
4. Click **"Copy Config"** to save it to your codebase.

---

## 💻 Running the Project
- **Dev Server:**
  ```bash
  bun run dev
  # Server running at http://localhost:5173
  ```
- **Production Build:**
  ```bash
  bun run build
  ```

---

## ⌨️ Interactive Keyboard Shortcuts
- Press **`⌘K`** (or **`Ctrl+K`**) anywhere on the page to open the full-screen Raycast command palette.
- Use **`↑` / `↓`** arrow keys to traverse commands and **`↵ Enter`** to execute.
- Press **`Esc`** to close.
