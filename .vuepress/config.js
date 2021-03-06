module.exports = {
  theme: '@codeciting/codeciting',
  plugins: [require('./plugins/global-methods')],
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
            ['/articles/asuio/parallel/two', 'Java并发机制和底层实现原理'],
            ['/articles/asuio/parallel/three', 'Java内存模型'],
            // ['/articles/asuio/parallel/four', 'Java并发编程基础']
          ]
        }
      ],
      '/articles/asuio/jvm/': [
        {
          collapsable: false,
          children: [
            ['/articles/asuio/jvm/', 'Java内存区域与内存溢出异常'],
            ['/articles/asuio/jvm/two', '垃圾收集器与内存分配策略'],
            ['/articles/asuio/jvm/three', '类文件结构'],
            ['/articles/asuio/jvm/four', '虚拟机类加载机制'],
            ['/articles/asuio/jvm/five','虚拟机字节码执行引擎'],
          ]
        }
      ],
      '/articles/asuio/java8/': [
        {
          collapsable: false,
          children: [
            ['/articles/asuio/java8/','基础知识'],
            ['/articles/asuio/java8/two', '通过行为参数化传递代码']
          ]
        }
      ],
      '/articles/jagger/cv/': [
        {
          collapsable: false,
          children: [
            ['/articles/jagger/cv/', 'CV'],
            ['/articles/jagger/cv/coding-marks', '能力自评'],
          ]
        }
      ]
    },
    repo: 'codeciting/codeciting.com',
    repoLabel: 'Join us!',
    docsRepo: 'codeciting/codeciting.com',
    docsDir: '',
    docsBranch: 'master',
    editLinks: true,
    editLinkText: 'Edit this page'
  }
}
