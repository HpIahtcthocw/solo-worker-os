# Product Avatar / Logo Prompt for GPT (DALL-E / ChatGPT)

Copy the prompt below and paste it into ChatGPT (with DALL-E) or any AI image generator:

---

## Prompt

Design a modern, minimalist app icon for "Solo Worker OS" — an AI-native freelance operating system. The icon should convey: AI intelligence, solo/individual empowerment, and business management.

**Design requirements:**

- A hexagonal or rounded-square shape with a soft glow effect
- Center motif: a stylized letter "S" that doubles as a speech bubble (representing conversation-driven interface) — the tail of the speech bubble forms the bottom curve of the "S"
- Around the "S": subtle orbital rings or node connections, suggesting an "operating system" that connects multiple tools and workflows
- Color palette: warm amber gradient (#f59e0b → #d97706) as primary, with a subtle deep-space dark background (#0a0a0f)
- Style: glassmorphism with frosted glass texture, soft inner glow, and a subtle reflection at the bottom
- No text other than the "S" monogram — clean, recognizable at 32x32px
- Professional, premium feel — think Linear, Raycast, or Arc browser icon quality
- Square format, 1024x1024

**Avoid:** generic robot/brain icons, excessive detail, 3D render look, multiple letters, text strings

---

## Alternative Prompt (simpler, more abstract)

Create a minimalist app icon for an AI-powered business tool called "Solo Worker OS." The design features an abstract geometric symbol: a single luminous node (amber/gold) connected to 5-6 smaller satellite nodes via thin lines, arranged in a hexagonal pattern. The central node pulses with a warm amber glow (#f59e0b), while satellite nodes are slightly dimmer. Dark background (#0a0a0f). Glassmorphism style with frosted glass effect, soft shadows, and clean modern aesthetics similar to Linear or Raycast icons. No text. Square 1024x1024.

---

## How to Use the Generated Logo

1. Save the generated image as `public/logo.png` in the project
2. The app will automatically use it (Nav component reads `localStorage` key `solo-worker-avatar`)
3. To set it permanently, replace the fallback "S" letter in `components/Nav.tsx` with:
   ```tsx
   <img src="/logo.png" alt="Solo Worker OS" className="h-9 w-9 rounded-xl object-cover ring-1 ring-inset ring-white/30 shadow-glow-amber" />
   ```
4. Also set it as favicon by adding to `app/layout.tsx`:
   ```tsx
   export const metadata = {
     icons: { icon: '/logo.png', apple: '/logo.png' },
     // ... existing metadata
   };
   ```
