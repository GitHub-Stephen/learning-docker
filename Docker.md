







# 架构与功能模块

## 架构图









## 客户端

Docker命令

DockerAPI ：可使用restful API操作dockers



## 服务器

Docker daemon ： dockerd， 相当于docker的后台进程。

Docker Daemon配置文件：一般默认在/etc/systemd/system/docker.service.d/

Rocky Linux是在lib/systemd/system/ 下





## 镜像仓库

- Docker Hub - 官方仓库

- Docker Datacenter - Docker信任仓库（企业版）

- Docker私有仓库



## 镜像

> 容器模板

- Docker命令 - docker commit : 打包镜像

- Dockerfile : 描述打包过程的文件，以base image不断堆叠成新的镜像；





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



- 指定版本安装(mac apple芯片)

```shell
sudo yum install docker-ce-3:20.10.24-3.el9 docker-ce-cli-1:20.10.24-3.el9 containerd.io docker-compose-plugin-2.19.1-1.el9
```



- 安装目录概览：

![image-20230719130603609](/Users/zhuweicong/bookmark-vite/assets/image-20230719130603609.png)



安装后检查文件报错：

```shell
Error: Transaction test error:
  file /usr/libexec/docker/cli-plugins/docker-buildx conflicts between attempted installs of docker-buildx-plugin-0:0.11.1-1.el9.aarch64 and docker-ce-cli-1:20.10.24-3.el9.aarch64
```

解决办法：去掉buildx插件，在19.版本里，docker-cli已经有相关插件

```shell
sudo yum install docker-ce-3:20.10.24-3.el9 docker-ce-cli-1:20.10.24-3.el9 containerd.io docker-compose-plugin-2.19.1-1.el9
```



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

我们可以看到docker是先找本地镜像，找不到，再去找远程镜像仓库。



- helloword程序打印

 ```tex
 Hello from Docker!
 This message shows that your installation appears to be working correctly.
 
 To generate this message, Docker took the following steps:
 
   1. The Docker client contacted the Docker daemon.
   2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
      (arm64v8)
   3. The Docker daemon created a new container from that image which runs the
      executable that produces the output you are currently reading.
   4. The Docker daemon streamed that output to the Docker client, which sent it
      to your terminal.
 
 To try something more ambitious, you can run an Ubuntu container with:
  $ docker run -it ubuntu bash
 
 Share images, automate workflows, and more with a free Docker ID:
  https://hub.docker.com/
 
 For more examples and ideas, visit:
  https://docs.docker.com/get-started/
 ```





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
curl -X GET http://192.168.176.130:5000/v2/_catalog
```













# Docker持久化

## Bind mount





## VOLUME

卷（volume）的方式，比bind mount有以下优势：



- 易于备份、迁移；
- 可以使用docker cli 或者 docker api来管理卷；
- 可在widnow、linux的容器中良好运行

























# Docker网络通信





















## Docker常用命令

查看正在运行的容器

docker ps



查看服务器上所有容器

docker ps -a



后台运行容器

docker run -d 容器



```shell
docker run -d -p 8080:8080  --name jenkins -it f7a9278ee82a
```













# yum使用



查看镜像仓库：























##  环境变量

https://blog.csdn.net/xingzuo_1840/article/details/122195280



## 常用命令

获得容器ip

```shell
docker inspect -f ``'{{.Name}} - {{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}'` `$(docker ps -aq)
```



获得容器列表

docker container ls



进入容器bash

docker exec -it 容器id /bin/bash





## 常见问题

无法读取文件

saas-seata  | Error: Unable to access jarfile /home/aj/seata/fastjar/seata-server.jar

> 

