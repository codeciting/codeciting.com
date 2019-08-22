---

sidebar: auto
sidebarDepth: 2

---

# Elastic Search

Elastic Search是一个分布式的索引服务。它索引的内容是以文档为基本单位的结构化数据，并且默认支持长文本的全文搜索（分词）。

## 基本概念

### Node - 节点

分布式的服务由一个或多个节点组成，节点之间使用`Transport`通信，外部服务通过`HTTP`访问节点。

集群中所有节点都了解其他节点的状态，并能够将请求转发到合适的节点。

默认情况下，一个节点同时具备以下类型：`master-eligible`、`data`、`ingest`和`machine learning`。

::: tip

当集群增长并且你有机器学习任务时，最好将`master-eligible`、`data`和`machine learning`分开来。

:::

#### Master-eligible node

节点的`node.master`属性被设为`true`（默认值）时，它可以被选举为`master node`管理集群。

#### Data node

节点的`node.data`属性被设为`true`（默认值）时，节点储存数据并且执行数据相关的增删改查、搜索以及聚合操作。

#### Ingest node

节点的`node.ingest`属性被设为`true`（默认值）时，节点可以在文档执行索引前执行`ingest pipline`操作以丰富文档。
当摄取操作过于繁重时，最好使用单独的摄取节点并将可称为主节点的`node.ingest`设为`false`。

#### Machine learning node

节点的`xpack.ml.enabled`与`node.ml`设为`true`时（默认值），节点会执行机器学习任务。

#### Coordinating only node

此类型节点只处理路由、搜索的`reduce`阶段以及派发索引任务。本质上协调节点类似于比较智能的负载均衡。

### Index - 索引

TODO
