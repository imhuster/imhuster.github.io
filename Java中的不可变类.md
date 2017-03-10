#### 什么叫不可变类？
《Effective Java》将不可变类定义如下：
>An immutable class is simply a class whose instances cannot be modified. All of the information contained in each instance is provided when it is created and is fixed for the lifetime of the object.

翻译过来就是：
>不可变类只是其实例不能被修改的类，每个实例中包含的所有信息都必须在创建该实例的时候就提供，并在对象的整个生命周期内固定不变。

###如何创建一个不可变类？
要创建不可变类，只要遵循下面几条规则：
1. 不要提供任何会修改对象状态的方法。
2. 保证类不会被拓展（一般声明为final即可）。
3. 使所有的域都是 private final的。
4. 确保对于任何可变组件的互斥访问（可以理解如果中存在可变对象的域，得确保客户端无法获得其引用，并且不要使用客户端提供的对象来初始化这样的域）。

Java出于安全性等因素考虑将某些类如：String、基本类型的包装类、BigInteger、BigDecimal设计成为不可变类。

### 不可变类真的不能改变吗？
Java中的这些不可变类真的不能改变吗？我们不妨看下面的例子：
```
import java.lang.reflect.Field;

public class ChangeDemo {
	public static void change(String str) {
		if (null == str)
			return;
		try {
			Field f = String.class.getDeclaredField("value");
			f.setAccessible(true);
			char[] value_str = (char[]) f.get(str);
			value_str[0] = 'h';
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public static void change(Integer num) {
		if (null == num)
			return;
		try {
			Field f = Integer.class.getDeclaredField("value");
			f.setAccessible(true);
			int value = (int) f.get(num);
			f.set(num, value * 10);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public static void main(String[] args) {
		String a = "cat";
		System.out.println("before:a=" + a);
		change(a);
		System.out.println("after   :a=" + a);
		Integer num = 12;
		System.out.println("before:num=" + num);
		change(num);
		System.out.println("after   :num=" + num);
	}
}


```
输出：
>before:a=cat
after   :a=hat
before:num=12
after   :num=120

我们看到String、Integer这些不可变类都被改变了。但是不推荐大家这么干，这样会带来极大的安全隐患。
###暴力反射修改不可变类带来的安全隐患
例如：
```
import java.lang.reflect.Field;

public class ChangeDemo {
	public static void change(String str) {
		if (null == str)
			return;
		try {
			Field f = String.class.getDeclaredField("value");
			f.setAccessible(true);
			char[] value_str = (char[]) f.get(str);
			value_str[0] = 'h';
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	public static void main(String[] args) {
		String a = "cat";
		String b = "cat";
		System.out.println("before:a=" + a + ",b=" + b);
		change(a);
		System.out.println("after   :a=" + a + ",b=" + b);
	}
}

```
运行结果如下：
>before:a=cat,b=cat
after   :a=hat,b=hat

我们惊奇地发现虽然我们只希望改变a的值，但是b的值居然也被改变了。了解Java运行时内存结构的朋友应该知道，main方法中的a,b本身保存在main方法对应的栈帧的局部变量表中，它们是方法区常量池中"cat"的引用，change方法中的局部变量通过引用使用暴力反射改变了常量池中“cat”的内容，这直接导致了“cat”所有的引用的都带来了安全隐患。

当然，这个例子比较明显，那下面的例子您能够看出问题吗？
```
import java.lang.reflect.Field;

public class UnsafeChangeDemo {

	public static void main(String[] args) 
throws Exception {
		Integer a = 1;
		Integer b = 2;
		System.out.println("before:a = " + a + ", b = " + b);
		swap(a, b);
		System.out.println(" after  :a = " + a + ", b = " + b);
	}

	public static void swap(Integer a, Integer b) throws Exception {
		Field valueField = Integer.class.getDeclaredField("value");
		valueField.setAccessible(true);
		int aValue = (int) valueField.get(a);
		int bValue = (int) valueField.get(b);
		valueField.set(a, bValue);
		valueField.set(b, aValue);
	}

}
```
咋一看，这很简单啊，不过就是通过暴力反射交换Integer的值而言啊，真的这么简单吗？请看运行结果
>before:a = 1, b = 2
 after  :a = 2, b = 2

