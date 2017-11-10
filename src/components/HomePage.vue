<template>
<main>
  <div id="splash">
    <div class="backdrop"></div>
      <h1 class="slogan">Media Monitoring<br>of the Past</h1>
  </div>
  <div class="container pt-3">
    <h1>This is the homepage</h1>
    <p>Here you can do anything you want</p>
  </div>
</main>
</template>

<script>
export default {
  name: 'HelloWorld',
};
</script>

<style scoped lang="less">
@font-face {
    font-family: JosefinSans;
    src: url('./../assets/fonts/Josefin_Sans/JosefinSans-Bold.ttf');
    font-weight: bold;
    font-style: normal;
}
@font-face {
    font-family: JosefinSans;
    src: url('./../assets/fonts/Josefin_Sans/JosefinSans-Regular.ttf');
    font-weight: normal;
    font-style: normal;
}
@font-face {
    font-family: JosefinSans;
    src: url('./../assets/fonts/Josefin_Sans/JosefinSans-Thin.ttf');
    font-weight: lighter;
    font-style: normal;
}

#splash {
    height: 300px;
    background: url('./../assets/img/Benefits-of-nature-Hike.jpg') no-repeat center 40%;
    -webkit-background-size: cover;
    -moz-background-size: cover;
    -o-background-size: cover;
    background-size: cover;
    position: relative;

    .backdrop{
      background: #234;
      opacity: .7;
      position: absolute;
      width: 100%;
      height: 100%;
    }

    .slogan {
        font-family: JosefinSans;
        position: absolute;
        top: 50%;
        margin-top: -1em;
        width: 100%;
        text-align: center;
        color: white;
        font-size: 3em;
    }
}

.HomePage {}
</style>
