# Changelog

- 2019-08-26
    - 支持数学公式，使用`markdown-it-katex`插件。可以在文档中直接使用`$`或`$$`。
      
      如：$E=mc^2$，$c^2=\frac{E}{m}$
      
    - 支持[plantuml](http://plantuml.com/zh/)，目前已优化sequence图样式。
    
      如：
      
      @startuml
      
      Alice -> Bob: Hi, Bob!
      
      @enduml
