module.exports = function installEChartsPlugin (md) {
  md.use(require('markdown-it-container'), 'echarts', {

    validate (params) {
      params = parseParams(params)
      return params !== null && params.length <= 3
    },

    render (tokens, idx) {
      if (tokens[idx].nesting === 1) {
        const params = parseParams(tokens[idx].info)

        let version, width, height

        if (params.length === 0) {
        } else if (params.length === 1) {
          version = params[0]
          width = '600px'
          height = '400px'
        } else if (params.length === 2) {
          version = '4.2.1'
          width = params[0]
          height = params[1]
        } else if (params.length === 3) {
          version = params[0]
          width = params[1]
          height = params[2]
        }

        return `<div style="display: none;" data-echarts data-echarts-version="${version}" data-echarts-width="${width}" data-echarts-height="${height}">`
      } else {
        return '</div>'
      }
    }
  })

  function parseParams (params) {
    const m = params.trim().match(/^\s*echarts\s*(.*)$/)
    if (!m) {
      return null
    }
    const [, argsStr] = m
    return (argsStr || '').trim().split(/\s+/)
  }
}
