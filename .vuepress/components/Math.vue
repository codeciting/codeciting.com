<template>
  <span>
    <slot />
  </span>
</template>

<script>


  import { loadJS } from '../lib/require'

  export default {
    name: 'Math',
    mounted () {
      this.transform()
    },
    updated () {
      this.transform()
    },
    methods: {
      transform () {
        loadJS('//cdn.bootcss.com/mathjax/2.7.5/MathJax.js?config=TeX-AMS_HTML').then((firstLoad) => {
          if (firstLoad) {
            window.MathJax.Hub.Config({
              tex2jax: {
                inlineMath: [ [ '$', '$' ] ],
                displayMath: [ [ '$$', '$$' ] ],
                processEscapes: true,
                showProcessingMessages: false,
                processEnvironments: true
              },
              // Center justify equations in code and markdown cells. Elsewhere
              // we use CSS to left justify single line equations in code cells.
              displayAlign: 'center',
              'HTML-CSS': {
                styles: { '.MathJax_Display': { margin: 0 } },
                linebreaks: { automatic: true }
              }
            })
          }
          console.log(this.$el.innerHTML)
          window.MathJax.Hub.Queue([
            'Typeset',
            window.MathJax.Hub,
            this.$el
          ])
        })
      }
    }
  }
</script>
