module.exports = {
  plugins: [
    '@codeciting/site'
  ],
  themeConfig: {
    logo: '/site-icon.svg',
    nav: [
      { text: 'Home', link: '/' },
      { text: '@Jagger', link: '/articles/jagger/' },
      { text: '@Asuio', link: '/articles/asuio/' },
      {
        text: 'Projects', items: [
          { text: 'VuePress Plugins', link: 'https://github.com/codeciting/codeciting-vuepress-plugins' },
          { text: 'SpringBoot Runner', link: 'https://github.com/codeciting/springboot-runner' }
        ]
      },
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
    },
    lastUpdated: true,
    repo: 'codeciting/codeciting.com',
    repoLabel: 'Join us!',
    docsRepo: 'codeciting/codeciting.com',
    docsDir: '',
    docsBranch: 'master',
    editLinks: true,
    editLinkText: 'Help us improve this page!'
  }
}
