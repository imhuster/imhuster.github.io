---
layout: post
title:  "Java代码块详解"
date:   2017-02-25 17:47:54
categories: Java
tags: Java Code Block
---

* content
{:toc}
>Java中代码块指的是用 {} 包围的代码集合，分为4种：普通代码块，静态代码块，同步代码块，构造代码块

### 普通代码块:
​    定义：在方法、循环、判断等语句中出现的代码块
​    修饰：只能用标签修饰
​    位置：普通代码块可以出现在方法体内除"()"外的任何地方，包括 方法体，代码块中（即可以嵌套在代码块中）
​    执行：普通代码依赖方法的执行而执行，按照正常的先后顺序执行
​    作用：将多行代码封装在一起，实现特定的功能。（有点废话）                
​    注意：无

### 静态代码块 
​     定义：在类中定义使用static修饰的代码块
​     修饰：使用static修饰
​     位置：它不能出现在方法体或者代码块内 
​     执行：在加载类时会先执行静态代码块，且只执行一次，如果有多个静态代码块则按照先后顺序执行
​     作用：一般用于静态变量的初始化，创建对象前的环境的加载
​     注意：静态代码块中不能直接访问非静态变量和方法，需要通过类的实例对象来访问 
### 同步代码块  
​    定义：可以简单地认为同步代码块是使用 synchronized 修饰的普通代码块
​    位置：同普通代码块
​    执行：同普通代码块
​    作用：用于多线程环境的同步保护
​    注意：注意同步代码块使用不当可能会造成“死锁”
### 构造代码块  
​    定义：在类中定义且没有加任何修饰的代码块
​    位置：它不能出现在方法体或者其他代码块内 
​    执行：依赖于构造函数的调用而执行
​    作用：初始化实例变量和实例环境，一般用于提取类构造函数中的公共代码
​    注意：构造代码块不是在构造函数之前执行的！！！编译器在编译的时候会把构造代码块插入到每个构造函数的最前面！！
​         构造代码块随着构造函数的执行而执行！！
​         如果某个构造函数调用了其他的构造函数，那么构造代码块不会插入到该构造函数中以免构造代码块执行多次！ 

执行案例：

```
public class CodeAreaExecuteDemo{
    static{
        System.out.println("static code  block!");
    }
    {
        System.out.println("construct code  block!");
    }
    public CodeAreaExecuteDemo(){
        System.out.println("Constructor() ");
    }
    public static void main(String[] args) {
        new CodeAreaExecuteDemo();
    }
}  
```
 执行结果：

```
static code  block!
construct code  block!
Constructor() 
```
反编译结果：

![CodeExecuteDemo.png](http://upload-images.jianshu.io/upload_images/3781926-00f81209928f7400.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

我们发现构造代码块确实被插入到了构造函数最前面中

构造代码块与构造函数关系的案例

```
public class ConstructorDemo{
    public ConstructorDemo(){}
    public ConstructorDemo(int num){
        this();
    }
    {
        System.out.println("construct code  block!");
    }
    public static void main(String[] args) {
    }
}
```
反编译结果如下：

![ConstructorDemo.png](http://upload-images.jianshu.io/upload_images/3781926-8b1740439ba55787.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

我们发现构造代码块确实被插入到了无参构造函数最前面，而调用了无参构造函数的有参构造函数没有被插入构造代码块

以上便是本人对Java代码块的总结，圉于博主的水平，理解可能有所偏差，还望各位大佬不吝指正！

本博客参考了秦小波《编写高质量代码：改善Java程序的15个建议》北京：机械工业出版社，2011.11
