# 虚拟机字节码执行引擎

## 概述
执行引擎是Java虚拟机最核心的组成部分之一。”虚拟机“是一个相对于“物理机”的概念，这两种机器都有代码执行能力，其区别是物理机的执行引擎是直接建立在处理器、硬件、指令级和操作系统层面上的，而虚拟机的执行引擎是由自己实现的，因此可以自行制定指令集与执行引擎的结构体系，并且能够执行那些不被硬件直接支持的指令集格式。  
在Java虚拟机规范中制定了虚拟机字节码执行引擎的模型概念，这个概念模型成为各种虚拟机执行引擎的统一外观。在不同的虚拟机实现里面，执行引擎在执行Java代码的时候可能会有解释执行（通过解释器执行）和编译执行（通过即时编译器产生本地代码执行）两种选择，也可能两者兼备，甚至还可能会包含结果不同界别的编译执行引擎。但从外观上看起来，所有的Java虚拟机的执行引擎都是一致的：输入的字节码文件，处理器过程是字节码解析的等效过程，输出的是执行结果。

## 运行时栈帧结构
栈帧（Stack Frame）是用于支持虚拟机进行方法调用和方法执行的数据结构，它是虚拟机运行时数据区中的虚拟机栈（Virtual Machine Stack）的栈元素。
栈帧存储了方法的局部变量表、操作数栈、动态连接和方法返回地址等信息。每一个方法从调用开始至执行完成的过程，都对应着一个战争在虚拟机栈里面从入栈到出栈的过程。

### 局部变量表
局部变量表（Local Variable Table）是一组变量值存储空间，用于存放方法参数和方法内部定义的局部变量。  
局部变量表的容量已变量槽（Variable Slot，下称Slot）为最小单位，虚拟机规范中并没有明确的指明一个Slot应占的内存空间的大小，只是很有导向性的说到每个Slot都应该存放一个boolean、byte、char、short、int、reference或returnAddress类型的数据。
- 对于reference对象，虚拟机既没有明确说明它的长度，也没有明确指出这种引用应有怎样的结构。但一般来说，虚拟机实现至少都应当能通过引用做到两点：
  1. 从此引用中直接或间接的查找到对象在Java堆中的数据存放的起始索引地址。
  2. 从此引用中直接或间接的查找到对象所属数据类型在方法区存放的起始地址索引。

虚拟机通过索引定位的方式使用局部变量表，索引值的方法从0开始至局部变量表最大的Slot数量。如果访问的是32位数据类型的变量，索引n就代表了使用第n个Slot，如果是64位数据类型的变量，则会说明同时使用n和n+1两个Slot。对于两个相邻的共同存放的64位数据的两个Slot，不允许采用任何方式单独访问其中的某一个。在方法执行的时候，虚拟机是使用局部变量表完成参数值到参数列表的传递过程的。如果执行的是实例方法（非static方法），那局部变量表中第0个索引的Slot默认是用于传递方法所属对象实例的引用，在方法中可以通过关键字“this”获得。  
为了尽可能的节省栈空间，局部变量表中的Slot是可以重用的，方法体中定义的变量，其作用域并不一定会覆盖整个方法，如for循环中定义的变量，没有覆盖到for循环意外。如果当前字节码PC计数器的值已经超过某个变量的作用域，那这个变量对应的Slot就可以交给其他变量使用了。
### 操作数栈
操作数栈也常称为操作数栈，它是一个后入先出（Last In First Out， LIFO）栈。操作数栈的每一个元素可以是任意的Java数据类型，包括long和double。32位数据类型所占的栈容量为1，64位数据所占的栈容量为2.在方法执行的任何时候，操作数栈的深度都不会超过在max_stacks数据项中设定的最大值。  
在方法执行过程中，会有各种字节码指令往操作数栈中写入和提取内容，也就是出栈/入栈操作。  
在概念模型中，两个栈帧作为虚拟机栈的元素，是完成相互独立的。但是大多数的虚拟机的实现里面都会做一些优化处理，令两个栈帧出现一部分重叠。让下面栈帧的部分操作与上面栈帧的部分局部变量表重叠在一起，这样在进行方法调用时就可以公用一部分数据，无须进行额外的参数复制传递。
<div align='center'> <img src='/img/asuio/stack-frame-data-share.png' alt="test"></div>

