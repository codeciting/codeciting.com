const path = require('path')

module.exports = {
  head: [
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://cdn.bootcss.com/KaTeX/0.6.0/katex.min.css'
      }
    ]
  ],
  themeConfig: {
    logo: '/site-icon.svg',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Jagger', link: '/articles/jagger/' },
      { text: 'Asuio', link: '/articles/asuio/' }
    ]
  },
  extendMarkdown: md => {
    md.use(require('markdown-it-katex'))
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
