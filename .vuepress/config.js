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
    ],
    sidebar: {
      '/articles/asuio/parallel/': [
        {
          collapsable: false,
          children: [
            ['/articles/asuio/parallel/', '并发编程的挑战'],
            ['/articles/asuio/parallel/two', 'Java并发机制和底层实现原理']
          ]
        }
      ],
      '/articles/asuio/jvm/': [
        {
          collapsable: false,
          children: [
            ['/articles/asuio/jvm/', 'Java内存区域与内存溢出异常'],
            ['/articles/asuio/jvm/two', '垃圾收集器与内存分配策略']
          ]
        }
      ]
    }
  }
}
