---
outline: deep
---

## Docker中的网络

&emsp;&emsp;**容器网络**指的是容器间的网络通信，或者与其他负载组件的网络通信。

&emsp;&emsp;容器本身有默认的网络设置，提供出口（访问外部网络）的网络连接。容器信息中，不包含他们连接的是什么类型的网络，或者它们自身的节点是不是 Docker 集群。不过容器中包含了一些基本信息如：IP 地址、网关、路由对照表、DNS 服务等其他详情。

### 自定义网络
&emsp;&emsp;我们可以按照需求设置网络，让多个容器可以互相通信。进行设置之后，容器之间可以通过 IP 地址或者（容器）名称进行连接。

让我们来看一个简单的例子，利用`bridge`网络驱动来启动一个容器：

```shell
# 创建网络
docker network create my-net

# 运行一个自定义网络的容器
docker run --network=my-net -itd --name=container3 busybox
```

#### 驱动

| Driver    | Description                                                              |
| :-------- | :----------------------------------------------------------------------- |
| `bridge`  | 默认网络设置，一般称为“桥接模式”                                               |
| `host`    | 消除容器与宿主机的网络隔离，一般称为“主机模式”      |
| `none`    | 容器与宿主机完全隔离，“无网络”模式       |
| `overlay` | 在多个 Docker 进程之上构建一层网络               |
| `ipvlan`  | IPvlan 网络模式 提供了基于 IPv4 IPv6 的网络设置 |
| `macvlan` | 基于 MAC 地址的网络设置模式                                     |


### 容器网络

&emsp;&emsp;除了自定义网络，您可以直接从一个容器连接到另外一个容器，利用`--network container:<name|id>` 命令行参数来操作。

如果使用了`container:`这种模式，以下的命令行参数则不支持：

- `--add-host`
- `--hostname`
- `--dns`
- `--dns-search`
- `--dns-option`
- `--mac-address`
- `--publish`
- `--publish-all`
- `--expose`

我们来看一个简单的例子：

```shell
docker run -d --name redis example/redis --bind 127.0.0.1

docker run --rm -it --network container:redis example/redis-cli -h 127.0.0.1
```

首先是启动一个 redis 服务的容器，并绑定`localhost`; 然后通过命令行`redis-cli`来连接`localhost`的 redis 服务。

### 发布（暴露）端口

&emsp;&emsp;在默认情况下，如果我们是使用`docker create`或者`docker run`来创建或启动容器，容器不会对外暴露任何端口。利用`--publish`或者`-p`标识来将（容器中）服务的端口暴露出去。这实际是在主机建立了一个防火墙规则，把容器的端口映射（关联到）到宿主机上。以下是一些示例：

| 标识值                      | 描述                                                                                                                                             |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `-p 8080:80`                    | 通过 TCP 的方式，映射宿主机 `8080` 端口到容器中的 `80` 端口。                                                                                    |
| `-p 192.168.1.100:8080:80`      | 通过 TCP 的方式，映射宿主机的 IP `192.168.1.100`、`8080` 端口到容器中的 `80` 端口中。                                                                                        |
| `-p 8080:80/udp`                | 通过 UDP 的方式，映射宿主机 `8080` 端口到容器中的 `80` 端口。                                                                                   |
| `-p 8080:80/tcp -p 8080:80/udp` | 通过 TCP 的方式，映射宿主机 `8080` 端口到容器中的 `80` 端口, 同时通过 UDP 的方式，映射宿主机 `8080` 端口到容器中的 `80` 端口。
|


> 💡 重要提示
>
> 暴露端口实际上是不安全的。因为你暴露的不单单是容器的，同时也是暴露到互联网上。
>
> 如果暴露端口时，包含了 IP 地址（127.0.0.1），那么只有宿主机能访问容器的这个端口，如：
>
> ```shell
> docker run -p 127.0.0.1:8080:80 nginx
> ```
> 

如果您想使两个容器间的网络想通，您无需暴露任何端口。您可以利用`bridge network`(桥接网络)来进行内部连接。

### IP address 和 hostname

默认情况下，容器会从连接的网络中获得一个 IP 地址。 Docker 守护进程会为容器动态进行子网划分和 IP 地址分配。每一个容器的网络，都有其默认子网掩码和网关。

