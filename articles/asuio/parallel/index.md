# 并发编程的挑战

并发编程是为了让程序运行的更快，但是，并不是启动更多的线程就能让程序最大限度的并发执行。会面临非常多的挑战，比如上下文切换问题，死锁问题，以及受限于硬件和软件的资源限制问题。

## 上下文切换
即使是单核处理器也支持执行多线程代码，cpu通过给每个线程分配cpu时间片来实现这个机制。

cpu通过时间片分配算法来循环执行任务，当前执行任务一个时间片后会切换到下一个任务。但是，切换前要保存当前任务的状态，以便下次切换回这个任务时，可以再加载这个任务的状态。所以任务从保存到再加载的过程就是一次时间片切换。

#### 多线程一定快吗？
```java
public class ConcurrencyTest {
    private static final long count = 1000l;

    public static void main(String[] args) throws InterruptedException {
        concurrency();
        serial();
    }

    private static void concurrency() throws InterruptedException {
        long start = System.currentTimeMillis();
        Thread thread = new Thread(new Runnable() {

            public void run() {
                int a = 0;
                for (long i = 0; i < count; i++) {
                    a += 5;
                }
            }
        });
        thread.start();
        int b = 0;
        for (long i = 0; i < count; i++) {
            b--;
        }
        long time = System.currentTimeMillis() - start;
        thread.join();
        System.out.println("concurrency :" + time + "ms,b=" + b);
    }

    private static void serial() {
        long start = System.currentTimeMillis();
        int a = 0;
        for (long i = 0; i < count; i++) {
            a += 5;
        }
        int b = 0;
        for (long i = 0; i < count; i++) {
            b--;
        }
        long time = System.currentTimeMillis() - start;
        System.out.println("serial:" + time + "ms,b=" + b + ",a=" + a);
    }
}

```
执行上面这段代码，不断提高循环的次数count，可以当count的值非常大的时候，在执行时间上，多线程才会有明显的优势。当小于一定的次数的时候，并发执行的速度是会比串行慢的。

`这是因为线程有创建和上下文切换的开销`

#### 如何减少上下文的切换
- 无锁并发编程：多线程竞争锁时，会引起上下文切换。所以多线程处理数据的时候，可以用一些办法来避免使用锁，如将数据的ID按照Hash算法取模分段，不同的线程处理不同段的数据
- CAS算法：Java的Atomic包使用CAS算法来更新数据，而不需要加锁
- 使用最少线程：避免创建不需要的线程，比如任务很少，但是创建了很多的线程来处理，这样会造成大量线程都处于等待状态
- 协程：在单线程里实现多任务调度，并在单线程里维持多个任务间的切换。


## 死锁
#### 避免死锁的几个常见方法
- 避免一个线程同时获取多个锁
- 避免一个线程在锁内同时占用多个资源，尽量保证每个锁只占用一个资源
- 尝试使用定时锁，使用lock.tryLock(timeout)来代替使用内部锁机制
- 对于数据库锁，加锁和解锁必须在一个数据库链接里，负责会出现解锁失败的情况

## 资源限制的挑战
（1）什么是资源限制
资源限制是指在进行并发编程时，程序的执行速度受限于计算机硬件资源或软件资源
（2）资源限制引发的问题
如果某段并行执行的代码受限于资源，仍然在串行执行，这个时候程序不仅不会加快执行，反而因为增加了上下文切换和资源调度的时间变的更慢了。
（3）如何解决资源限制的问题
对于硬件资源限制，可以考虑使用集群并行执行程序。单机资源有限可以让程序在多机器上运行
对于软件资源限制，可以考虑资源池复用。
（4）在资源限制的情况下进行并发编程
根据不同的资源限制调整程序的并发度。下载依赖带宽和硬盘读写速度，数据库连接涉及数据库连接数。
