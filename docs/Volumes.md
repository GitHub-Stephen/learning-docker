---
outline: deep
---

## Volumes

Volumes 是 Docker 容器中良好的存储数据的机制。相对于 bind mounts 需要依赖目录结构或宿主机的操作系统，Volumes 是完全由 Docker管理的。对比来说，Volumes 有以下优势：

- Volumes 容易备份和迁移；
- 可以使用 Docker CLI 命令行或者 Docker API 来管理 Volumes；
- Volumes 可以很好地运行在 Windows、Linux 的容器中；
- Volumes 可以安全地与其他容器共享数据（因其在 Docker 管理之下，无法破坏宿主机文件系统）；
- Volumes 驱动程序，可以让我们存储数据到远程机器、云提供商，加密存储内容，或者加入其他功能；
- 一个新的 Volumes 可以从其他容器中，获得预加载的内容；
- 在 Mac、Windows 的 Docker Desktop 中，Volumes 相对于 bind mounts 拥有更好的性能;


### 选择 `-v` 或者 `-mount`标识

在使用 Volumes 之前，我们有必要了解下以上命令的区别：

- `-v`和`--volume`：由3个参数组成，并且中间以(`:`)间隔开，参数排序必须是正确的，但是每个参数的含义确不是特别明显，我们来阐述一下；
    
    - 对于具名 volumes，第1个参数是 volume 的名称，这个名字是宿主机内唯一的。对于匿名 volumes 第一个字段则可以省略；（具名 volume 和匿名 volume 通常可以从字面理解，前者有名称，方便记忆，后者随机名称，沿用 Docker 生成的唯一名字）

    - 第2个参数则表示哪个目录需要挂载到容器中

    - 第3个参数是可选的，主要是一些更细化的操作，后续使用中，我们可继续讲解；


 - `--mount`：由多组`key:value`组成，以(`,`)分割，`--mount`相对于`-v`和`-volume`来说，会比较冗长，但是命令中`key`的顺序并没有要求，且每个`key`的含义都比较清晰

    - `type`表示挂载的类型，可以是`bind`、`volume`、`tmpfs`，本章讨论的是 volumes，以`volume`为主

    - `source`相对于 具名 volumes，则是表示 volume 的名称，对于匿名 volume，这个 key 则可以省略。`source`也可以简写为`src` 

    - `destination`则是表示哪个目录挂载进容器。也可以简写为`dst`或者`target`
    
    - `readonly`如果被设置了，对于bind mount 则是相当于挂载进容器的目录，只有读取权限。可简写为`ro`

    -  `volume-opt`选项可被定义多次，以 key-value 的方式组成

       