当启动一个容器时，我们可以使用`--network`标识来连接指定的网络。还可以利用`docker network connect`命令来连接额外的网络。再以上两种情况下，可以使用`--ip`或者`--ip6`标识来显式地指定 IP 地址。

为了方便记忆，还可以使用`--hostname`来标识一个 hostname（主机名称）。当使用`docker network connect`命令连接时，可以使用`--alias`标识来指定网络进行连接。

### DNS 服务

在默认情况下，容器是使用与宿主机相同的 DNS 服务。不过可以通过`--dns`标识来重写。

默认情况下，容器是继承了编写在 `/etc/resolv.conf` 文件中 DNS 的设置。容器连接了一个默认的网桥并且接收了一个`/etc/resolv.conf`文件的副本。容器是使用内置的 DNS 服务 来连接自定义网络。

您可以通过使用`docker run`或者`docker create`在启动或者创建容器时，进行 DNS 的基本设置。以下是`docker run`时，可以指定一些标识来配置：

| 标识           | 描述                                                                                                                                                                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--dns`        | 指定DNS服务的IP地址，如果有多个DNS服务，可使用多个`--dns`标识符如果无法匹配指定值，那么将会默认设置为`8.8.8.8`（Google的公共 DNS 服务），以此来解析域名。|
| `--dns-search` | 指定一个 DNS 搜索的域名，用于搜索非全限定（未完全指明）的主机名称，如果要搜索多个搜索的前缀，可使用多个标识符。|
| `--dns-opt`    | 键值对（key-value）的方式来描述 DNS 的选项和其选项值，具体合法的值，可以参考操作系统（如Linux）中的 `resolv.conf` 文件。|


### Bridge
> 桥接模式

就网络层面而言，桥接网络是一个链路层设备来连通各个网段。桥接器可以是运行在主机内核中的一个硬件设备或者一个软件设备。

在 Docker 层面，桥接网络是利用软件来让容器之间可以在**同一个**桥接网络中进行通信，其他（不在同一个网桥）的容器，将具有网络隔离性。Docker 的桥接驱动程序会自动安装规则到宿主机，以此来实现不同网桥之间无法直接通信（网桥间隔离）。

桥接网络**适用于**多个容器运行在同一个 Docker 进程的主机上。如果是不同 Docker 进程间的网络通信，可以通过操作系统层面或者使用 `overlay network`（覆盖网络）来管理路由。

当我们启动 Docker 时，一个默认的桥接网络（通常就叫`bridge`）会自动随之创建。新启动的容器，将会自动连接该网桥，除非显式地指定其他网桥。我们还可以创建自定义的桥接网络。用户自定义桥接网络会更优于默认的桥接网络。

#### 自定义网桥与默认网桥的区别

- 自定义网桥会自动在容器间提供 DNS 的解决方案

- 自定义网桥能提供更好的隔离性

- 容器可以动态地连接或断开自定义网络的连接

- 每个自定义的网络，都创建了一个可配置的网桥

- 连接同一个默认网桥的容器，都共享着环境变量

更多细节，可以查看[自定义网桥与默认网桥的区别](https://docs.docker.com/network/drivers/bridge/#differences-between-user-defined-bridges-and-the-default-bridge)

#### 管理自定义网桥

使用`docker network create` 命令创建一个自定义桥接网络.

```shell
docker network create my-net
```
您可以定义个子网，包含IP地址范围、网关等其他选项。可以参考[docker create network](https://docs.docker.com/reference/cli/docker/network/create/#specify-advanced-options)查看更多参数。


我们还可以删除一个网络配置，如果有正在连接的容器，建议先断开容器的网络连接，再进行删除：
- 断开网络
```shell
# docker network disconnect 网络名称 容器名称
docker network disconnect my-net my-nginx
```
- 移除网络配置
```shell
docker network rm my-net
```


#### 将容器连接到默认桥接网络中
考虑到历史版本的兼容性，Docker 保留了默认网桥的设置，通常是**不建议**在生产环境使用默认网络（最好使用自定义网络），当然，在学习阶段，我们可以快速熟悉一下即可。

#### 将容器连接到默认网络中
todo。



#### 将容器连接到自定义网络中

当我们创建一个新容器时，我们可以指定一个或多个`flag标识`。下面的例子，是将 Nginx 连接到`my-net`网络。同时还将容器端口8080发布到宿主机的80端口。其他连接到`my-net`网络的容器，也会有权限访问到`my-nginx`的所有端口。


```shell
docker create --name my-nginx \
  --network my-net \
  --publish 8080:80 \
  nginx:latest
