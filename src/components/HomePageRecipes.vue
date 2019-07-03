<template lang="html">
  <b-carousel
    class="recipe"
    style="text-shadow: 0px 0px 2px #000"
    indicators>
    <b-carousel-slide
      caption="This is the title of the slide"
      text="Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
      img-src="https://picsum.photos/1024/480/?image=10">
      <router-link class="btn btn-primary" :to="{ name: '', params: {} }">Perform this query</router-link>
    </b-carousel-slide>
    <b-carousel-slide
      caption="This is the title of the slide"
      text="Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
      img-src="https://picsum.photos/1024/480/?image=12">
      <router-link class="btn btn-primary" :to="{ name: '', params: {} }">Perform this query</router-link>
    </b-carousel-slide>
    <b-carousel-slide
      caption="This is the title of the slide"
      text="Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
      img-src="https://picsum.photos/1024/480/?image=22">
      <router-link class="btn btn-primary" :to="{ name: '', params: {} }">Perform this query</router-link>
    </b-carousel-slide>
  </b-carousel>
</template>

<script>
export default {
  data: () => ({

  }),
};
</script>

<style lang="scss">
  .recipe {
    .carousel-caption h3{
      color: white;
      font-weight: bold;
    }
  }

</style>
