---
layout: post
title:  "彻底理解Java中的访问修饰符"
date:   2019-02-16 21:43:54
categories: Java
tags: Java Modifier
---

* content
{:toc}

#### 一道简单的题目

看到这个标题时可能很多朋友会嗤之以鼻，难不成简单的访问修饰符还有什么新花样吗？别急，麻烦您先看一下这个简单的题目。
![OverrideTrap.png](https://upload-images.jianshu.io/upload_images/3781926-3774cf110a285c6b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
这无非就是一个简单运行时多态问题，众所周知，Java的多态分为编译时多态和运行时多态两种。其中，  编译时多态主要指方法的重载，运行时多态指程序中定义的对象引用所指向的具体类型在运行期间才确定。  运行时多态有三个条件：

1.  继承
2.  方法重写（覆盖）
3.  向上转型

main函数中，base指向的实际上是Impl对象，因此在调用sayHi()方法时，会执行Impl对象的sayHi()方法而非Base对象的sayHi()方法，因此，输出的内容显然是Impl:Hi。

实际上是这样的吗？然而很不幸，输出的却是 Base:Hi。问题出在哪儿？难道这不满足运行时多态的条件？不应该啊，首先，Impl类继承了Base类，其次，Impl类重写了Base类的sayHi()方法，最后，调用时进行了向上转型。三个貌似条件都满足，但是等等，回忆一下方法重写的要求：

1.  子类方法的访问权限必须大于等于父类方法；
2.  子类方法的返回类型必须是父类方法返回类型或为父类方法返回类型的子类型。

    貌似也满足啊，我们再看一下[JLS](https://docs.oracle.com/javase/specs/jls/se8/html/jls-8.html#jls-8.4.8.1)中对方法重写的规定：

![Overriding.png](https://upload-images.jianshu.io/upload_images/3781926-17f230a30f3e21c7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
翻译过来大概为：

1.  A是C的超类

2.  C没有继承m<sub>A</sub>

3.  m<sub>C</sub>是m<sub>A</sub>的签名的子签名

4.  下面的多个条件之一要满足：

    m<sub>A</sub>是public的

    m<sub>A</sub>是protected的  m<sub>A</sub>在C所处的包中具有包访问权限，且m<sub>C</sub>覆盖了来自C的某个超类中的m<sub>A</sub>


#### 访问修饰符

看来我们忽略了方法的访问修饰符的问题。Java中访问修饰符规定及其访问范围如下表所示：

| 访问权限 | 当前类 | 同包 | 子类 | 其他包 |
| --- | --- | --- | --- | --- |
| public | √ | √ | √ | √ |
| protected | √ | √ | √ | × |
| default | √ | √ | × | × |
| private | √ | × | × | × |

那么，当子类位于当前类内部、同一包下、其他包下时访问权限会发生什么变化呢？是否还遵循表格中的规定呢？对于这个问题，我们只需要记住**最大访问权限原则**即可，所谓最大访问权限原则即子类的在不同位置时访问权限修饰符表现的实际权限以最大的那个为准。依据该原则，子类在不同位置时对父类中的方法及变量的访问权限如下表所示：

| 子类中访问权限 | 当前类 | 同包 | 其他包 |
| --- | --- | --- | --- |
| public | √ | √ | √ |
| protected | √ | √ | √ |
| default | √ | √ | × |
| private | √ | × | × |

回到题目中，由于子类Impl与父类Base位于同一包下，而Base中的sayHi()方法的修饰符为private，对子类不可见，因此不满足方法重写的要求，因此调用的仍然是Base中的方法，而非子类中的方法。

这个细节看起来很不起眼，但实际上却包含了访问修饰符的权限及方法重写、多态等细节，算得上是一道好题。