```

想要把一个正在运行的容器连接到已存在的自定义网络中，可以使用`docker network connect`命令。我们可以使用以下命令：

```shell
docker network connect my-net my-nginx
```

#### 将容器从自定义网络中断开连接

以下是将容器`my-nginx`从自定义网络`my-net`中移除：

```shell
docker network disconnect my-net my-nginx
```


#### 实操练习

##### 【练习】默认网桥网络

接下来的例子，我们可以开启两个相同的容器`alpine`连接一个 Docker 实例，这样可以比较好理解，两个容器间如何进行通信。

1. 在终端工具输入以下命令，列出所有 Docker 网络配置：

```shell
[root@localhost ~]# docker network ls
NETWORK ID     NAME      DRIVER    SCOPE
082ab96f3b60   bridge    bridge    local
33a72e7f9c62   host      host      local
007edd1dde08   none      null      local
```
以上列出了本服务器 Docker 实例中的网络配置，有不同的 network ID，第一个是默认的桥接(bridge)网络，后面两个是用于容器直接连接 Docker 宿主机(host)的配置，或者容器启动时，处于无网络(none)状态；

2. 运行两个`apline`容器，并利用`ash`（Apline 默认的 shell 工具而不是`bash`）作为终端输入工具。 `-dit`说明容器启动时是以 detached (后台运行)，interactive（可接收输入），还带有一个[TTY](https://www.linusakesson.net/programming/tty/index.php)（可以看到输入和输出）。如果您通过后台运行容器，那么您无法马上（通过 docker exec）连接到容器里，容器ID 会打印出来。由于启动时没有指定`--network`标识，容器将会连接到默认的网桥网络。

```shell
docker run -dit --name alpine1 alpine ash
# 本地找不到镜像，从远端拿
Unable to find image 'alpine:latest' locally
latest: Pulling from library/alpine
bca4290a9639: Pull complete 
Digest: sha256:c5b1261d6d3e43071626931fc004f70149baeba2c8ec672bd4f27761f8e1ad6b
Status: Downloaded newer image for alpine:latest
2e76797596d548149cb7ed54ff41ecf957dfcd6cb6cb1ee5d799faa11fb8b3d1

docker run -dit --name alpine2 alpine ash
```

查看下两个人容器是否正常使用：
```shell
docker container ls
CONTAINER ID   IMAGE          COMMAND                  CREATED          STATUS          PORTS     NAMES
7eb9d16d4327   alpine         "ash"                    21 seconds ago   Up 20 seconds             alpine2
2e76797596d5   alpine         "ash"                    5 minutes ago    Up 5 minutes              alpine1
```

3. 查看 brideg 网络查看目前有什么容器正在连接：

```shell
docker network inspect bridge

[
    {
        "Name": "bridge",
        "Id": "082ab96f3b60587473bb94b73558b974e9fcdbe0072a31e79d7d6690dfa18be8",
        "Created": "2024-02-03T09:17:14.350730502+08:00",
        "Scope": "local",
        "Driver": "bridge",
        "EnableIPv6": false,
        "IPAM": {
            "Driver": "default",
            "Options": null,
            "Config": [
                {
                    "Subnet": "172.17.0.0/16",
                    "Gateway": "172.17.0.1"
                }
            ]
        },
        "Internal": false,
        "Attachable": false,
        "Ingress": false,
        "ConfigFrom": {
            "Network": ""
        },
        "ConfigOnly": false,
        "Containers": {
            "2e76797596d548149cb7ed54ff41ecf957dfcd6cb6cb1ee5d799faa11fb8b3d1": {
                "Name": "alpine1",
                "EndpointID": "07c0b1fc2839cd5266a6af32dc865a889dcb12c650bb8fa9d5df8893df6c08dc",
                "MacAddress": "02:42:ac:11:00:02",
                "IPv4Address": "172.17.0.2/16",
                "IPv6Address": ""
            },
            "4f311dfaaaab7a310bfa69199e52c5383826f3a8bbe98b53eb4c8df2a01b9076": {
                "Name": "devtest",
                "EndpointID": "6e20c0bfb486dc0b7d1e928fe832238a8e52f9dd2f156cf4054975d144527e19",
                "MacAddress": "02:42:ac:11:00:05",
                "IPv4Address": "172.17.0.5/16",
                "IPv6Address": ""
            },
            "603a9a73f2a4d72fc517e3a4741b883b6dd34448b95739741288ffd17f49e7d7": {
                "Name": "dbstore9",
                "EndpointID": "5fcca7a90cf6975deb9f85a3f26f25053b3ca68f5ca70d1121c9785b22f15a6b",
                "MacAddress": "02:42:ac:11:00:03",
                "IPv4Address": "172.17.0.3/16",
                "IPv6Address": ""
            },
            "7eb9d16d4327bc42d2b5d4aa70dc2a1b50522838c33979e736ea562216c560a0": {
                "Name": "alpine2",
                "EndpointID": "0121c38a9cf4a2c7e194f18da22f25c13d0653d7b4fc62e7a5a623f60af72fd0",
                "MacAddress": "02:42:ac:11:00:04",
                "IPv4Address": "172.17.0.4/16",
                "IPv6Address": ""
            }
        },
        "Options": {
            "com.docker.network.bridge.default_bridge": "true",
            "com.docker.network.bridge.enable_icc": "true",
            "com.docker.network.bridge.enable_ip_masquerade": "true",
            "com.docker.network.bridge.host_binding_ipv4": "0.0.0.0",
            "com.docker.network.bridge.name": "docker0",
            "com.docker.network.driver.mtu": "1500"
        },
        "Labels": {}
    }
]

