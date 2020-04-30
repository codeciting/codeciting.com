export default ({ Vue, router }) => {
  Vue.mixin({
    methods: {
      $since (year) {
        return (new Date()).getFullYear() - year
      }
    }
  })
  const component = router.getMatchedComponents({ path: '/' })[0]
  component.mixins.push({
    mounted () {
      addBeian.call(this)
    },
    updated () {
      addBeian.call(this)
    }
  })
}

function addBeian () {
  if (this.$el && this.$el.getElementsByClassName) {

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
