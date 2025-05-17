# Make-Your-Game (60FPS JavaScript Game)

A browser-based single-player game built entirely with plain JavaScript and HTML, designed to run smoothly at 60 FPS without using frameworks or `<canvas>`. This project was born out of a desire to fight boredom and challenge performance constraints using only the DOM and `requestAnimationFrame`.

## Project Objectives

- ✅ Achieve 60 FPS at all times — no frame drops.
- ✅ Use `requestAnimationFrame` effectively for all animations.
- ✅ Avoid jank/stuttering in all animations and input controls.
- ✅ Implement a Pause Menu with:
    - Continue
    - Restart
- ✅ Show a Scoreboard with:
    - Countdown Timer or Elapsed Time
    - Player Score (XP/Points)
    - Remaining Lives
- ✅ Support keyboard-only controls with smooth, continuous input.
- ✅ Use minimal, optimized layers for rendering (no overuse of DOM nesting).
- ❌ No external libraries or frameworks.
- ❌ No `<canvas>` usage — DOM-only graphics.

## Game Genre

This game follows a classic arcade genre from the Pre-Approved List:

(e.g., Tetris, Pac-Man, Brick Breaker, Donkey Kong, etc.)  
(Specify your genre here once finalized)

## How to Play

1. Clone this repository:

     ```bash
     git clone https://learn.zone01kisumu.ke/git/gonyango/make-your-game.git
     cd make-your-game
     ```

2. Open `index.html` in your browser.

     - Recommended: Chrome or Firefox
     - Use Developer Tools → Performance to monitor FPS

### Keyboard Controls

- Arrow keys / WASD to move (customized per game)
- `P` to pause/resume
- `R` to restart

## Tech Stack

- **HTML5** – Structure and layout
- **CSS3** – Styling, layering, and transitions
- **JavaScript (ES6+)** – Game engine, logic, animation
- **requestAnimationFrame** – Smooth animation timing
- **DevTools** – For FPS monitoring and optimization

## Concepts You’ll Learn

- Game loops with `requestAnimationFrame`
- The browser event loop & task scheduling
- DOM-based performance optimization
- Handling real-time keyboard input
- Reducing paint/layout costs
- Avoiding animation jank and stutter

## Developer Tips

Use Chrome/Firefox Performance tab to:

- Analyze FPS and execution time
- Check paint frequency and layer updates
- Use Paint Flashing to optimize DOM paints

Keep an eye on:

- Layout Thrashing
- Inefficient DOM updates
- Expensive reflows

## License

This project is licensed under the MIT License.

## Authors

Made with ❤️ and a craving for dopamine by:

- [**Maina Nyagooh**](https://www.linkedin.com/in/maina-anne-37797820b/)
- [**Granton Onyango**](https://www.linkedin.com/in/granton-onyango/)