嗯？有没有搞错，怎么交换后a,b全部变成2了？问题在哪里？
我们来分析一下：
我们都知道，JDK1.5后提供了自动装拆箱的功能，其中Integer的自动装箱是通过调用Integer.valueOf(int)方法来实现的，我们不妨看一下源码：
```
public static Integer valueOf(int i) {
    assert IntegerCache.high >= 127;
    if (i >= IntegerCache.low && i <= IntegerCache.high)
        return IntegerCache.cache[i + (-IntegerCache.low)];//即为 IntegerCache.cache[i + 128 ];
    return new Integer(i);
}
```
在swap方法中，先通过Field的 get(Object)方法获取了a,b的值，然后通set(Object,Object)方法交叉赋值以达到交换a,b的目的。
但是set方法的参数是两个Object，所以这里将会触发自动装箱，了解Integer的朋友都知道（如果不清楚可以参考博主的博客[Java基本数据类型及其封装器的一些千丝万缕的纠葛](http://www.jianshu.com/p/cbf1f0a5784d) ）Integer内部默认提供了一个缓存数组static final Integer cache[256];来缓存-128~127的Integer对象。所以swap方法其中语句其实是这样的：
```
public static void swap(Integer a, Integer b) throws Exception {
    Field valueField = Integer.class.getDeclaredField("value");
    valueField.setAccessible(true);
    int aValue = (int) valueField.get(a);//1
    int bValue = (int) valueField.get(b);//2
   // 自动装箱  valueField.set(a, Integer.valueOf(2) );
    //即 valueField.set(a, IntegerCache.cache[130] );
    valueField.set(a, bValue);
    // 自动装箱 valueField.set(b, Integer.valueOf(1));
    //即valueField.set(b, IntegerCache.cache[129] );
    valueField.set(b, aValue);
}
```
调用valueField.set(a, bValue);方法，将2赋给了a,由于a是IntegerCache.cache[129]的一个引用，所以实际上是将2赋值给了IntegerCache.cache[129]。因此经过这个方法调用后，a由1变成了2，同时，IntegerCache.cache[129]也由1变成了2 ！！
在调用valueField.set(b, aValue)时，本希望将1赋给b，但由于自动装箱，其实上是将IntegerCache.cache[129] 的值赋值给b,然而IntegerCache.cache[129] 的值已经由1变成了2，所以，b仍然等于2！！！交换失败！！
好吧，一图胜千言，程序的运行时内存结构图如下：
![运行时内存结构图](http://upload-images.jianshu.io/upload_images/3781926-f84cd3d79e33c1f3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

完整的解析如下：
```
public static void main(String[] args) throws Exception {
    Integer a = 1;// 自动装箱  Integer.valueOf(1);
//即 IntegerCache.cache[129]
    Integer b = 2;// 自动装箱 Integer.valueOf(2); 
//即 IntegerCache.cache[130]
    swap(a, b);
    System.out.println(a + "," + b);
}
public static void swap(Integer a, Integer b) throws Exception {
    Field valueField = Integer.class.getDeclaredField("value");
    valueField.setAccessible(true);
    int aValue = (int) valueField.get(a);//1
    int bValue = (int) valueField.get(b);//2
    // 自动装箱  valueField.set(a, Integer.valueOf(2) );
    // 即 valueField.set(a, IntegerCache.cache[130]）;
    valueField.set(a, bValue);
    //a 的值被修改为 2 实际上是 IntegerCache.cache[129]的值被修改为 2
    // 再次自动装箱 valueField.set(b, Integer.valueOf(1));
    // 即valueField.set(b, IntegerCache.cache[129] );
    valueField.set(b, aValue);
    //注意，这里的 IntegerCache.cache[129] 已经被修改为 2了！！
    //所以 valueField.set(b, aValue); 相当于是 valueField.set(b, new Integer(2));
    //所以最后a,b都为2！！
}
```
我的天，是不是感觉很绕呢？所以不到万不得已，一定不要通过暴力反射来修改不可变类的状态！！
