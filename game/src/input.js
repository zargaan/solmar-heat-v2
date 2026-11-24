// Keyboard and mouse input for Solmar Heat.
// Tracks held keys by code, the mouse position over the canvas, and clicks.
// The game reads this every frame; it never reads the DOM directly.
export function createInput(canvas) {
  const keys = {};
  const mouse = { x: 0, y: 0, down: false, clicked: false };

  const onKeyDown = (e) => {
    keys[e.code] = true;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
  };
  const onKeyUp = (e) => {
    keys[e.code] = false;
  };
  const onMouseMove = (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  };
  const onMouseDown = (e) => {
    mouse.down = true;
    mouse.clicked = true;
    onMouseMove(e);
  };
  const onMouseUp = () => {
    mouse.down = false;
  };

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mouseup', onMouseUp);

  return {
    keys,
    mouse,
    down(code) {
      return !!keys[code];
    },
    axis() {
      let x = 0;
      let y = 0;
      if (keys['KeyA'] || keys['ArrowLeft']) x -= 1;
      if (keys['KeyD'] || keys['ArrowRight']) x += 1;
      if (keys['KeyW'] || keys['ArrowUp']) y -= 1;
      if (keys['KeyS'] || keys['ArrowDown']) y += 1;
      return { x, y };
    },
    pressed(code) {
      if (keys[code]) {
        keys[code] = false;
        return true;
      }
      return false;
    },
    consumeClick() {
      const c = mouse.clicked;
      mouse.clicked = false;
      return c;
    },
  };
}