```

以上 brideg 网络的信息中，包含了宿主机和 bridge 网络的网关地址（`172.17.0.1`）。在`Containers`key下，列出了所有连接的容器，还有容器的在该网络环境下的 IP 地址（`alpine1`的`172.17.0.2`，`alpine2`的`172.17.0.4`）；

4. 容器目前在后台运行，可以使用`docker attach`命令连接`alpine1`：
```shell
docker attch apline1

/ #
```

此时终端工具返回`#`说明您是以 root 用户进入。使用`ip addr show`命令查看`alpine1`的网络接口：

```shell
/ # ip addr show
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
74: eth0@if75: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1500 qdisc noqueue state UP 
    link/ether 02:42:ac:11:00:02 brd ff:ff:ff:ff:ff:ff
    inet 172.17.0.2/16 brd 172.17.255.255 scope global eth0
       valid_lft forever preferred_lft forever
```

第一个接口是回路设备，目前我们先忽略。请注意第二个接口 IP 地址为`172.17.0.2`，这跟我们之前用`docker network inspect bridge`查看的一致；

5. 在`alpine1`容器内，我们可以尝试 ping 一下 `baidu.com`，`-c 2`是限制只进行两次 ping 操作：

```shell
ping -c 2 baidu.com

PING baidu.com (110.242.68.66): 56 data bytes
64 bytes from 110.242.68.66: seq=0 ttl=127 time=89.888 ms
64 bytes from 110.242.68.66: seq=1 ttl=127 time=155.875 ms

--- baidu.com ping statistics ---
2 packets transmitted, 2 packets received, 0% packet loss
round-trip min/avg/max = 89.888/122.881/155.875 ms
```

6. 现在我们尝试 ping 第二个容器，我们首先尝试 ping 它的 IP 地址（`172.17.0.4`）：
```shell
ping -c 2 172.17.0.4
PING 172.17.0.4 (172.17.0.4): 56 data bytes
64 bytes from 172.17.0.4: seq=0 ttl=64 time=0.858 ms
64 bytes from 172.17.0.4: seq=1 ttl=64 time=0.295 ms

--- 172.17.0.4 ping statistics ---
2 packets transmitted, 2 packets received, 0% packet loss
round-trip min/avg/max = 0.295/0.576/0.858 ms
```

可以看到，容器`alpine1`可以通过 ping 连接到`alpine2`，但是通过容器名字来连接网络的话，则无法连通：

```shell
ping -c 2 alpine2
ping: bad address 'alpine2'
```

7. 此时我们可以通过组合键 CTRL + p ，（保持按住）CTRL + q，退出容器连接。

8. 退出清理学习现场：

```shell
docker container stop alpine1 alpine2

docker container rm alpine1 alpine2
```

**注意：** 不建议在生产环境中使用默认的桥接网络。


##### 【练习】自定义网桥网络

