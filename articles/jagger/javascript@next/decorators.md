---

sidebar: auto
sidebarDepth: 2

---

# Javascript@next - Decorators

> 本文为翻译，原文为[https://github.com/tc39/proposal-decorators](https://github.com/tc39/proposal-decorators)，翻译时最新Commit
  为`ff60686`。


*Stage 2*

## 状态

修饰器（`decorator`）是一个TC39提出标准化的JavaScript语言的特性，目前处于Stage 2阶段，意味着委员会希望它最终能被包含在标准JavaScript编程语言中。

## 提议的目的

本`decorator`提议旨在面向以下两个方向加强之前的提案：

- 写一个`decorator`应当与使用一个`decorator`同样简单。
- `decorator`应该在转换器下生成好的代码，并在原生JS解释器下快速执行。

本提案采纳了最初JS修饰器的提案（如TypeScript的修饰器）的基本功能，并提了同时增加了两个额外的能力：访问私有成员变量和函数、注册构造函数回调。

核心元素：

- 提供基本的内置修饰器，用来构建其他修饰器：
    - `@wrap`：使用返回值取代方法或整个类
    - `@register`：在类创建时调用回调
    - `@expose`：在类创建时调用一个提供访问私有属性或方法的回调
    - `@initialize`：在实例化类时调用回调
- 修饰器可以用于**组合定义**其他修饰器
    - `decorator @foo { }`声明了一个新的修饰器， 这是一个固定的词法，并且可以引入导出。
    - 修饰器不能被当作JavaScript值处理，它智能应用与类、组合修饰器、引入和导出。
    - 修饰器有`@`作为名字的一部分；`@decorator`的名字有单独的命名空间。
    - 修饰器只可以以几乎固定的方式组合，以便于静态分析。    

本提案采用了最小化设计，但可能逐渐假如更多的内置修饰器，如创建`synthetic private names`，静态地改变类、参数以及函数修饰器等等。

## 动机以及用例

ES6类有意地被最小化设计，不支持一些类的通用特性。其中某些用例可以使用类属性与私有函数处理，但其他的一些用例需要一些可编程能力和内省能力。修饰器给予了类可编程的能力。

修饰器通过翻译器已经广泛地应用在JavaScript中，如[core-decorators](https://www.npmjs.com/package/core-decorators), [ember-decorators](https://ember-decorators.github.io/ember-decorators/)，[Angular](https://medium.com/@madhavmahesh/list-of-all-decorators-available-in-angular-71bdf4ad6976)，[Stencil](https://stenciljs.com/docs/decorators/)与[MobX](https://mobx.js.org/refguide/modifiers.html)。

接下来提供一些实现和使用修饰器的例子：

### `@logged`

`@logged`修饰器在函数开始和结束时打印日志。许多流行的修饰器会希望包装（wrap）一个函数。

用法：

```javascript
import { @logged } from "./logged.mjs";

class C {
  @logged
  method(arg) {
    this.#x = arg;
  }

  @logged
  set #x(value) { }
}

new C().method(1);
// starting method with arguments 1
// starting set #x with arguments 1
// ending set #x
// ending method
```

`@logged`可以通过内置JavaScript修饰器的方式实现：使用使用一个函数作为参数的内置构造器`@wrap`定义。传输此函数的方法最终会变为目标类的方法。`@wrap`类似于core-decorators
的[`@decorator`](https://www.npmjs.com/package/core-decorators#decorate)修饰器。

```javascript
// logged.mjs

export decorator @logged {
  @wrap(f => {
    const name = f.name;
    function wrapped(...args) {
      console.log(`starting ${name} with arguments ${args.join(", ")}`);
      f.call(this, ...args);
      console.log(`ending ${name}`);
    }
    wrapped.name = name;
    return wrapped;
  })
}
```

在以上的例子中，构造器`@logger`使用具有固定回调的`@wrap`构造器定义。

### `@defineElement`

[HTML Custom Elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
)允许我们使用自定义HTML元素。元素使用`customElements.define`定义。使用修饰器可以前置自定义元素的注册：

```javascript
import { @defineElement } from "./defineElement.mjs";

@defineElement('my-class')
class MyClass extends HTMLElement { }
```

`@defineElement`基于`@register`修饰器实现，当类定义完成时会以类为参数调用回调。

```javascript
// defineElement.mjs
export decorator @defineElement(name, options) {
  @register(klass => customElements.define(name, klass, options))
}
```

### `@metadata`

`@metadata(key, value)`修饰器类似于[`@Reflect.metadata`](https://github.com/rbuckton/reflect-metadata
)：它允许简单检索注解在类上的信息。以下的例子是根据Reflect.metadata的提案完成，并且也可以储存任何形式的数据。

```javascript
import { @metadata } from "./metadata.mjs";

// partially apply the decorator locally for terseness
decorator @localMeta { @metadata("key", "value") }

@localMeta class C {
  @localMeta method() { }
}

Reflect.getMetadata(C, "key");                      // "value"
Reflect.getMetadata(C.prototype, "key", "method");  // "value"
```

`@metadata`也可以使用`@register`定义，当`@register`用于公共字段、方法或者访问器时，回调的第二个参数是修饰器修饰的类元素的属性key。

```javascript
// metadata.mjs
import "reflect-metadata";

export decorator @metadata(key, value) {
  @register((target, prop) => Reflect.defineMetadata(key, value, target, prop))
}
```

### `@frozen`

`@frozen`修饰器冻结构造器以及`prototype`以阻止类定义之后的任何改变。实例并不会被冻结。示例用法：

```javascript
import { @frozen } from "./frozen.mjs";

@frozen
class MyClass {
  method() { }
}

MyClass.method = () => {};            // TypeError to add a method
MyClass.prototype.method = () => {};  // TypeError to overwrite a method
MyClass.prototype.method.foo = 1;     // TypeError to mutate a method
```

`@frozen`修饰器使用`@register`实现，并允许回调在类创建之后调用，首个参数为对应的类。

```javascript
// frozen.mjs
export decorator @frozen {
  @register(klass => {
    Object.freeze(klass);
    for (const key of Reflect.ownKeys(klass)) {
      Object.freeze(klass[key]);
    }
    for (const key of Reflect.ownKeys(klass.prototype)) {
      Object.freeze(klass.prototype[key]);
    }
  })
}
```

## ***NOT DONE.***
