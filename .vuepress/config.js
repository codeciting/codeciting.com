
module.exports = {
  plugins: [
    '@vuepress/last-updated',
    // '@vuepress/nprogress',
    '@codeciting/site'
  ],
  themeConfig: {
    logo: '/site-icon.svg',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Jagger', link: '/articles/jagger/' },
      { text: 'Asuio', link: '/articles/asuio/' },
      { text: 'Changelog', link: '/changelog' }
    ]
  }
}
