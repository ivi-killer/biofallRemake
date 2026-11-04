export class Renderer {
  static VERSION = "0.2.1";

  constructor(canvas, { background = "#101411" } = {}) {
    if (!(canvas instanceof HTMLCanvasElement)) throw new TypeError("Renderer necesita un elemento canvas.");
    const context = canvas.getContext("2d", { alpha: false, desynchronized: true });
    if (!context) throw new Error("El navegador no pudo crear un contexto Canvas 2D.");
    this.canvas = canvas;
    this.context = context;
    this.background = background;
    this.width = 0;
    this.height = 0;
    this.pixelRatio = 1;
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.resize();
  }

  resize() {
    const bounds = this.canvas.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    this.width = Math.max(1, bounds.width);
    this.height = Math.max(1, bounds.height);
    this.pixelRatio = pixelRatio;
    this.canvas.width = Math.round(this.width * pixelRatio);
    this.canvas.height = Math.round(this.height * pixelRatio);
    this.context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  clear() {
    const ctx = this.context;
    ctx.fillStyle = this.background;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  render() {
    this.clear();
  }

  destroy() {
    this.resizeObserver.disconnect();
  }
}
