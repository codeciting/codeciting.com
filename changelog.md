# Changelog

[![CircleCI](https://circleci.com/gh/codeciting/codeciting.com.svg?style=svg)](https://circleci.com/gh/codeciting/codeciting.com)

- 2019-08-27
    - 支持[ECharts](https://echarts.baidu.com/index.html)
      
      使用`markdown-it-container`，参数0固定为`echarts`，参数1（可选）为版本号、参数2/3（可选）为`maxWidth`/`height`。
      用法：
      ```markdown
      :::echarts 4.2.1 600px 400px
        {
          xAxis: {
            type: 'category',
              data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: [820, 932, 901, 934, 1290, 1330, 1320],
            type: 'line'
          }]
        }
      :::
      ```
      :::echarts 4.2.1 600px 400px
        {
          xAxis: {
            type: 'category',
              data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: [820, 932, 901, 934, 1290, 1330, 1320],
            type: 'line'
          }]
        }
      :::
      

- 2019-08-26
    - 支持数学公式，使用`markdown-it-katex`插件。可以在文档中直接使用`$`或`$$`。
      
      如：$E=mc^2$，$c^2=\frac{E}{m}$
      
    - 支持[plantuml](http://plantuml.com/zh/)，目前已优化sequence图样式。
    
      如：
      
      @startuml
      
      Alice -> Bob: Hi, Bob!
      
      @enduml
