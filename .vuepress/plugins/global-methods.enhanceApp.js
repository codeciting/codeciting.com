export default ({ Vue, isServer }) => {
  Vue.mixin({
    methods: {
      $since (year) {
        return (new Date()).getFullYear() - year
      }
    },
    mounted () {
      if (this.$el && this.$el.classList && this.$el.classList.contains('theme-container')) {
        const footer = this.$el.getElementsByClassName('footer')[0]
        if (footer) {
          if (footer.getElementsByClassName('beian').length === 0) {
            const beianEl = footer.ownerDocument.createElement('a')
            beianEl.href = 'http://www.beian.miit.gov.cn/'
            beianEl.target = '_blank'
            beianEl.innerText = '辽ICP备16018554号'
            footer.appendChild(footer.ownerDocument.createElement('br'))
            footer.appendChild(footer.ownerDocument.createElement('br'))
            footer.appendChild(beianEl)
          }
        }
      }
    }
  })
}
