const TawkTo = {
  install(Vue, options) {
    if (options.siteId) {
      /* eslint-disable */
      var Tawk_API = Tawk_API || {};
      var Tawk_LoadStart = new Date();
      (function() {
        var s1 = document.createElement("script"),
          s0 = document.body;
        s1.async = true;
        s1.src = `https://embed.tawk.to/${options.siteId}/default`;
        s1.charset = 'UTF-8';
        s1.setAttribute('crossorigin', '*');
        s0.appendChild(s1);
      })();
      /* eslint-enable */
    }
  },
};

export default TawkTo;
