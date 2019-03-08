---
layout: post
title:  "Java基本数据类型及其封装器的一些千丝万缕的纠葛"
date:   2017-02-26 00:18:54
categories: Java
tags: Java primary type
---

* content
{:toc}
### 一些概念
    想必大家都知道Java的基础数据类型有：char、byte、short、int、long、float、double、boolean 这几种，与C/C++等语言不同的是，Java的基础数据的位数是固定不变的。
    Java作为一门面向对象的语言，自然少不了对象了，因此基础数据类型都对应存在一个基本类型封装器类，它们的封装器分别为：Character、Byte、Short、Integer、Long、Float、Double、Boolean。
    在JDk1.5之前，在基础数据类型与其封装器之间的转化必须手动进行，其中将基本数据类型转换为封装器类型需要调用封装类的静态方法T.valueOf()，T代表封装器类型的名称，而将封装器类型转换为基本数据类型需要调用它的实例方法xValue();x代表基础数据类型的名称，这个过程比较繁琐，故从JDK1.5开始，JDK提供了自动装箱的特性，不再需要手动进行了。所谓装箱指：将基本数据类型转换为对应的封装器类型，拆箱指：将封装器类型转换为对应的基本数据类型。eg:
Integer a = 1;//装箱,底层实现：Integer a = Integer.valueOf(1);
int b = a;    //拆箱,底层实现：int b = a.intValue();
eg:
```
public class PackageAndUnpackageDemo{
    public static void main(String[] args) {
        Integer a = 1;//装箱,底层实现：Integer a = Integer.valueOf(1);
        int b = a;    //拆箱,底层实现：int b = a.intValue();
    }
}
```
反编译结果

