---
outline: deep
---

## Docker存储

启动容器之后，所有文件名默认都存在出容器中，那么我们则需要注意一下几点：

- 如果容器被移除了，那么文件也将随之消失，在**容器外**的其他进程如果想获取**容器内**的文件，也比较困难
- 一个可写的容器层是紧密地与主机（也称`宿主机`）绑在一起，我们也很难把容器内的数据移动到其他地方
- 将数据写入容器时，我们需要`store driver` 来管理，它是基于 Linux 内核的一个文件系统的抽象实现，不过这个实现却会造成一些性能损耗

为了解决 Docker 在宿主机文件存储问题，Docker提供了两种方式：有两种方式 `volumes` 和 `bind mounts`.


借助官网一张图来看看这两种数据存储方式的区别：
![20240121090140](https://cdn.jsdelivr.net/gh/Github-Stephen/blogPic/springboot/20240121090140.png)

`Volumes 模式`： 实际存储在`宿主机`的文件系统中，只不过这个（文件）区域是被 Docker 所管理，我们通常可以在`/var/lib/docker/volumes/`（下称“Docker存储区”） 里查看得到;

`Bind mounts` 模式：可以存储在`宿主机`的任意位置， 它或许是一个重要文件，或者是一个目录。`宿主机`上的非 Docker 进程或者是在容器内可随意修改；

`temfs` mount模式： 只存储在`宿主机`的内存中，并且永远不会持久化到文件系统中；

清晰地了解每个模式的作用，才能在工作中运用自如，以上的模式，我们可以利用`-v`或者`--volume`来标识，不过这两个命令有轻微的区别，对于`tmpfs`模式，可以使用`--tmpfs`标识。不过通常使用`--mount`标识来挂载容器与服务之间的内容，这样更清晰和容易记忆。



### VOLUME

&emsp;&emsp;`volume`由 Docker 创建和管理的，我们可以是用`docker volume create`命令来创建一个`volume`，或者 Docker 会随着容器、服务的创建而新建一个`volume`.

&emsp;&emsp;当我们创建一个`volume`时，实际这个`volume`是存储在Docker所在的宿主机上一个目录中，上一小节已经讲过（Docker存储区）。当我们把这个`volume`挂载到容器中时，它的运作则有点像`bind mounts`，区别在于，`volume`是由 Docker 管理并独立于宿主机（通常部署的是 Linux 系统）的核心功能.

&emsp;&emsp;一个`volume`可以同时挂载到多个容器中。匿名的`volume`会获得一个随机且唯一的名称，除非你在创建容器时，主动使用`--rm`命令，否则`volume`将会一直存在与 Docker 所管理的区域中（Docker存储区）。

&emsp;&emsp;`volume`也支持`volume drivers`，这样我们可以把文件存储在远程服务器或者云存储等其他介质，这个后续我们在示例中再介绍。



### Bind mounts

&emsp;&emsp;`Bind mounts`相对于`volume`有一些限制。当你使用`bind mount`时，实际就是将`宿主机`的某个文件、目录挂载进容器而已，容器是指向了`宿主机`的完整路径，如 `/home/app/myfile:/docker/myfile`（宿主机路径：容器内路径）。`bind mount`在挂载时，Docker 所在区域 （Docker存储区）无需创建该目录，后台进程将会自动创建（相当于在 Linux 系统执行了 `mkdir -p /home/app`）。`Bind mounts`运行速度快，但是其依赖`宿主机`特定的文件目录结构。建议在开发新的容器程序时，优先使用`named volumes`。而且我们也无法通过`Docker CLI commonds`来管理`bind mounts`所操作的目录。


&emsp;&emsp;注意：`Bind mounts`默认具有`宿主机`的写入权限！ 这可能会带来一些安全的问题，因为容器可直接操作`宿主机`的文件系统（创建、更改、删除），或者`宿主机`上的其他非 Docker 进程，也可以破坏被`bind mount`的文件、目录。



以上介绍了一些 Docker 的存储方式，那我们可以来看看这些存储方式的最佳的应用场景：

## Volumes使用场景
- 多个容器共享数据，你无需手动创建挂载的内容，Docker 将会按照你的配置自动创建挂载关系。即使容器停止、删除，挂载的数据仍存在，如果需要删除挂载的内容，你可以指定命令删除(docker volume rm)

- 如果当 Docker 主机没有给定目录或者文件结构时，Volumes 可将 Docker 主机的配置和容器运行时进行解耦

- 让你想讲数据存储在云供应商时，可选择 Volumes 模式

- 当你准备备份、恢复、或者迁移数据到其他机器时，volumes 可能是很好的选择，你只要停止容器，然后进入到指定目录（Docker 存储区: `/var/lib/docker/volumes/<volume-name>`)即可访问得到

- 当你的程序运行在 Docker Desktop（图形化界面管理 Docker 的工具），且需要高性能I/O时，Volumes 通常存储数据是在Linux 虚拟机中，而不是宿主机上，这保证了低延迟和高吞吐的读写

- 让你的程序运行在 Docker Desktop 中且希望保持文件系统的原始的特性时。例如：数据库引擎需要精确地控制磁盘的刷新来确保事务的持久性

## Bind mounts使用场景
- 从宿主机共享配置文件到容器内。在默认情况下，这也是 Docker 提供 DNS 解决方案到容器内的方式，实际是将宿主机的`/etc/resolv.conf`挂载进去容器中

