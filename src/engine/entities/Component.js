export class Component {
  constructor() {
    this.entity = null;
    this.enabled = true;
  }
  get context() { return this.entity?.context ?? null; }
  onAttach() {}
  onDetach() {}
  update() {}
  render() {}
  destroy() {}
}
