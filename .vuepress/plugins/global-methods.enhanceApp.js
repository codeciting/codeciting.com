export default ({ Vue }) => {
  Vue.mixin({
    methods: {
      $since (year) {
        return (new Date()).getFullYear() - year
      }
    }
  })
}