- 在宿主机和容器之间共享源码或者构建包（如 Java程序 打包后的 jar 包）。举个例子：我们可以将Maven中的`target/`目录挂载进容器，然后每次在宿主机打包（build）时，容器只要获取到读写权限，即可获取到 Maven 的构建包。
如果你是倾向于 Docker 的开发模式（在Docker容器运行服务），那你在定义 Dockerfile的时候，直接把预生产的构建包拷贝到镜像中，则不用依赖于Bind mounts了。

- 当文件、目录结构在宿主机、容器中需要保持一致时，如，宿主机、容器，myConfig 文件都放置于`/home/soft/conf`目录下。

<br/>

&emsp;&emsp;对比以上的使用场景，我们可以知道，Volumes 和 Bind mounts 有相似之处，都可以理解为宿主机与容器间的数据共享，却又不尽相同（使用场景），那么我们在决策时，应该有什么依据呢？

- 当你挂载一个空的 volume 进入到容器中已存在的文件或者目录时，容器内的文件、目录，将会`复制`到这个空的 volume 中；同理，如果你运行一个容器并定义一个不存在的 volume 时，容器将会自动创建，这对于一些具备初始化数据的容器非常有用，依赖于该容器的其他容器，则可以很方便的共享到这些数据

- 当你挂载一个 bind mounts 或非空 volume进入到容器已存在的文件、目录中，容器中的这些文件、目录将会被`mount`的机制所隐藏；举个例子，当你机器插入 USB 设备且被 Linux 系统识别为`/mnt`，此时往`mnt`写入数据，实际是写入了 USB 设备，但是 Linux 系统中实际的`mnt`并不会丢失，而是被隐藏（无法访问）了。当USB被拔出时，这个`mnt`目录则会重新恢复。




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






## Bind Mounts

Bind mounts 在 Docker 早期就已经存在，相对于 volumes ,它有一定的限制。 在使用 bind mount 时，实际是把宿主机的（绝对路径）目录挂载到容器中。相比之下，如果使用的是 volume ，则是由 Docker 的存储路径来进行挂载映射，存储内容由 Docker 进行管理。

Docker 将会自动为我们创建文件、目录，即使宿主机不存在挂载的目录。Bind mounts 相对性能较高，但是其依赖宿主机的文件系统，可能会导致您在其他事项（文件权限处理）花费时间。 如果您是开发 Docker 应用的新手，建议使用 具名volume (named volumes)。 另外，Bind mounts 也无法通过 Docker CLI commonds 进行管理。

## 选择 `-v` 或者 `--mounts` 标识

通常，`--mounts`会比较清晰且冗长。`-v`的语法则是将所有选项以参数的形式列出。

> 💡提示
> <br>
> 对于新手，可能学习`--mounts`会比较快；对手熟悉 Docker 的开发者，`-v`则会相对比较熟悉；不过通常建议使用`--mounts`，因为其相对容易使用。

`-v`和`--mount`的对比，我们可以参考[Volume - 选择 `-v` 或者 `--mounts` 标识](https://www.baidu.com)。


## `-v` 和 `--mounts`的不同表现

由于`-v`或`--volume`在 Docker 早期就已经存在，所以他们的运作模式不会被改变，那么区别是在`-v`和`--mounts`上：

- 如果您使用`-v`或者`--volume`去 bind-mount 文件或者目录，（这些文件、目录）并不存在于宿主机上，Docker 会提供一个入口，往往是以创建目录的形式；

- 如果您使用的是`--mounts`来 bind-mount 文件或者目录，（这些文件、目录）并不存在于宿主机上，Docker **不会** 自动创建文件，目录，而是会抛出一个错误。

## 使用 bind mount 的方式来启动一个容器

我们可以假设一个场景， （在宿主机）有一个源码的目录如`source`，通过打包后，生成的构建包（如jar）会存放在`source/target`目录下。我们希望容器中的`/app/`目录能读取到构建包。

### 使用`--mount` 

```shell
[root@localhost home]# docker run -d   -it   --name devtest   --mount type=bind,source="$(pwd)"/target,target=/app   nginx:latest
```

以上命令，表示挂载方式为 bind mount，`source`是当前工作目录 $(pwd) 下的 target 目录，容器内目标路径是 /app

如果 source 目录不存在，则 Docker 将会抛出一个错误：
```shell
docker: Error response from daemon: invalid mount config for type "bind": bind source path does not exist: /home/target.
```

我们只要在宿主机创建正确的目录(home/target)，再执行`--mount`即可成功挂载并启动容器。

### 使用`-v`

```shell
[root@localhost home]# docker run -d   -it   --name devtest   -v "$(pwd)"/target:/app   nginx:latest
```

与`--mount`的区别在于，`-v`会自动创建宿主机的目录。我们可以使用`docker inspect devtest`查看下挂载情况：

```shell
 "Mounts": [
    {
        "Type": "bind",
        "Source": "/home/target",
        "Destination": "/app",
        "Mode": "",
        "RW": true,
        "Propagation": "rprivate"
    }
],
```

## 挂载到容器中非空的目录

如之前章节说明过，挂载到一个非空的目录，那么该目录的内容，将会被**隐藏**。这个**隐藏**的特性，你可以使用同一镜像，来测试不同版本的 Docker 应用。