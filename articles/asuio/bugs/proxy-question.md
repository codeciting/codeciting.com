---

sidebar: auto
sidebarDepth: 2

---

# 记一次小bug（1）
`Spring` `代理` `注解失效`
## 起因
那天，我在写一个玩具（自己写着玩的玩具）系统（Spring boot开发），在执行某些操作的时候，需要频繁用到当前用户的ID，而我当时竟然蠢的忘记了用户ID在用户登录的时候我已经发送给前端了，只要前端传给我就好了。于是，每次请求到来，我就从session中获取当前用户的email，然后去查数据库得到用户ID，这时机智的我想到了一个问题，这点破事这么频繁的请求数据库，是不是不好？嗯，是不好，于是我决定加一个缓存，中央已经决定了，要加一个缓存。于是我去查了一下Spring对缓存的支持，哇咔咔，还真的有，支持了[一堆](https://docs.spring.io/spring-boot/docs/2.2.1.RELEASE/reference/htmlsingle/#boot-features-caching-provider)。  
这样一个如下的缓存就加上了，别问我为啥选caffeine，因为我咖啡过敏。
```yaml
spring:
  cache:
    cache-names: userCache
    type: caffeine
    caffeine:
      spec: initialCapacity=10,maximumSize=200,expireAfterAccess=1800s
```

于是就开始了如下的代码测试：
```java
// service 层代码
@Service
class XXXServiceImpl implements XXXService{

    @Cacheable(value = "userCache", key = "#email", unless = "#result == null")
    public String getUserId(String email){
        System.out.println("query");
        UserEntity u = userDao.findByEmail(email);
        if(u == null) return null;
        return u.getId();
    }
}
```
在上面的代码中，执行带有Cacheable注解的方法，会先去cache中查询key是否存在，如果key已经存在就返回相应的value；如果不存在，就执行方法内的逻辑，将返回结果作为value，将传入的email作为key存入到缓存中。这样在一段时间内再查询这个email，就会从缓存中请求值。
```java

@Autowired
private XXXService xxxService;

@Test
public void getUserId(){
    String email = "admin@test.com";
    System.out.println(xxxService.getUserId(email));
    System.out.println(xxxService.getUserId(email));
    System.out.println(xxxService.getUserId(email));
}
```
看着测试只输出了一次 query，输出了三次用户Id，我感觉这个应该没什么问题了。   
于是我又写了如下的代码：
```java
// service 层代码
@Service
class XXXServiceImpl implements XXXService{

    @Cacheable(value = "userCache", key = "#email", unless = "#result == null")
    public String getUserId(String email){
        System.out.println("query");
        UserEntity u = userDao.findByEmail(email);
        if(u == null) return null;
        return u.getId();
    }

    public void addMem(InputEntity entity){
        //
        String email = entity.getCreateBy();
        String userId = this.getUserId(email);  
        //
    }
}
```
写完上面的代码，我意识到我应该将getUserId这个方法，放到一个工具类里面，方便其他模块调用。但是，本着写都写了的精神，测试一下吧。然后我就发了几条请求，结果发现，每次请求都输出了query。@Cacheable这个注解竟然失效了。
## 查找
在连续又发送了十几次请求之后，我确定@Cacheable这个注解确实失效了。于是我又对getUserId这个方法做了一些修改：
``` java
// service 层代码
@Service
class XXXServiceImpl implements XXXService{

    @Autowired
    private CacheManager cacheManager;

    public String getUserId(String email){
        Cache cache = cacheManager.getCache("userCache");
        String userId = cache.get(email, String.class);
        if(userId != null) return userId;
        String value = userDao.findByEmail(email);
        if(value == null) return value;
        cache.put(email, value);
        return value;
    }

    @Cacheable(value = "userCache", key = "#email", unless = "#result == null")
    public String getUserIdWithAnnotation(String email){
        System.out.println("query");
        UserEntity u = userDao.findByEmail(email);
        if(u == null) return null;
        return u.getId();
    }
    ...
}
```
上面这段代码，我放弃了使用Cacheable这个注解，直接使用了cache的对象，进行存取操作。  
然后我又发送了几条请求，这次只输出了一条query，这证明了cache本身是没有问题的。然后，我又在Controller层直接调用了带有Cacheable注解的getUserIdWithAnnotation的方法,也只是输出了一次query。
再接着，我又将使用Cacheable注解的方法放到了CacheUtil类里面，然后也进行了几次测试，这次依然是只输出了一行query，Cacheable这个注解，并没有失效。这时我忽然想起来了Spring的代理。

## 总结

在Spring中，代理有两种实现方式，分别是JDK代理和Cglib代理。如果目标类是接口，使用JDK代理去实现。否则则使用Cglib实现。  
JDK实现的方式为，实现目标类的接口，创建一个新的类，在该类中，调用被代理的类的方法。
Cglib实现的方式为，创建一个目标类的子类，在该类中，复用目标类（父类）的方法。

JDK代理实现的方式：

```java
public class DynamicProxyTest {
    interface IHello{
        void sayHello(String str);
    }
    static class Hello implements IHello{
        public void sayHello(String str) {
            System.out.println("hello " + str);
        }
    }

    static class DynamicProxy implements InvocationHandler{
        Object originalObj;
        Object bind(Object originalObj){
            this.originalObj = originalObj;

            return Proxy.newProxyInstance(originalObj.getClass().getClassLoader(),originalObj.getClass().getInterfaces(), this);
        }
        public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
            System.out.println("start");
            Object object =  method.invoke(originalObj, args);
            System.out.println("end");
            return object;
        }
    }
    public static void main(String[] args) throws InstantiationException, IllegalAccessException {
       IHello hello = (IHello) new DynamicProxy().bind(new Hello());
       System.out.println(hello.getClass().getInterfaces()[0]);
       System.out.println(hello.getClass().getName());
       hello.sayHello("test");
       System.out.println("----------");
       IHello hello2 = new Hello();
       System.out.println(hello2.getClass().getInterfaces()[0]);
       System.out.println(hello2.getClass().getName());
       hello2.sayHello("test");
    }
}
```
这段代码的输出结果为：
```
interface DynamicProxyTest$IHello
$Proxy0
start
hello test
end
----------
interface DynamicProxyTest$IHello
DynamicProxyTest$Hello
hello test
```
上面的代码中，创建了一个接口IHello，并创建了一个内部类Hello实现了这个接口，接着重点就是DynamicProxy类，这个类实现了JDK代理的InvocationHandler接口。
```java
public interface InvocationHandler {
    public Object invoke(Object proxy, Method method, Object[] args)
        throws Throwable;
}
```
这个接口，只定义了invoke方法。在DynamicProxy类中，自定义了bind方法，将目标类的对象绑定到DynamicProxy对象中。并实现了invoke方法。在invoke方法中，method.invoke方法就是执行目标类的相应方法。    
在上面的输出结果中，可以看到这样几个事情：
- 输出的hello和hello2实现的接口是一致的。
- 输出的hello和hello2的类信息是不一样，hello2就是上面正常实现的内部类；hello是一个从来没有见过的，也没有实现的类$Proxy0，而这个类是JDK代理为我们生成的代理类。
- 在执行sayHello()方法时，hello对象执行的时候多输出了两行，而这两行就是method.invoke方法前后的两条输出语句的。    

通过上面的信息可以确定JDK代理成功了。然而，这和@Cacheable失效有什么关系呢？现在回想一下Cacheable失效的条件。XXServiceImpl对象两个方法A和B，A方法上添加了Cacheable注解，B方法没有添加，在B中调用A时，注解失效了。再看到上面JDK代理中的invoke方法的代码，不难想到，在Spring中Cacheable这个注解的相关功能，就是在invoke方法执行期间进行的。代理类每次调用方法的时候，在invoke方法中，就会去判断该方法是否要执行@Cacheable的相关行为，如果需要执行就执行开启相关的服务的代码，不需要就不执行。回到JDK代理中，在XXServiceImpl中，为何执行B方法，A方法的Cacheable注解会失效呢？因为代理类在执行B方法的时候，发现B方法不需要执行缓存相关的代码，代理类也不知道在B方法内部会调用A方法，而且B方法调用A方法并不是触发代理类调用A方法，因为无论是B方法还是A方法，真正的执行对象都是我们在bind方法中绑定的originObj，代理类就是真的就是名义上的代理类。在上面的代码中，修改Hello类的sayHello方法：
```java
public void sayHello(String str) {
    stem.out.println(this.getClass().getName());
    System.out.println("hello " + str);
}
```
执行程序，输出的并不是代理类$Proxy0，而是DynamicProxyTest$Hello类。  
在Spring中JDK代理相关类为JdkDynamicAopProxy。在JdkDynamicAopProxy的源码中，可以看到，它实现了InvocationHandler接口。
```java
final class JdkDynamicAopProxy implements AopProxy, InvocationHandler, Serializable{
  ...
}
```
在JdkDynamicAopProxy类实现的invoke方法中，有如下代码：
```java
target = targetSource.getTarget();
Class<?> targetClass = (target != null ? target.getClass() : null);

List<Object> chain = this.advised.getInterceptorsAndDynamicInterceptionAdvice(method, targetClass);

if (chain.isEmpty()) {
	 Object[] argsToUse = AopProxyUtils.adaptArgumentsIfNecessary(method, args);
	 retVal = AopUtils.invokeJoinpointUsingReflection(target, method, argsToUse);
}
else {
    MethodInvocation invocation = new ReflectiveMethodInvocation(proxy, target, method, args, targetClass, chain);
    retVal = invocation.proceed();
}
```
List对象chain便是获取将要执行的方法要执行的Interceptor。如果chain.isEmpty()为真，那么就直接执行。否则就执行invocation对象的proced方法。  
```java
public Object proceed() throws Throwable {
		if (this.currentInterceptorIndex == this.interceptorsAndDynamicMethodMatchers.size() - 1) {
			  return invokeJoinpoint();
		}

		Object interceptorOrInterceptionAdvice =
				this.interceptorsAndDynamicMethodMatchers.get(++this.currentInterceptorIndex);
		if (interceptorOrInterceptionAdvice instanceof InterceptorAndDynamicMethodMatcher) {
			InterceptorAndDynamicMethodMatcher dm =
					(InterceptorAndDynamicMethodMatcher) interceptorOrInterceptionAdvice;
			Class<?> targetClass = (this.targetClass != null ? this.targetClass : this.method.getDeclaringClass());
			if (dm.methodMatcher.matches(this.method, targetClass, this.arguments)) {
				return dm.interceptor.invoke(this);
			}
			else {
				return proceed();
			}
		}
		else {
			return ((MethodInterceptor) interceptorOrInterceptionAdvice).invoke(this);
		}
}
```
上面便是proceed方法，方法中的this.interceptorsAndDynamicMethodMatchers就是在Invoke方法中传递进来的chain，从interceptorsAndDynamicMethodMatchers里面获取将要执行的Interceptor，在方法的最后调用了MethodInterceptor接口的invoke方法。在MethodInterceptor接口的实现类里面，有一个CacheInterceptor的类，和Cache相关的操作全部都是在这里完成的。注意MethodInterceptor的invoke方法传递的参数是ReflectiveMethodInvocation对象本身，这样在具体的MethodInterceptor中再次调用ReflectiveMethodInvocation的proceed方法，就能获取下一个MethodInterceptor，一直循环到所有MethodInterceptor全部取出，最后执行方法，将结果层层返回，每层MethodInterceptor做相应的处理。
