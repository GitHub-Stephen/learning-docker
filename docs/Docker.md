---
outline: deep
---




# 架构与功能模块

## 架构图









## 客户端

Docker命令

DockerAPI ：可使用restful API操作dockers



## 服务器

Docker daemon ： dockerd， 相当于docker的后台进程。

Docker Daemon配置文件：一般默认在/etc/systemd/system/docker.service.d/

Rocky Linux是在lib/systemd/system/ 下



## 镜像

> 容器模板

- Docker命令 - docker commit : 打包镜像

- Dockerfile : 描述打包过程的文件，以base image不断堆叠成新的镜像；

## 镜像仓库

- Docker Hub - 官方仓库

- Docker Datacenter - Docker信任仓库（企业版）

- Docker私有仓库 - Harbor等



## 容器

隔离： 通过namespace（pid,net,ipc,mnt,uts)

共享物理资源的同时，容器间又互不影响。

限制：cgroup(cpu,mem,io)

文件系统： UnionFS



# 环境搭建

## 安装docker

> 官网方式

参考：

https://docs.docker.com/engine/install/centos/


设置docker软件源

```shell
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
```





采用便捷的yum安装

- 查看docker-engine版本

```shell
yum list docker-ce --showduplicates | sort -r
```



- 查看docker-cli版本

```shell
yum list docker-ce-cli --showduplicates | sort -r
```



- 插件版本

```shell
[root@localhost ~]# yum list docker-buildx-plugin --showduplicates | sort -r
docker-buildx-plugin.aarch64            0.11.1-1.el9            docker-ce-stable
docker-buildx-plugin.aarch64            0.10.5-1.el9            docker-ce-stable
docker-buildx-plugin.aarch64            0.10.4-1.el9            docker-ce-stable
docker-buildx-plugin.aarch64            0.10.2-1.el9            docker-ce-stable
Last metadata expiration check: 0:08:02 ago on Tue Jul 11 13:44:00 2023.

```

docker-compose插件

```shell
[root@localhost ~]# yum list docker-compose-plugin --showduplicates | sort -r
docker-compose-plugin.aarch64           2.6.0-3.el9             docker-ce-stable
docker-compose-plugin.aarch64           2.5.0-3.el9             docker-ce-stable
docker-compose-plugin.aarch64           2.19.1-1.el9            docker-ce-stable
docker-compose-plugin.aarch64           2.18.1-1.el9            docker-ce-stable
docker-compose-plugin.aarch64           2.17.3-1.el9            docker-ce-stable
docker-compose-plugin.aarch64           2.17.2-1.el9            docker-ce-stable
docker-compose-plugin.aarch64           2.16.0-1.el9            docker-ce-stable
docker-compose-plugin.aarch64           2.15.1-3.el9            docker-ce-stable
docker-compose-plugin.aarch64           2.15.1-1.el9            docker-ce-stable
docker-compose-plugin.aarch64           2.14.1-3.el9            docker-ce-stable
docker-compose-plugin.aarch64           2.12.2-3.el9            docker-ce-stable
docker-compose-plugin.aarch64           2.12.0-3.el9            docker-ce-stable
docker-compose-plugin.aarch64           2.11.2-3.el9            docker-ce-stable
docker-compose-plugin.aarch64           2.10.2-3.el9            docker-ce-stable
```



- 指定版本安装

```shell
sudo yum install docker-ce-3:20.10.24-3.el9 docker-ce-cli-1:20.10.24-3.el9 containerd.io docker-compose-plugin-2.19.1-1.el9
```



- 安装目录概览：