在这个示例中，我们会启动2个容器，并连接它们到`apline-net`的自定义网络中，不再连接到默认的网桥网络中。 之后我们启动第3个容器，该容器则是连接到默认的网桥（bridge）网络。再启动第4个容器，同时连接`apline-net`自定义网络和默认的网桥网络。

1. 创建一个`alpine-net`网络，我们可以省略`--driver bridge`标识，因为它是默认的：

```shell
docker network create --driver bridge apline-net
```

2. 列出 Docker 的网络：

```shell
[root@localhost ~]# docker network ls
NETWORK ID     NAME         DRIVER    SCOPE
47a0e7acc309   alpine-net   bridge    local
3630282366aa   bridge       bridge    local
33a72e7f9c62   host         host      local
9869f9b2281e   jenkins      bridge    local
9e8fd0cba5f3   my-net       bridge    local
007edd1dde08   none         null      local
```

可以查看一下`alpine-net`网络的信息，可以看到 IP 地址且目前没有容器在连接：

```shell
[root@localhost ~]# docker inspect alpine-net
[
    {
        "Name": "alpine-net",
        "Id": "47a0e7acc309dd822bb97a0bcd85cb701cf33947d8994553d6103727eb88e30b",
        "Created": "2024-03-15T08:19:01.268411642+08:00",
        "Scope": "local",
        "Driver": "bridge",
        "EnableIPv6": false,
        "IPAM": {
            "Driver": "default",
            "Options": {},
            "Config": [
                {
                    "Subnet": "172.20.0.0/16",
                    "Gateway": "172.20.0.1"
                }
            ]
        },
        "Internal": false,
        "Attachable": false,
        "Ingress": false,
        "ConfigFrom": {
            "Network": ""
        },
        "ConfigOnly": false,
        "Containers": {},
        "Options": {},
        "Labels": {}
    }
]

```

可以看到网关地址是`172.20.0.1`，而对于网络的网桥网络（名字是bridge的）的网关地址则是`172.17.0.1`。

3. 创建4个容器，我们可以在启动容器时，直接就连接网络，但启动命令目前只支持连接一个网络，所以容器4我们需要启动后，再连接默认的网桥网络（容器4同时连接两个网络）：

```shell
docker run -dit --name alpine1 --network alpine-net alpine ash

docker run -dit --name alpine2 --network alpine-net alpine ash

docker run -dit --name alpine3 alpine ash

docker run -dit --name alpine4 --network alpine-net alpine ash

docker network connect bridge alpine4
```

确认下所有容器都在运行着：

```shell
[root@localhost ~]# docker ps
CONTAINER ID   IMAGE     COMMAND   CREATED              STATUS              PORTS     NAMES
38e58c093312   alpine    "ash"     About a minute ago   Up About a minute             alpine4
36bfc9f52708   alpine    "ash"     About a minute ago   Up About a minute             alpine3
e495e7e6d36f   alpine    "ash"     2 minutes ago        Up 2 minutes                  alpine2
efedaf3caf7f   alpine    "ash"     2 minutes ago        Up 2 minutes                  alpine1
```

4. 观察`bridge`网络和`apline-net`网络：

```shell
[root@localhost ~]# docker network inspect bridge
[
    {
        "Name": "bridge",
        "Id": "3630282366aa881ba7bb4a0d5962bd263b0135e41b2f5c0ccf94950b10b86829",
        "Created": "2024-03-15T08:18:17.820233566+08:00",
        "Scope": "local",
        "Driver": "bridge",
        "EnableIPv6": false,
        "IPAM": {
            "Driver": "default",
            "Options": null,
            "Config": [
                {
                    "Subnet": "172.17.0.0/16",
                    "Gateway": "172.17.0.1"
                }
            ]
        },
        "Internal": false,
        "Attachable": false,
        "Ingress": false,
        "ConfigFrom": {
            "Network": ""
        },
        "ConfigOnly": false,
        "Containers": {
            "36bfc9f52708c6c10b05a690a4d19d5a82a7eafc293dfe724817b5ea5f02034e": {
                "Name": "alpine3",
                "EndpointID": "d9e7f39d687c9dfc9809cd09b0e17ba1a445d166adcd06bdbc78620b68003b22",
                "MacAddress": "02:42:ac:11:00:02",
                "IPv4Address": "172.17.0.2/16",
                "IPv6Address": ""
            },
            "38e58c093312e7a8c59c5b3b7e6587aedcbc58de733d5778291140b3fbd4fc78": {
                "Name": "alpine4",
                "EndpointID": "5509feceaf576209eb3385d01a5dfc15609beeee3e4ffbcc3272acccf02ac410",
                "MacAddress": "02:42:ac:11:00:03",
                "IPv4Address": "172.17.0.3/16",
                "IPv6Address": ""
            }
        },
        "Options": {
            "com.docker.network.bridge.default_bridge": "true",
            "com.docker.network.bridge.enable_icc": "true",
            "com.docker.network.bridge.enable_ip_masquerade": "true",
            "com.docker.network.bridge.host_binding_ipv4": "0.0.0.0",
            "com.docker.network.bridge.name": "docker0",
            "com.docker.network.driver.mtu": "1500"
        },
        "Labels": {}
    }
]

```

