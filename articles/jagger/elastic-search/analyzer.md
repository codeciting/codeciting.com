# Elastic Search - Analyzer

## 预置分词器

- Standard：将文本使用Unicode Text Segmentation algorithm算法以单词分界划分，它移除了大部分标点符号，将单词转换为小写并支持移除结束词。
- Simple：将所有非英文字母字符划分为单个单词，并将英文转换为小写。
- Whitespace：将文本以空白字符划分，不回转换小写。
- Stop：类似于Simple，但支持移除结束词。
- Keyword：无操作，输出与输入相同，不进行任何处理。
- Pattern：使用regexp分词，支持转换小写与移除结束词。
- Language：人类语言分词器。
- Fingerprint：输入语句会以单词为界，去重、排序、移除扩展字符，并连接为一个单独的token
  
  例："Yes yes, Gödel said this sentence is consistent and." => "and consistent godel is said sentence this yes"

## 自定义分词器
自定义分词器（custom）接收以下参数

- tokenizer（必需）
  
  内置或自定义的tokenizer

  - Word Oriented Tokenizers

    - Standard
    - Letter
    - Lowercase
    - Whitespace
    - UAX URL Email
    - Classic
    - Thai

  - Partial Word Tokenizers
    - N-Gram
    - Edge N-Gram

  - Structured Text Tokenizers
    - Keyword
    - Pattern
    - Simple Pattern
    - Char Group
    - Simple Pattern Split
    - Path

- char_filter
  
  内置或自定义的character filters数组

  - HTML Strip Character Filter
  - Mapping Character Filter
  - Pattern Replace Character Filter

- filter

  内置或自定义的token filters数组

- position_increment_gap

  When indexing an array of text values, Elasticsearch inserts a fake "gap" between the last term of one value and the
  first term of the next value to ensure that a phrase query doesn’t match two terms from different array elements. Defaults to 100. See position_increment_gap for more.