![20240121063616](https://cdn.jsdelivr.net/gh/Github-Stephen/blogPic/springboot/20240121063616.png)



安装后检查文件报错：

```shell
Error: Transaction test error:
  file /usr/libexec/docker/cli-plugins/docker-buildx conflicts between attempted installs of docker-buildx-plugin-0:0.11.1-1.el9.aarch64 and docker-ce-cli-1:20.10.24-3.el9.aarch64
```

解决办法：去掉 buildx 插件，在19.版本里，docker-cli 已经有相关插件

```shell
sudo yum install docker-ce-3:20.10.24-3.el9 docker-ce-cli-1:20.10.24-3.el9 containerd.io docker-compose-plugin-2.19.1-1.el9
```


检查是否安装成功：
```shell
[root@localhost ~]# docker version
Client: Docker Engine - Community
 Version:           24.0.5
 API version:       1.43
 Go version:        go1.20.6
 Git commit:        ced0996
 Built:             Fri Jul 21 20:36:30 2023
 OS/Arch:           linux/arm64
 Context:           default

# 省略部分输出
```
控制台输出了 docker-cli的版本号，表示安装完毕.



- 启动docker

```shell
[root@localhost ~]# sudo systemctl start docker
```

- helloworld程序

```shell
[root@localhost ~]#  sudo docker run hello-world
Unable to find image 'hello-world:latest' locally
latest: Pulling from library/hello-world
70f5ac315c5a: Pull complete 
Digest: sha256:926fac19d22aa2d60f1a276b66a20eb765fbeea2db5dbdaafeb456ad8ce81598
Status: Downloaded newer image for hello-world:latest
```

一些细节：我们可以看到docker是先找本地镜像，找不到，再去找远程镜像仓库。



- helloword程序打印

 ```shell
 Hello from Docker!
 This message shows that your installation appears to be working correctly.
 
 #省略部分控制台输出
 ```

至此，我们已经安装并尝试运行 Docker 啦~




## 其他中间件的运行

#### redis

- 运行redis容器

```shell
# 后台进程的方式，并运行redis-server服务端
docker run -d redis:3.2 redis-server
```

- 检查是否安装好

```shell
[root@localhost ~]# docker ps
CONTAINER ID   IMAGE       COMMAND                  CREATED         STATUS         PORTS      NAMES
bf4a4b5d7467   redis:3.2   "docker-entrypoint.s…"   8 seconds ago   Up 7 seconds   6379/tcp   inspiring_jang
```

`bf4a4b5d7467`：代表容器ID



- 启动后，以客户端的方式连接redis：

```shell


[root@localhost ~]# docker exec -it bf4a4b5d7467 redis-cli
127.0.0.1:6379> set abc haha
OK
127.0.0.1:6379> get abc
"haha"
```

`redis-cli`：表示在进入容器后，使用该命令，常用的也有`bash`命令


<br/>
<br/>

# 容器生命周期

> 增删改查



- 拉取镜像：

docker pull 镜像名称



- 创建容器:

docker create 镜像名称



- 停止容器：

docker stop 容器ID



- 暂停容器：

docker stop 容器ID



- 停止容器进程：

docker kill 容器ID



- 重启容器：

docker restart 容器ID



- 删除容器：

docker rm 容器ID



- 容器资源限制

docker run --help

可以查看到有针对cpu和内存

```shell
# CPU相关
-c, --cpu-shares int                 CPU shares (relative weight)
      --cpus decimal                   Number of CPUs
      --cpuset-cpus string             CPUs in which to allow execution (0-3, 0,1)
      --cpuset-mems string             MEMs in which to allow execution (0-3, 0,1)


# 硬盘相关
-d, --detach                         Run container in background and print container ID
      --detach-keys string             Override the key sequence for detaching a container
      --device list                    Add a host device to the container
      --device-cgroup-rule list        Add a rule to the cgroup allowed devices list
      --device-read-bps list           Limit read rate (bytes per second) from a device (default [])
      --device-read-iops list          Limit read rate (IO per second) from a device (default [])
      --device-write-bps list          Limit write rate (bytes per second) to a device (default [])
      --device-write-iops list         Limit write rate (IO per second) to a device (default [])

# 内存相关
-m, --memory bytes                   Memory limit
      --memory-reservation bytes       Memory soft limit
      --memory-swap bytes              Swap limit equal to memory plus swap: '-1' to enable unlimited swap
      --memory-swappiness int          Tune container memory swappiness (0 to 100) (default -1)

```





# Docker镜像制作与管理

Centos上运行Debian rootfs的图例：

![img](https://climg.mukewang.com/5e93f2c30863605d08000600.jpg)





## DockerFile制作

DockerFile是可以作为镜像制作的描述文件，在运行`docker build`时，docker会依照dockerfile的描述内容进行打包。

`FROM` ： 指定基础镜像

`RUN`：在容器中执行命令；如： RUN mkdir test 在容器中新建一个test的文件夹；

`ADD` : 将当前目录（dockerfile所在目录）下的文件复制到容器中，如果源文件是一个压缩文件，会先解压再复制到容器中。

`ENTEYPOINT` : 执行shell命令，如 `ENTRYPOINT ["/bin/bash"]` 会在容器启动后，执行bash命令。



## 镜像仓库

### 私有仓库

可以在虚拟机、物理机的基础上，搭建registry容器。

假设目前有两台机器：

192.168.176.130： 仓库机

192.168.176.129：镜像打包机器



- 在作为仓库机拉取registry镜像并启动

```shell
192.168.176.130> docker run -it -d -p 5000:5000 -v /root/registry:/var/lib/registry --restart=always --name registry registry:latest
```



- 在镜像打包机器拉取新的进行并打包作为推送镜像来源

```shell
# 拉取公共镜像
192.168.176.129> docker pull hello-world

192.168.176.129> docker tag hello-world 192.168.176.130:5000/newhello
```

打包后推送至镜像仓库

```shell
192.168.176.129> docker push 192.168.176.130:5000/newhello
```



推送异常：

```shell
The push refers to repository [192.168.176.130:5000/newhello]
Get "https://192.168.176.130:5000/v2/": http: server gave HTTP response to HTTPS client
```

需要禁用打包机的https限制：

```shell
vi /lib/systemd/system/docker.service
```

打包机的docker无法需要重启：

```shell
# 重载配置
systemctl daemon-reload
# 重启服务
systemctl restart docker

```



推送成功：

```shell
docker push 192.168.176.130:5000/newhello
Using default tag: latest
The push refers to repository [192.168.176.130:5000/newhello]
a7866053acac: Pushed 
latest: digest: sha256:efebf0f7aee69450f99deafe11121afa720abed733943e50581a9dc7540689c8 size: 525
```

使用命令查看仓库镜像情况：

```shell
[root@localhost ~]# curl -X GET http://192.168.176.130:5000/v2/_catalog
{"repositories":["newhello"]}
```
我们可以看到私有仓库，已经有一个`newhello`的镜像了.


<br/>
<br/>


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

- 在宿主机和容器之间共享源码或者构建包（如 Java程序 打包后的 jar 包）。举个例子：我们可以将Maven中的`target/`目录挂载进容器，然后每次在宿主机打包（build)时，容器只要获取到读写权限，即可获取到 Maven 的构建包。
如果你是倾向于 Docker 的开发模式（在Docker容器运行服务），那你在定义 Dockerfile的时候，直接把预生产的构建包拷贝到镜像中，则不用依赖于Bind mounts了。

- 当文件、目录结构在宿主机、容器中需要保持一致时，如，宿主机、容器，myConfig 文件都放置于`/home/soft/conf`目录下。

<br/>

&emsp;&emsp;对比以上的使用场景，我们可以知道，Volumes 和 Bind mounts 有相似之处，都可以理解为宿主机与容器间的数据共享，却又不尽相同（使用场景），那么我们在决策时，应该有什么依据呢？

- 当你挂载一个空的 volume 进入到容器中已存在的文件或者目录时，容器内的文件、目录，将会`复制`到这个空的 volume 中；同理，如果你运行一个容器并定义一个不存在的 volume 时，容器将会自动创建，这对于一些具备初始化数据的容器非常有用，依赖于该容器的其他容器，则可以很方便的共享到这些数据

- 当你挂载一个 bind mounts 或非空 volume进入到容器已存在的文件、目录中，这些文件、目录将会被`mount`的机制所隐藏；