### 动态连接
每个栈帧中都包含一个指向运行时常量池中改栈帧所属方法的引用，持有这个引用是为了支持方法调用过程中的动态连接。  
在Class文件的常量池中存放有大量的符号引用，字节码中的方法调用指令就是以常量池中执行方法的符号引用作为参数的。这些符号引用一部分会在类加载阶段或者第一次使用的时候转化为直接引用，这种转化成为静态解析；另外一部分将在每一次运行期间转化为直接引用，这部分成为动态连接。详细信息见[方法调用](#方法调用)

### 附加信息
虚拟机规范允许具体的虚拟机实现增加一些规范里没有描述的信息到栈帧之中，例如与调试相关的信息，这部分信息完全取决于具体的虚拟机实现，这里不再详述。在实际开发中，一般会把动态连接、方法返回地址与其他附加信息全部归为一类，称为栈帧信息。

## 方法调用
方法调用并不等同于方法执行，方法调用阶段唯一的任务就是确定被调用方法的版本（即调用哪一个方法）。Class文件的编译过程中，不包括传统编译中连接步骤，一切方法调用在Class文件里面存储的都只是符号引用，而不是方法在实际运行时内存布局中的入口地址（相当于说的直接引用）。
### 解析
所有方法调用中的目标方法在Class文件里面都是有一个常量池总的符号引用，在[类加载](/articles/asuio/jvm/four.html#类加载机制)的解析阶段，会将其中一部分符号引用转化为直接引用，这种解析能成立的前提是：方法在程序运行之前就有一个可确定的调用版本，并且这个方法的调用版本在运行期是不可改变的。这类方法的调用成为解析。   
在Java语言中符合”编译期可知，运行期不可变“这个要求的方法，主要包括静态方法和私有方法两大类，前者与类型直接关联，后者在外部不可被访问，这两种方法各自的特点据定了他们不可能通过继承或者别的方式重写其他版本。  
在Java虚拟机里面提供了5条方法调用字节码指令，分别是：
1. invokestatic： 调用static方法
2. invokespecial： 调用实例构造器\<init\>方法、私有方法、父类方法
3. invokevirtual：调用所有虚方法
4. invokeinterface： 调用接口方法，会在运行时再确定一个实现此接口的对象。
5. invokedynamic：现在运行时动态解析出调用点限定符所引用的方法，然后再执行该方法。

只要能被invokestatic和invokespecial指令调用的方法，都可以在解析阶段总确定唯一的调用版本，符合这个条件的所有静态方法、私有方法、实例构造器、父类方法4类，它们在类加载的时候就会把符号引用解析为该方法的直接引用，这些方法统称为非虚方法。反之则成为虚方法（除去final方法，虽然final方法是使用invokevirtual指令来调用的，但是由于它无法被覆盖，没有其他版本，所以也无须对方法接受者进行多态调用）。

:::tip
解析调用一定是个静态的过程，在编译期间就完全确定，在类装载的解析阶段就会把涉及的符号引用全部转变为可确定的直接引用，不会延迟到运行期再去完成。而分派（Dispatch）调用则可能是静态的也可能是动态的，根据分派依据的宗量数￼可分为单分派和多分派。这两类分派方式的两两组合就构成了静态单分派、静态多分派、动态单分派、动态多分派4种分派组合情况，下面我们再看看虚拟机中的方法分派是如何进行的
:::

### 分派
- 静态分派  
  ```Java
  public class StaticDispatch {

      static abstract class Human{
      }

      static class Man extends Human{
      }

      static class Women extends Human{
      }

      public void sayHello(Human guy){
          System.out.println("hello, guy");
      }
      public void sayHello(Man guy){
          System.out.println("hello, gentleman");
      }
      public void sayHello(Women guy){
          System.out.println("hello, lady");
      }

      public static void main(String[] args) {
          Human man = new Man();
          Human women= new Women();
          StaticDispatch sr = new StaticDispatch();
          sr.sayHello(man);
          sr.sayHello(women);
      }
  }
  ```
  在这段代码中，运行结果是：
  ```
  hello, guy
  hello, guy
  ```
  上面这段代码时一段重载（Overload）的代码，这段代码选择了执行参数类型为Human的重载。  
  ```Java
  Human man = new Man();
  ```
  在上面这行代码中，“Human”成为变量的静态类型（Static type），或者叫外观类型（Apparent Type），后面的“Man”则成为变量的实际类型（Actual Type）。静态类型和实际类型在程序中都可以发生一些变化，区别是静态类型的变化仅仅在使用时发生，变量本身的静态类型不会被改变，并且最后的静态类型在编译期是可知的；而实际类型变化的结果在运行期才可确定，编译器在编译程序的时候并不知道一个对象的实际类型是什么。  
  `虚拟机在重载时是通过参数的静态类型而不是实际类型作为判定依据的`。并且静态类型是编译器可知的，因此在编译阶段，Javac编译器会根据参数的静态类型决定使用那个重载版本，所以选择了sayHello(Human)作为调用目标。
  :::tip  
  所有依赖静态类型来定位方法执行版本的分配动作称为静态分派。静态分派的典型应用是方法重载。   
  :::
  解析与分派这两个之间的关系并不是二选一的排他关系，它们是不同层次上去筛选、确定目标方法的过程。静态方法会在类加载期就进行解析，而静态方法显然也是可以拥有重载版本的，选择重载版本的过程就是静态分派的过程。
- 动态分派  
  动态分派和重写（Override）有个密切的关系。  
  ```Java
  public class DynamicDispatch {

      static abstract class Human{
          protected abstract void sayHello();
      }

      static class Man extends Human{
          protected void sayHello() {
              System.out.println("man say hello");
          }
      }

      static class Women extends Human{
          protected void sayHello() {
              System.out.println("woman say hello");
          }
      }

      public static void main(String[] args) {
          Human man = new Man();
          Human women= new Women();
          man.sayHello();
          women.sayHello();
          man = new Women();
          man.sayHello();
      }
  }
  ```
  执行结果
  ```
  man say hello
  woman say hello
  woman say hello
  ```
  显然这里不是根据静态类型决定的，因为静态类型都是human的两个变量man和woman在调用sayHello()方法时执行了不同的行为。

  ```
  public static void main(java.lang.String[]);
    descriptor: ([Ljava/lang/String;)V
    flags: ACC_PUBLIC, ACC_STATIC
    Code:
      stack=2, locals=3, args_size=1
         0: new           #2                  // class DynamicDispatch$Man
         3: dup
         4: invokespecial #3                  // Method DynamicDispatch$Man."<init>":()V
         7: astore_1
         8: new           #4                  // class DynamicDispatch$Women
        11: dup
        12: invokespecial #5                  // Method DynamicDispatch$Women."<init>":()V
        15: astore_2
        16: aload_1
        17: invokevirtual #6                  // Method DynamicDispatch$Human.sayHello:()V
        20: aload_2
        21: invokevirtual #6                  // Method DynamicDispatch$Human.sayHello:()V
        24: new           #4                  // class DynamicDispatch$Women
        27: dup
        28: invokespecial #5                  // Method DynamicDispatch$Women."<init>":()V
        31: astore_1
        32: aload_1
        33: invokevirtual #6                  // Method DynamicDispatch$Human.sayHello:()V
        36: return
  ```
  0-15行的字节码是准备动作，作用是建立man和woman的内存空间、调用Man和Woman的实例构造器，将这两个实例的引用存放在第1、2个局部变量表Slot中，这个动作也就对应了初始的两句代码。
  ```Java
  Human man = new Man();
  Human women= new Women();
  ```
  第16，20句是吧刚刚创建的两个对象的引用压到栈顶，这两个对象是将要执行sayHello()方法的所有者，称为接收者Receiver）；17和21句是方法调用指令，这两条指令从字节码角度来看，都是执行了Human.sayHello()的符号引用，但是这两条指令最终执行的目标方法并不相同。   
  invokevirtual指令的运行时解析过程大概分为一下几个步骤：
  1. 找到操作数栈顶的第一个元素所指向的对象的`实际类型`，记作C。
  2. 如果在类型C中找到与常量中的描述符和简单名称都相符的方法，则进行访问权限校验，如果通过则返回这个方法的直接引用，查找过程结束；如果不通过，则返回java.lang.IllegalAccessError异常。
  3. 否则，按照继承关系从下往上一次对C的各个父类进行第2步的搜算和验证过程。
  4. 如果始终没有找到合适的方法，则抛出java.lang.AbstractMethodError异常。

  由于invokevirtual指令执行的第一步就是在运行期确定接受者的实际类型，所以两次调用中的invokevirtual指令把常量池中的类方法符号引用解析到了不同的直接引用上，这个过程就是Java语言方法中方法重写的本质。  
  :::tip
  我们把这种在运行期根据实际类型确定执行方法版本的分派过程称为动态分派。
  :::

- 单分派与多分派   
  方法的接收者与方法的参数统称为方法的宗量。根据分派基于多少种宗量，可以将分派划分为单分派和多分派两种。单分派是根据一个宗量对目标方法进行选择，多分派则是根据多于一个宗量对目标方法进行选择。
  ```Java
  public class Dispatch {
      static class QQ{};
      static class _360{};

      public static class Father{
          public void hardChoice(QQ arg){
              System.out.println("father choose QQ");
          }
          public void hardChoice(_360 arg){
              System.out.println("father choose 360");
          }
      }
      public static class Son extends Father{
          public void hardChoice(QQ arg){
              System.out.println("son choose QQ");
          }
          public void hardChoice(_360 arg){
              System.out.println("son choose 360");
          }
      }

      public static QQ getQQ(){
          return new QQ();
      }

      public static void main(String[] args) {
          Father father = new Father();
          Father son = new Son();
          father.hardChoice(new _360());
          son.hardChoice(new QQ());
      }
  }
  ```
  输出结果：
  ```
  father choose 360
  son choose QQ
  ```
  - 在静态分派的过程，这是选择目标的方法的依据有两点：一是静态类型是Father还是Son，而是方法参数是QQ还是360。这次选择的结果产生了两条invokevirtual指令，两条指令的参数分别是常量池中指向的Father.hardChoice(\_360)及Father.hardChoice(QQ)方法的符号引用。因为是根据两个宗量进行选择，所以Java语言的静态分派属于多分派
  - 动态分配过程，在执行son.hardChoice(new QQ())这句代码时，更准确地说，是在执行这句代码所对应的指令的时，由于编译期已经决定目标的方法签名必须为hardChoice(new QQ())，虚拟机此时不会关心传递过来的参数“QQ”到底是什么，因为这时参数的静态类型、实际类型都对方法的选择不会构成任何影响，唯一可以影响虚拟机选择的因素只有此方法的接收者的实际类型是Father还是Son。因为只有一个宗量作为选择依据，所以Java语言的动态分派数据单分派类型。

  Java语言是静态多分派语言，动态单分派语言。
- 虚拟机动态分派的实现
  由于动态分派是非常频繁的动作，而且动态分派的方法版本选择过程需要运行时在类的方法元数据中搜索合适的目标方法，因此在虚拟机的实际实现中基于性能的考虑，大部分实现都不会真正地进行如此繁琐的搜索。面对这种情况，最常用的“稳定优化”手段就是为类在方法区建立一个虚方法表（Vritual Method Table，也称为vtable，与此对应的，在invokeinterface执行时也会用到接口方法表——Inteface Method Table，简称itable），使用虚方法表索引来代替元数据查找以提高性能。

  <div align='center'> <img src='/img/asuio/v-method-table.png' alt="test"></div>

  :::tip
  虚方法表中存放着各个方法的实际入口地址。如果某个方法在子类中没有重写，那子类的虚方法表里面的地址入口和父类相同方法的地址入口是一致的，都执行父类的实现入口。如果子类重写了这个方法，子类方法表中的地址将会替换为指向子类实现版本的入口地址。
  :::
  上图中Son重写了来自Father的全部方法，因此Son的方法表没有指向Father类型数据的箭头，但是Son和Father都没有重写来自Object的方法，所以他们的方法表中所有从Object继承来的方法都指向了Object的数据类型。  
  为了程序实现的方便，具有相同签名的方法，在父类、子类的虚方法表中都应当具有一样的索引序号，这样当类型变换时，仅需要变更查找的方法表，就可以从不同的虚方法表中按索引转换出所需的入口地址。  
  方法表一般在类加载的连接阶段进行初始化，准备了类的变量初始值后，虚拟机会把该类的方法表也初始化完毕。
## 基于栈的字节码解释执行引擎
- 未完待续  
