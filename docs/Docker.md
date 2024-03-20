

## Docker 概述

Docker 是一个服务于开发、装载、运行应用的开源平台。 当您在 Docker 平台上开发应用程序，您无需关注基础设施（存储、网络等），因此可提升您交付应用的效率。当然，您也可以像管理应用程序的方式来管理基础设施（简单上手）。通过 Docker 的运作模式来 构建、测试、开发应用，能显式地提升从开发到部署生产的效率。

### Docker 平台

&emsp;&emsp;Docker 提供了一个松耦合、独立的环境，用于打包、构建您的应用程序。在该环境下，您可以在宿主机（运行Docker的机器）上同时运行多个容器。这些轻量级的容器，包含了您运行程序所需的一切内容（存储、网络、权限等），您无需再考虑在宿主机上安装的软件。您还可以共享您的容器，每个（获取您容器）的人，在运行容器时，都（跟您一样）是相同的运作模式。



## 架构与功能模块

### 架构

&emsp;Docker 是经典的CS(client-server)架构。Docker client(客户端)会与 Docker daemon 产生交互，以此来构建、运行、或者发布您的容器。 Docker client 和 Docker daemon 可以运行在一台主机上，Docker client 也可以与远程主机上的 Docker daemon 进行交互。 Docker client 是通过诸如 RestAPI、 UNIX socket 或者其他网络接口与 Docker daemon 进行交互。另外还有一个客户端称为 `Docker Compose`，它可以帮助您以多个容器组合起来，作为一个应用程序来运行（通常叫做“容器编排”）。


![20240204094557](https://cdn.jsdelivr.net/gh/Github-Stephen/blogPic/springboot/20240204094557.png)
<center>引用自Dokcer官网</center>

#### 服务端

`Docker daemon` ： dockerd， 相当于docker的后台进程。

`Docker Daemon配置文件`：CentosOS 一般默认在/etc/systemd/system/docker.service.d/

PS:Rocky Linux是在lib/systemd/system/ 下

<br/>


#### 客户端

`Docker命令`：交互式命令，如`docker run`

`DockerAPI` ：可使用 Restful API 操作 Docker

<br/>

#### Docker Desktop
&emsp;&emsp;是一个可以进行在 Mac、Windows、Linux 系统上的可视化程序。相较于命令行的操作方式，Docker Desktop 会比较容易上手。
<br/>

#### 镜像仓库

&emsp;&emsp;镜像存储的地方（我们可以类比 npm 仓库和 maven 仓库），Docker Hub 是公开可访问的镜像仓库，（运行 docker pull时）Docker会默认在该公开的仓库中寻找进行。

&emsp;&emsp;我们可以单独配置自己的（私有）仓库地址，当我们在 `docker pull`、`docker push` 时，Docker 会在私有仓库中寻找或推送仓库。

常用仓库如下：

- Docker Hub - 官方仓库

- Docker Datacenter - Docker信任仓库（企业版）

- Docker私有仓库 - Harbor等

<br/>

#### Docker 对象

&emsp;&emsp;当我们使用命令行进行操作时，实际上我们是对 Docker对象 进行操作，如：镜像、容器、网络、存储、插件等。

<br/>

**镜像（Image）**

&emsp;&emsp;一个镜像，实际是创建容器的一个过程描述（采用什么基座、安装什么软件等过程）。通常，一个镜像又会依赖另外一个镜像，并且带有一些定制化的内容（复制文件、安装软件等操作）。 例如： 我们需要启动一个容器，容器是基于 `ubuntu` 操作系统，同时需要安装 nginx 软件，并且需要做一些 nginx 的配置（端口、访问路径映射等），使 web 程序可以以我们想要的方式运行起来。

&emsp;&emsp;您可以自己制作镜像，或者使用公开仓库中的镜像。在制作镜像过程中，我们会在 `DockerFile` 中编写制作过程。每一步实际上就是在镜像中新建了一层（可以想象成是盖房子的过程）。如果您改变了其中的一个过程，那么重新构建镜像时，只会重新读取改变了的内容。

<br/>

**容器（Container）**

&emsp;&emsp;一个容器是一个可运行的镜像实例。您可以通过命令行**增删查改**容器，也可以将容器连接到多个网络、或者多个存储介质中，甚至在此基础上，再建立一个镜像。

默认情况下，容器之间是相互隔离的，当然我们可以控制这个隔离程度。

容器由镜像和配置组成，当容器被删除时，如果是没有持久化到存储介质的内容，将会丢失。

<br/>

**一个简要的例子**

我们可以在命令行终端执行以下命令（本小节了解即可，后续学习后，可实操）：
```shell
 docker run -i -t ubuntu /bin/bash
```

1. 如果本地仓库（宿主机上的Docker）没有`ubuntu`，那么 Docker 将在您配置的仓库地址中拉取镜像，就跟您手动执行`docker pull ubuntu`一样；
2. Docker 创建了一个新的容器，就跟您手动执行`docker container create`一样；
3. Docker 为容器分配一个读写区域，并且作为容器的最顶一层。以便容器中的程序可以在`容器环境`中创建或者修改文件、目录；
4. Docker 创建一个网络接口来连接容器和`宿主机`的默认网络，因此我们无需对网络做额外配置。这个过程包括分配一个 IP 地址到容器中。默认情况下，容器是可以直接连接到宿主机的网络；
5. Dokcer 启动容器并执行`/bin/bash`命令，由于启动时采用响应式终端(`-i`和`-t`参数)，此时会进入一个命令行终端界面，以此与容器进行交互；
6. 当您在命令行输入`exit`去终止`/bin/bash`命令时，容器会停止但不会被删除，您只要重新启动或手动显式地删除它。


**底层技术**
&emsp;&emsp;Docker 采用 Go 语言编写，采用了很多 Linux 内核技术。Docker 利用一种名为 `namespace` 的技术来为容器提供隔离环境。当您运行容器时，Docker 实际上也为这些容器创建了一系列的`namespace`。 


<br/>


## 环境搭建

### 安装docker

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




### 其他中间件的运行

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
#

## 容器生命周期

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