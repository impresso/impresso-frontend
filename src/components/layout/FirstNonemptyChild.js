export default {
  render() {
    if (this.$slots.default === undefined) return undefined;
    const nonEmptyNodes = this.$slots.default.filter(s => s.tag !== undefined);
    return nonEmptyNodes.length > 0
      ? [nonEmptyNodes[0]]
      : [this.$slots.default[0]];
  },
};
