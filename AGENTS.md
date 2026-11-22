<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AdSense SEO Content Rule
When creating a new game, ALWAYS include a `<GameSEO>` component at the bottom of the page in `src/app/games/[game_name]/page.tsx`. This component must include a detailed description, How to Play instructions, Game Features, and FAQs. This is critical to avoid "Low value content" penalties from Google AdSense. Do not create games with only a canvas or empty pages.

# Leaderboard Score Submission Rule
When creating a new game, ALWAYS integrate the `<SubmitScoreModal>` component for leaderboard score submission. Follow this exact pattern:

1. **Import** at the top of the game component file (`src/games/[game_name]/[GameName].tsx`):
   ```tsx
   import SubmitScoreModal from "@/components/SubmitScoreModal";
   ```

2. **Add state** inside the component:
   ```tsx
   const [showSubmitModal, setShowSubmitModal] = useState(false);
   ```

3. **Trigger the modal** when the game ends (on game-over, win, or level complete):
   ```tsx
   setShowSubmitModal(true);
   ```

4. **Render the modal OUTSIDE any `overflow-hidden` container** (use a React fragment `<>...</>` if needed):
   ```tsx
   <SubmitScoreModal
     isOpen={showSubmitModal}
     score={computedScore}
     gameId="game-slug"
     onClose={() => setShowSubmitModal(false)}
   />
   ```

5. **Important rules:**
   - The `gameId` MUST match the game's slug from `src/lib/games.tsx`
   - The `score` MUST be a number — compute it from the game's native metrics (time, moves, points, etc.)
   - NEVER render `<SubmitScoreModal>` inside a div with `overflow-hidden` — it clips the fixed-position modal. Place it as a sibling outside the game container.
   - If the game container has a global `onClick` handler (like tap-to-play games), guard it: `if (showSubmitModal) return;` at the top, and use a `useRef` if the handler is captured in a `useEffect` closure.
   - For 2-player/AI games (Chess, Tic-Tac-Toe, Connect4), only trigger the modal when playing vs AI and the human wins.
   - Add a "Save Score" button on the game-over overlay as an alternative trigger: `onClick={(e) => { e.stopPropagation(); setShowSubmitModal(true); }}`