容器`apline3`和`apline4`正在连接着`bridge`网络：

```shell
[root@localhost ~]# docker network inspect alpine-net
[
    {
        "Name": "alpine-net",
        "Id": "47a0e7acc309dd822bb97a0bcd85cb701cf33947d8994553d6103727eb88e30b",
        "Created": "2024-03-15T08:19:01.268411642+08:00",
        "Scope": "local",s
        "Driver": "bridge",
        "EnableIPv6": false,
        "IPAM": {
            "Driver": "default",
            "Options": {},
            "Config": [
                {
                    "Subnet": "172.20.0.0/16",
                    "Gateway": "172.20.0.1"
                }
            ]
        },
        "Internal": false,
        "Attachable": false,
        "Ingress": false,
        "ConfigFrom": {
            "Network": ""
        },
        "ConfigOnly": false,
        "Containers": {
            "38e58c093312e7a8c59c5b3b7e6587aedcbc58de733d5778291140b3fbd4fc78": {
                "Name": "alpine4",
                "EndpointID": "819351c5514c1a049a2bbde44520b0aced4bd69b203e211fd2242078d063d1a8",
                "MacAddress": "02:42:ac:14:00:04",
                "IPv4Address": "172.20.0.4/16",
                "IPv6Address": ""
            },
            "e495e7e6d36f24b468a53f5ac9d7df2ad96dfeeebdfeddc0ba461a06e6c63890": {
                "Name": "alpine2",
                "EndpointID": "89e8902571a66d07c3cddad1d5e799fc6992771fd2dd7ae8ce95da555c6c59d0",
                "MacAddress": "02:42:ac:14:00:03",
                "IPv4Address": "172.20.0.3/16",
                "IPv6Address": ""
            },
            "efedaf3caf7fa15cb8f1635d2df4dd5e3847bac67e52318ea220bd7ff53e53a9": {
                "Name": "alpine1",
                "EndpointID": "045e8ac7b42f1af82dca0df8ee36c9854a8edc7484b1d6eb8aaa31e543d6d060",
                "MacAddress": "02:42:ac:14:00:02",
                "IPv4Address": "172.20.0.2/16",
                "IPv6Address": ""
            }
        },
        "Options": {},
        "Labels": {}
    }
]

```

可以看到有容器`alpine1`、`alpine2`、`alpine4`连接着`apline-net`网络。

5. 自定义的`apline-net`网络，容器之间通信不单单通过 IP 地址，还可以通过容器名称（转换为 IP 地址）进行通信。这个能力称之为“服务发现”。 我们可以试试让`apline-net`网络下的容器进行互联。

> 注意：
> 服务发现只能应用于自定义容器的名称，无法应用于 Docker 默认生成的容器名称（类似UUID那种）


```shell
[root@localhost ~]# docker container attach alpine1
/ # ping -c 2 alpine2
PING alpine2 (172.20.0.3): 56 data bytes
64 bytes from 172.20.0.3: seq=0 ttl=64 time=0.470 ms
64 bytes from 172.20.0.3: seq=1 ttl=64 time=0.396 ms

--- alpine2 ping statistics ---
2 packets transmitted, 2 packets received, 0% packet loss
round-trip min/avg/max = 0.396/0.433/0.470 ms
/ # ping -c 2 alpine4
PING alpine4 (172.20.0.4): 56 data bytes
64 bytes from 172.20.0.4: seq=0 ttl=64 time=0.491 ms
64 bytes from 172.20.0.4: seq=1 ttl=64 time=0.325 ms

--- alpine4 ping statistics ---
2 packets transmitted, 2 packets received, 0% packet loss
round-trip min/avg/max = 0.325/0.408/0.491 ms
/ # ping -c 2 alpine1
PING alpine1 (172.20.0.2): 56 data bytes
64 bytes from 172.20.0.2: seq=0 ttl=64 time=0.125 ms
64 bytes from 172.20.0.2: seq=1 ttl=64 time=0.086 ms

--- alpine1 ping statistics ---
2 packets transmitted, 2 packets received, 0% packet loss
round-trip min/avg/max = 0.086/0.105/0.125 ms
```