![PackageAndUnpackageDemo.png](http://upload-images.jianshu.io/upload_images/3781926-b7721e03af8e36e0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

从图片中我们可以看到，装拆箱确实是这样实现的。
    此外，为了提高封装器的效率，Java将常用的数据缓存起来放到封装器对象数组里面，装箱的时候判断如果数据在缓存的范围内则从缓存里面取出对象，否则将new一个出来。
Integer相关的源码如下：

![Integer_valueOf.png](http://upload-images.jianshu.io/upload_images/3781926-7e237a821c67a3d6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

我们可以看到，当数字的范围在low与high之间时，直接从cache对象数组中获取，否则就new一个对象，cache的源码如下：

![Integer_cache.png](http://upload-images.jianshu.io/upload_images/3781926-e363b9fdcf54c3e0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

Integer的cache数组与其他的有些区别是，Integer可以自定义数组的上限，而其他封装器的cache是固定的。
封装器的缓存的大小以及他们对应的基础数据类型的范围见下表：



| 基本类型 | 封装器 | 字节数 | 最大值 | 最小值 |    缓存范围     |
| :------: | :------: | :------: | :------: | :------: | :------: |
| byte | Byte | 1byte | 2^7 - 1 | -2^7 | -128~127 |
| short | Short | 2byte | 2^15 - 1 | -2^15 | -128~127 |
| char | Character | 2byte | 2^16 - 1 | 0    | 0~127 |
| int  | Integer | 4byte | 2^31 - 1 | -2^31 | -128~127 |
| long | Long | 8byte | 2^63 - 1 | -2^63 | -128~127 |
| float | Float | 4byte | 3.4e+38 | 1.4e-45 | 无缓存 |
| double | Double | 8byte | 1.8e+308 | 4.9e-324 | 无缓存 |
| boolean | Boolean | 1byte/4byte/不明确 |     |    | false、true |


我们注意到Boolean与Byte全部被缓存了，boolean类型没有给出精确的定义，《Java虚拟机规范》给出了4个字节，和boolean数组1个字节的定义，具体还要看虚拟机实现是否按照规范来，所以1个字节、4个字节都是有可能的，这个在这里不做深究。
看到这里想必您现在应该能够理解下面的一些现象吧：
```
public class CacheDemo{
    public static void main(String[] args) {
        Integer a = 127;
		Integer b = 127;
		System.out.println(a == b);//true
		Integer c = 128;
		Integer d = 128;
		System.out.println(c == d);//false
		Integer e = -128;
		Integer f = -128;
		System.out.println(e == f);//true
		Integer g = -129;
		Integer h = -129;
		System.out.println(g == h);//false
    }
}
```
由于127与-128都在缓存数组缓存的范围内，所以他们是直接从缓存数组中取得的对象，故引用相同，而128与-129不在该范围内，所以是new出来的，故引用不相同。当然得到这个结果的前提条件是我们没有指定Integer缓存数组的上限，直接使用它的默认上限127。您可以通过-Djava.lang.Integer.IntegerCache.high=128 指定上限为128，那么运行结果就有所不同了。
java CacheDemo 
```
true
false
true
false
```
java -Djava.lang.Integer.IntegerCache.high=128 CacheDemo 
```
true
true
true
false

```

到这里需要提醒一下大家的是，“Java中对引用类型而言 == 比较的是引用，而equals()比较的是内容”这句话其实严格意义上来讲不准确。
我们不妨看一下对象之源Object中关于equals()的实现

```
public boolean equals(Object obj) {
    return (this == obj);
}
```

OK，Object的equals()方法默认还是使用了 “==”，所以要是自定义的对象没有Override该方法与hashCode()方法，那么比较的也是引用而不是内容了,当然Java的大部分类都重写了该方法，但是还有一些类如StringBuffer，StringBuilder没有重写该方法，这点需要注意。

### 注意事项
#### 空指针异常
    自动的装拆箱给我们带来了很大的方便，大部分情况下我们都将封装器与基础数据类型混为一谈了，但是二者之间毕竟还是存在着一些差别，在某些场景下要是不注意，自动装拆箱这个语法糖也会给我们带来一些意想不到的后果。
    由于引用类型的默认值是null,而不能将null赋值给基本数据类型，在拆箱的过程中可能会导致空指针异常，这个需要我们格外注意要加以判断：
如下面的情形：
```
import java.util.List;
import java.util.ArrayList;
public class NullPointInUnpackageDemo{
    public static void main(String[] args) {
        List<Integer> list = new ArrayList<Integer>(3);
        list.add(0);
        list.add(1);
        list.add(null);
        for (int n:list){
            System.out.println("n="+n);
        }
    }
}
```
运行结果：
```
n=0
n=1
Exception in thread "main" java.lang.NullPointerException
	at NullPointInUnpackageDemo.main(NullPointInUnpackageDemo.java:10)
```
当然例子出现空指针异常的情况我们一眼就能够看出，但是实际开发过程可能由于疏忽或者不那么直接的拆箱行为，将会带来意想不到的错误，这是我们需要格外注意的。
#### 封装器带来的模糊性问题
    在方法的重载某些情形，封装器带来的使用可能会带来方法调用的模糊性问题，给我们带来一些意想不到的bug，比如下面的情形：
```
public class BugInOverloading{
	public static void test(Integer num){
	    System.out.println("Integer num");
	}
    public static void test(long num){
        System.out.println("long num");
    }
    public static void main(String[] args) {
        test(1);
    }
}
```
    您能够一眼看出会调用哪个方法吗？好吧，结果可能与您想象中的可能有点出入，运行结果是
```
long num
```
    也就是说它居然没有调用test(Integer num)，反而直接向上转型为long 调用了test(long num)，这不很费解吗？对于该现象的解释是：Java为了向下兼容，保证程序的正确性，在方法重载时先不考虑自动装拆箱，而是遵循最精确匹配的原则，找最匹配的类型，由于没有int类型的方法可以调用，但是有long类型的方法，那么根据这个原则，int向上转型为long了，而不是自动装箱，这点需要注意,(ps:关于方法重载调用的问题可以参考博主[另外的一篇文章](http://www.jianshu.com/p/7ef2a22bb730) )额，时间不早了，就先这样吧，以上便是Java基本数据类型及其封装器的一些千丝万缕的纠葛。
圉于博主的水平，理解可能有所偏差，还望各位大佬不吝指正！

