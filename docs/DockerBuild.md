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
