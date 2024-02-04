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

       

### 创建和管理volumes

   与 bind mount 不同的是，你可以在容器管理区域外，直接创建 volumes

我们尝试创建一个 volume:

```shell
[root@localhost ~]# docker volume create my-vol
```
（备注：`#`符号是Linux命令自带的，在输入时，请不要加入哦）

查看创建的 volume:
```shell
[root@localhost ~]# docker volume ls

local     my-vol
```

检查 volume:
```shell
[root@localhost ~]# docker volume inspect my-vol

[
    {
        "CreatedAt": "2023-11-22T16:21:27+08:00",
        "Driver": "local",
        "Labels": null,
        "Mountpoint": "/var/lib/docker/volumes/my-vol/_data",
        "Name": "my-vol",
        "Options": null,
        "Scope": "local"
    }
]

```

删除一个 volume:
```shell
[root@localhost ~]# docker volume rm my-vol
my-vol
```

### 带 volume 启动容器

如果你启动容器时 volume 不存在，Docker 会为您自动创建。我们启动一个`nginx`来体验下：

```shell
[root@localhost ~]# docker run -d \
> --name devtest \
> --mount source=myvol2,target=/add \
> nginx:latest
beb26e026cda87cba28da416ac8357b3aff42b547f6939b6d84cef9d3694fea8
```
(备注: 在命令行结尾输入`\`后按回车键，命令光标会自动换行，可继续输入)

我们来检查（docker inspect）下容器的情况：

```shell
[root@localhost ~]# docker inspect devtest
"Mounts": [
   {
         "Type": "volume",
         "Name": "myvol2",
         "Source": "/var/lib/docker/volumes/myvol2/_data",
         "Destination": "/add",
         "Driver": "local",
         "Mode": "z",
         "RW": true,
         "Propagation": ""
   }
]
```
容器信息比较多，我们目前只要关注`Mount`的信息即可，从以上信息，我们可以得知挂载类型为`volume`，挂载的 Source（来源）和 Destination（目标），`RW`为`true` 表示容器具备读写权限。

我们尝试停止并删除容器：
```shell
[root@localhost ~]# docker container stop devtest

[root@localhost ~]# docker container rm devtest

[root@localhost ~]# docker volume ls
local     myvol2
```
我们也验证了，即使删除了容器，volume 仍然存在，除非主动删除。

### 在 Docker Compose 中使用 volume
(待写完docker-compose后补充)

### 在不同机器中共享数据

当我们在部署具备容错机制的应用时，我们一般会配置多台从机（主从架构）来读取一个相同的文件。

![20240201085556](https://cdn.jsdelivr.net/gh/Github-Stephen/blogPic/springboot/20240201085556.png)
<center>引用自Docker官网</center>


从上图可以看到，每台机器(node)部署了一些从服务（service-replica），运行在docker上，共享着相同的数据。

我们有多种方式达成**多个机器共享数据**的方式，如：
- 直接在应用程序中加入逻辑，存储数据到云对象存储如 Amazon S3 或者 minio等；
- 创建一个带驱动程序(driver)的 volume, 以此来支持读写外部文件如 [NFS](https://linux.vbird.org/linux_server/centos6/0330nfs.php#What_NFS_NFS) 或 Amazon S3；

Volume Driver 具备抽象性，也就是你无需关心底层存储如何运作，只需关心存储的（业务）逻辑即可。

### 使用 volume driver
（进阶用法，后续介绍）


### 备份、恢复、迁移数据
我们可以使用`--volumes-from`来创建一个绑定具体 volume 的容器，

#### 备份
我们启动一个新的容器：

(docker run -v启动失败问题：https://www.cnblogs.com/yangcl-blogs/p/10559839.html)




### 删除 volumes

我们知道 Docker 中的 volume，是不会随着容器删除而丢失的，对于 具名 Volume 和匿名 volume ，我们需要考虑：

- 具名 volume 在容器外，有一个指定的来源（docker 管理区域中的文件路径），如： myvol:/container_vol

- 匿名 volume 没有指定的来源，我们可以在删除容器时，**显示地**告知容器删除 volume 如：

`docker run --rm -v /foo -v new_vol:/bar ubuntu /bin/bash`）

以上命令，是启动容器时，删除容器里面的`foo`，并自动删除 Docker 引擎管理的对应的匿名 volume，同时新增一个挂载 `new_vol:/bar` 

### 删除所有 volume
`docker volume prune`




