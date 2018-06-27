<template lang="html">
  <div class="">
    <div class="title">fghfghfhg{{test}} {{title}} (dl:{{dl}})</div>
    <div class="actions">
      <a href="#" title="read"><span class="eye icon"></span></a>
      <a href="#" title="add to ..."><span class="plus icon"></span></a>
      <a href="#" title="cite article"><span class="left-double-quote icon"><i></i></span></a>
      <a href="#" title="more actions"><span class="more icon"></span></a>
    </div>
  </div>
</template>

<script>
export default {
  props: ['title', 'dl'],
};
</script>

<style scoped lang="less">
@import "./../../assets/less/style.less";

div.actions {
  a {
      // display: flex;
      // align-items: center;
      // justify-content: center;
      height: 2em;
      opacity: 0.6;
      font-size: 0.8em;
      display: table-cell;
      color: @clr-black;
      padding: 0 30px 5px 10px;
      text-transform: uppercase;
      border-right: 1px solid @clr-teal-400;
      //background: linear-gradient(to bottom, white 50%, @clr-teal-200 50%);
      // background-size: 100% 200%;
      // background-position: top;
      transition: color 0.16s ease-in;
      &:hover {
          // color: @clr-black;
          opacity: 1;
          text-decoration: none;
      }
      span {
          display: block;
      }
    }
    a:first-child {
        padding-left: 0;
        margin: 0;
    }
    a:last-child {
        border-right: none;
        padding-right: 20px;
    }
  }
// end .action-overlay

.articleOverlay.highlight {
    .region {
    opacity: 1;
  }
  .action-overlay {
    // display: block;
    transform: scale(1);
    opacity: 1;
  }
}
</style>
