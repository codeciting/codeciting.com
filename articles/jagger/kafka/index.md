# Kafka

## Design

[原文](https://kafka.apache.org/documentation/#design)

### 动机

Kafka被设计为一个支持大公司处理实时数据的统一平台。
为了实现这一目标，我们不得不考虑非常广泛的用例。

它应该具有高吞吐量，以支持大体积的流式事件，如日志聚合。

它需要能优雅的处理大量的数据积压以支持离线系统周期性的数据负载。

它也要能够实现低延迟分发以处理传统的消息组件用例。

我们希望隔离化（partitioned）分布式实时进程处理这些数据，并派生新的数据，这也是我们`partitioning`和消费者模型的动机。

最后，我们希望在数据流发送到其他系统提供服务时，保证在机器故障下的容错性。

我们设计了大量独立的元素来支持这些用法，它更像是一个数据库日志而不是传统的消息系统。我们会在以下几节概括这其中的一些元素。

### 储存

***不要惧怕文件系统！***

Kafka在储存和缓存消息中重度依赖文件系统。在"磁盘运行的很慢"的普遍观点下，人们怀疑一个持久化的结构会对性能造成不菲的影响。
实际上磁盘的速度取决于人们如何使用它；良好的设计可以使磁盘具有和网络相同的速度。

***TO BE DONE***
