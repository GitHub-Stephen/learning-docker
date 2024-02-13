---
outline: deep
---

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