6. alpine1 容器无法与 alpine3 通信，因为后者没有连接到`alpine-net`网络中:
```shell
/ # ping -c 2 alpine3
ping: bad address 'alpine3'
```

通过 IP 地址也是没办法连接到`alpine3`容器，我们可以使用`docker network inspect`查看`bridge`网络中容器`alpine3`的 IP 地址（`172.17.0.2`）

```shell
/ # ping 172.17.0.2
PING 172.17.0.2 (172.17.0.2): 56 data bytes
^C
--- 172.17.0.2 ping statistics ---
9 packets transmitted, 0 packets received, 100% packet loss
```
数据包100%丢失，无法连接。

退出容器终端，CTRL + p 紧接按 q 。

7. 容器`alpine4`同时连接了`bridge`网络和`alpine-net`网络。它可以连接这两个网络中的其他容器。不过，您连接容器`apline3`时，需要使用 IP 地址

```shell
docker container attach alpine4
/ # ping -c 2 alpine1
PING alpine1 (172.20.0.2): 56 data bytes
64 bytes from 172.20.0.2: seq=0 ttl=64 time=0.531 ms
64 bytes from 172.20.0.2: seq=1 ttl=64 time=0.328 ms

--- alpine1 ping statistics ---
2 packets transmitted, 2 packets received, 0% packet loss
round-trip min/avg/max = 0.328/0.429/0.531 ms

/ # ping -c 2 alpine2
PING alpine2 (172.20.0.3): 56 data bytes
64 bytes from 172.20.0.3: seq=0 ttl=64 time=0.380 ms
64 bytes from 172.20.0.3: seq=1 ttl=64 time=0.154 ms

--- alpine2 ping statistics ---
2 packets transmitted, 2 packets received, 0% packet loss
round-trip min/avg/max = 0.154/0.267/0.380 ms

/ # ping -c 2 alpine3
ping: bad address 'alpine3'

/ # ping -c 2 172.17.0.2
PING 172.17.0.2 (172.17.0.2): 56 data bytes
64 bytes from 172.17.0.2: seq=0 ttl=64 time=0.303 ms
64 bytes from 172.17.0.2: seq=1 ttl=64 time=0.300 ms

--- 172.17.0.2 ping statistics ---
2 packets transmitted, 2 packets received, 0% packet loss
round-trip min/avg/max = 0.300/0.301/0.303 ms

```

8. 最后，确保所有容器，都能连接互联网，如：`baidu.com`.

```shell
[root@localhost ~]# docker attach alpine4

/ # ping -c 2 baidu.com
PING baidu.com (110.242.68.66): 56 data bytes
64 bytes from 110.242.68.66: seq=0 ttl=127 time=46.001 ms
64 bytes from 110.242.68.66: seq=1 ttl=127 time=50.803 ms

--- baidu.com ping statistics ---
2 packets transmitted, 2 packets received, 0% packet loss
round-trip min/avg/max = 46.001/48.402/50.803 ms

# CTRL + p + q 退出终端，连接 alpine3
[root@localhost ~]# docker attach alpine3
/ # ping -c 2 baidu.com
PING baidu.com (39.156.66.10): 56 data bytes
64 bytes from 39.156.66.10: seq=0 ttl=127 time=62.700 ms
64 bytes from 39.156.66.10: seq=1 ttl=127 time=49.621 ms

--- baidu.com ping statistics ---
2 packets transmitted, 2 packets received, 0% packet loss
round-trip min/avg/max = 49.621/56.160/62.700 ms

# CTRL + p + q 退出终端
```

9. 停止和删除所有容器、网络：

```shell
[root@localhost ~]# docker container stop alpine1 alpine2 alpine3 alpine4
[root@localhost ~]# docker container rm alpine1 alpine2 alpine3 alpine4
[root@localhost ~]# docker network rm alpine-net
```









