---
outline: deep
---

## DockerBuild
> Docker构建

我们在使用 Docker 引擎时，也经常使用 Docker Build ，可能我们平时只使用一些命令（docker build），但是实际上 Docker Build 不单单只是工具的集合，而是能辅助您构建工作流（workflow tasks）和提供更多复杂、高级的场景。

- 打包您的软件：构建和打包您的程序，在本地或者云上运行；
- 多阶段构建：使您的镜像足够小和安全；
- 多平台镜像：构建、推送、拉取镜像，在不同的（操作）系统架构上流畅运行；
- 云构建：利用云平台进行镜像构建；
（等等以上）

### 架构

![20240320083210](https://cdn.jsdelivr.net/gh/Github-Stephen/blogPic/springboot/20240320083210.png)

我们可以查看上面的架构图，Docker Build 是 Client-Server 架构，其中 Buildx 是客户端工具，包含命令集合，BuildKit 在服务端进行命令响应。



### 打包镜像

<br/>

#### DockerFile

我们可以把DockerFile理解为制作镜像的模版，模板描述成怎样，镜像就制作成怎样。DockerFile是一个文本文件，里面包含制作镜像的内容，所以掌握基础的DockerFile的写法至关重要。

以下是最常用的语法结构：

| 语法 | 描述 | 
|-------|-------|
| `FROM <image>`| 定义一个镜像的基础，通常是小型操作系统，如 debian |
| `RUN <command>`| 在当前镜像层之上执行任何命令 |
| `WORKDIR <directory>`| 工作目录，可以紧跟着`RUN`,`CMD`,`ENTRYPOINT`,`COPY`,`ADD` ，也就是这些命令将要操作的目录|
|`COPY <src> <dest>` | 复制文件或者目录 src 到运行容器 dest 路径中|
|`CMD <command>` | 定义一个脚本，可以在容器启动时执行一次。每个DockerFile只能有一个 CMD 命令，如果存在多个，则最后一个生效|

##### filename
一般来说，我们使用默认名称 DockerFile（没有扩展名） 来新建 DockerFile 文件，如果需要自定义名字，建议使用 `somethine.DockerFile` 来命名，同时在构建`docker build`时加入参数`--file` 指定 DockerFile 的名称。

#### Docker 镜像

##### 网络延迟

由于国内访问官方的docker镜像地址存在很大延迟情况，所以我们需要通过一些加速的办法来提升拉取镜像的速度

- 加入镜像地址

修改docker配置文件

```shell
vi /etc/docker/deamon.json
```

加入以下配置：
```json
{
    "registry-mirrors":["https://xxxxxx.mirror.aliyuncs.com", "https://hub-mirror.c.163.com", "https://registry.aliyuncs.com", "https://docker.mirrors.ustc.edu.cn"]
}
```
以上加入了个人的镜像地址，阿里云、网易等镜像加速地址。


- 修改配置需要重启docker服务：
```shell
service docker restart
```