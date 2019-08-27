+function () {

  var echartsInitialized = false

  define(document.getElementById('app'), function (app) {
    console.log(app)
    if (app === null) {
      document.onreadystatechange = function () {
        if (document.readyState !== 'complete') {
          return
        }
        __init()
      }
    } else {
      __init()
    }

    function __init () {
      define(document.getElementById('app').__vue__, function (app) {
        initEcharts(app)
      })
    }

    window.__vuepressPluginEChartsReload__ = __init
  })

  function initEcharts (app) {
    if (echartsInitialized) {
      updateECharts()
      return
    }
    echartsInitialized = true
    function init () {
      document.querySelectorAll('[data-echarts]').forEach(function (el) {
        var dataset = el.dataset
        if(el.getAttribute('_echarts_instance_')) {
          return
        }
        console.log(el, el.dataset)
        loadScript(dataset.echartsVersion, function () {
          define(el.innerText, function (text) {
            el.style.opacity = ''
            el.style.maxWidth = dataset.echartsWidth
            el.style.height = dataset.echartsHeight
            el.style.margin = '12px auto'
            el.style.overflow = 'scroll'
            define(echarts.init(el, 'default'), function (chart) {
              try {
                chart.setOption(eval('(' + text + ')'))
              } catch (e) {
                console.error(text + ' is not a valid js statement.')
              }
            })
          })
        })
      })
    }
    window.r = app.$router
    app.$router.afterEach(function() {
      app.$nextTick(init)
    })
    init()
  }

  function updateECharts () {

  }

  var map = {}

  function loadScript (version, callback) {
    if (map[version] === true) {
      callback()
      return
    } else if (Array.isArray(map[version])) {
      map[version].push(callback)
      return
    }
    define(document.createElement('script'), function (script) {
      function cb () {
        // initialize
        echarts.registerTheme('default', {
          'seriesCnt': '3',
          'backgroundColor': 'rgba(255,255,255,0)',
          'titleColor': '#666666',
          'subtitleColor': '#999999',
          'textColorShow': false,
          'textColor': '#333',
          'markTextColor': '#ffffff',
          'color': [
            '#4ea397',
            '#22c3aa',
            '#7bd9a5',
            '#d0648a',
            '#f58db2',
            '#f2b3c9'
          ],
          'borderColor': '#ccc',
          'borderWidth': 0,
          'visualMapColor': [
            '#d0648a',
            '#22c3aa',
            '#adfff1'
          ],
          'legendTextColor': '#999999',
          'kColor': '#d0648a',
          'kColor0': 'transparent',
          'kBorderColor': '#d0648a',
          'kBorderColor0': '#22c3aa',
          'kBorderWidth': '1',
          'lineWidth': '3',
          'symbolSize': '8',
          'symbol': 'emptyCircle',
          'symbolBorderWidth': '2',
          'lineSmooth': false,
          'graphLineWidth': '1',
          'graphLineColor': '#cccccc',
          'mapLabelColor': '#28544e',
          'mapLabelColorE': 'rgb(52,158,142)',
          'mapBorderColor': '#999999',
          'mapBorderColorE': '#22c3aa',
          'mapBorderWidth': 0.5,
          'mapBorderWidthE': 1,
          'mapAreaColor': '#eeeeee',
          'mapAreaColorE': 'rgba(34,195,170,0.25)',
          'axes': [
            {
              'type': 'all',
              'name': '通用坐标轴',
              'axisLineShow': true,
              'axisLineColor': '#cccccc',
              'axisTickShow': false,
              'axisTickColor': '#333',
              'axisLabelShow': true,
              'axisLabelColor': '#999999',
              'splitLineShow': true,
              'splitLineColor': [
                '#eeeeee'
              ],
              'splitAreaShow': false,
              'splitAreaColor': [
                'rgba(250,250,250,0.05)',
                'rgba(200,200,200,0.02)'
              ]
            },
            {
              'type': 'category',
              'name': '类目坐标轴',
              'axisLineShow': true,
              'axisLineColor': '#333',
              'axisTickShow': true,
              'axisTickColor': '#333',
              'axisLabelShow': true,
              'axisLabelColor': '#333',
              'splitLineShow': false,
              'splitLineColor': [
                '#ccc'
              ],
              'splitAreaShow': false,
              'splitAreaColor': [
                'rgba(250,250,250,0.3)',
                'rgba(200,200,200,0.3)'
              ]
            },
            {
              'type': 'value',
              'name': '数值坐标轴',
              'axisLineShow': true,
              'axisLineColor': '#333',
              'axisTickShow': true,
              'axisTickColor': '#333',
              'axisLabelShow': true,
              'axisLabelColor': '#333',
              'splitLineShow': true,
              'splitLineColor': [
                '#ccc'
              ],
              'splitAreaShow': false,
              'splitAreaColor': [
                'rgba(250,250,250,0.3)',
                'rgba(200,200,200,0.3)'
              ]
            },
            {
              'type': 'log',
              'name': '对数坐标轴',
              'axisLineShow': true,
              'axisLineColor': '#333',
              'axisTickShow': true,
              'axisTickColor': '#333',
              'axisLabelShow': true,
              'axisLabelColor': '#333',
              'splitLineShow': true,
              'splitLineColor': [
                '#ccc'
              ],
              'splitAreaShow': false,
              'splitAreaColor': [
                'rgba(250,250,250,0.3)',
                'rgba(200,200,200,0.3)'
              ]
            },
            {
              'type': 'time',
              'name': '时间坐标轴',
              'axisLineShow': true,
              'axisLineColor': '#333',
              'axisTickShow': true,
              'axisTickColor': '#333',
              'axisLabelShow': true,
              'axisLabelColor': '#333',
              'splitLineShow': true,
              'splitLineColor': [
                '#ccc'
              ],
              'splitAreaShow': false,
              'splitAreaColor': [
                'rgba(250,250,250,0.3)',
                'rgba(200,200,200,0.3)'
              ]
            }
          ],
          'axisSeperateSetting': false,
          'toolboxColor': '#999999',
          'toolboxEmpasisColor': '#666666',
          'tooltipAxisColor': '#cccccc',
          'tooltipAxisWidth': 1,
          'timelineLineColor': '#4ea397',
          'timelineLineWidth': 1,
          'timelineItemColor': '#4ea397',
          'timelineItemColorE': '#4ea397',
          'timelineCheckColor': '#4ea397',
          'timelineCheckBorderColor': 'rgba(60,235,210,0.3)',
          'timelineItemBorderWidth': 1,
          'timelineControlColor': '#4ea397',
          'timelineControlBorderColor': '#4ea397',
          'timelineControlBorderWidth': 0.5,
          'timelineLabelColor': '#4ea397',
          'datazoomBackgroundColor': 'rgba(255,255,255,0)',
          'datazoomDataColor': 'rgba(222,222,222,1)',
          'datazoomFillColor': 'rgba(114,230,212,0.25)',
          'datazoomHandleColor': '#cccccc',
          'datazoomHandleWidth': '100',
          'datazoomLabelColor': '#999999'
        })
        if (Array.isArray(map[version])) {
          map[version].forEach(function (callback) {
            callback()
          })
        }
        map[version] = true
      }

      script.src = 'https://cdn.bootcss.com/echarts/' + version + '/echarts.min.js'
      document.addEventListener
        ? script.addEventListener('load', cb, false)
        : script.onreadystatechange = function () {
          if (/loaded|complete/.test(script.readyState)) {
            script.onreadystatechange = null
            cb()
          }
        }
      document.head.appendChild(script)
      map[version] = [callback]
    })
  }

  function define (i, config) {
    config(i)
    return i
  }

}()
