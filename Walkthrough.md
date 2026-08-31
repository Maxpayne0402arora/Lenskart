# Walkthrough — Lenskart Vision Check (Minimalist & Home Flow)

We have updated the parent portal to use a **minimalist Lenskart banner ad** (matching the premium Hustlr Club style) and added **"Go to Homepage"** navigation options to prevent parent screens from looking dead. Additionally, we simplified the child's game by removing double-point streak pop-ups.

The application is served live at **[http://localhost:5173/](http://localhost:5173/)**.

---

## 📱 Minimalist & Home Flow Details

1. **Minimalist Generic Lenskart Banner Ad**:
   - Replaced the personalized widget with a **sleek dark slate marketing banner ad** that matches Lenskart's premium look (similar to the "Join the Club" member ad).
   - It uses completely generic, un-personalized copy (e.g. *"Kids Vision Check at Home"*, *"Check your child's eyes in 60 seconds"*), since Lenskart does not know if the user has children or what their names are prior to starting the check.
2. **"Go to Homepage" Parent Callout**:
   - Once parent setup is completed, the parent is no longer trapped on a waiting screen.
   - Added a prominent **"Go to Homepage"** button on the `AWAITING_PLAY` screen.
3. **Awaiting Play Generic Banner Ad**:
   - When parents return to the Lenskart homepage after setup, they see a clean, dark-slate **"Awaiting Play"** banner: *"Setup Complete & Ready to Play. The Shape Chase game is ready! Launch from widget..."*
   - This resolves the "dead screen" look with completely generic, un-personalized copy matching the brand style.
4. **Real Eyeglasses Categories Grid**:
   - Rendered the "Eyeglasses with Power" categories grid exactly matching the circular demographic layout of Screenshot 1 (Men, Women, Kids, Co-Creator) with stylized borders and badges.
   - **Interactive shortcut**: Tapping the **"Kids"** category card directly launches the Kids Vision Check setup flow!
5. **Simplified Child Gameplay**:
   - Removed the double-point/double-score streak overlay pop-ups from the game loop to keep the child focused on symbol matching.
   - Removed the glasses checklist buttons and warning callouts from the PWA start lobby screen so that gameplay is clean and accessible immediately to any player (with or without glasses).
6. **Mascot Dino Real-time Distance Alerts**:
   - Redesigned the distance-warning overlay card to render the **Specsy Dino 🦖** mascot wiggling at the center, alongside a speech bubble card.
   - Shows wiggling Dino 🦖 speaking to the child directly: *"Lean Back! Move back a bit so we can keep playing!"* or *"Come Closer! Move slightly closer to catch the shapes!"* based on relative camera depth.
   - Fixed the Developer Simulation slider range (expanded bounds from `0.7` to `1.3` and corrected the screen-disable ID checking from `"GAME"` to `"PWA_GAME"` so that the sliders and checkboxes are active and unlocked during gameplay).
7. **Circular PWA Camera Preview**:
   - Embedded a real-time circular webcam thumbnail (`32x32` px) in the top-right corner of the PWA child game header bar.
   - This activates as soon as the walkthrough is dismissed, establishing visual feedback for the eye-tracking/distance monitoring subsystem.
8. **Dynamic Shufflable Shape Cards & Expanded Shapes Deck**:
   - Expanded the Lea Symbols shape deck to include **Star ⭐, Triangle 🔺, Moon 🌙, and Balloon 🎈** (for a total of 8 unique pediatric symbols).
   - The game deck now dynamically shuffles 4 slot options (representing the target shape and 3 random distractors) so the deck layout evolves on every trial.
   - Successfully matched shapes dynamically shrink (advance down the acuity ladder) to visually display visual threshold difficulty scaling.
9. **Floating Points Pride Celebration**:
   - Implemented Duolingo-styled bubble-font floating text animations (e.g. `+100 pts`, `+150 pts`) that pop up and rise above the selected card button upon correct matches, giving immediate positive reinforcement.

---

## 🚀 How to Run the Walkthrough

You can test the prototype in two ways:
* **Standalone HTML File**: Double-click [lenskart_vision_check.html](file:///Users/mayankarora/Documents/Portfolio/lenskart_vision_check.html) at the root of your workspace to open and run the entire mockup offline directly in any browser!
* **Local Development Server**: Open **[http://localhost:5173/](http://localhost:5173/)** (HMR enabled).
2. **Setup Phase (Parent)**:
   - In the **📱 Lenskart App** view, click **"Start 60s Check"** inside the minimalist dark banner ad.
   - Complete consent and mock widget installations (no camera calibration in parent setup flow).
   - On the setup complete screen, click the new **"Go to Homepage"** button.
   - Observe the Lenskart home page: it now displays the dark slate **"Awaiting Play"** banner indicating that the setup is ready and waiting for the child!
3. **Child Gameplay & Calibration**:
   - Toggle to **`🏡 Home Screen`** and tap the **white 2x1 Shape Chase widget** to start.
   - In the child's PWA startup, click **"Play Game (Shape Chase)"**.
   - Note that the camera calibration screen appears next (the child aligns their face with the webcam to lock in target distance!).
   - Tap **"Lock in Position"** to initiate the gameplay.
   - Notice the gameplay has no double-point streak alerts, keeping it simple.
   - Complete 12 rounds to check the emotional rose-holding mustache man celebration.
