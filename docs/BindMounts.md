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




