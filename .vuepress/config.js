
module.exports = {
  plugins: [
    '@vuepress/last-updated',
    '@vuepress/nprogress'
  ],
  head: [
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://cdn.bootcss.com/KaTeX/0.11.0/katex.min.css'
      }
    ],
    [
      'script',
      {
        src: '/plugin-echarts.js'
      }
    ]
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
          collapsable: true,
          children: [
            ['/articles/asuio/paraller/', '并发编程的挑战'],
            ['/articles/asuio/paraller/two', 'Java并发机制和底层实现原理']
          ]
        }
        ],
       '/articles/asuio/jvm/': [
          {
            collapsable: false,
            children: [
              ['/articles/asuio/jvm/','Java内存区域与内存溢出异常'],
              ['/articles/asuio/jvm/two', '垃圾收集器与内存分配策略']
            ]
          }
        ],
    }
  },
  extendMarkdown: md => {
    require('./plugins/markdown-it/echarts')(md)
    md.use(require('./plugins/markdown-it/katex'))
    md.use(require('markdown-it-plantuml'), {
      server: 'https://api.codeciting.com/plantuml/',
      generateSource (source, config) {
        return `${config.server}?source=${encodeURIComponent((new Buffer(
          `
@startuml ${config.diagramName || 'uml'}
' auto injected theme
!include ${config.server}theme.puml

${source}
@enduml`
        )).toString('base64'))}`
      },
      render (tokens, idx, options, env, slf) {
        const token = tokens[idx]

        // "alt" attr MUST be set, even if empty. Because it's mandatory and
        // should be placed on proper position for tests.
        //
        // Replace content with actual value

        token.attrs[token.attrIndex('alt')][1] =
          slf.renderInlineAsText(token.children, options, env)

        token.attrs.push(['style', 'display: block; margin: 12px auto;'])
        return slf.renderToken(tokens, idx, options)
      }
    })
  }
}
