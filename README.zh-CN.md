<!-- 本文件的下载表由 scripts/render.mjs 从 manifest.json 生成。 -->
<!-- 请修改 manifest.json，不要直接编辑 BEGIN/END 标记之间的内容。 -->

# Cordy Releases

Cordy 系列产品的公开下载、更新日志与问题反馈入口。

**本仓库不包含任何产品源码。** 它的作用是把已发布的构建集中到一处，便于下载、校验和反馈。

- 产品官网与文档 — https://cordy.dsdev.cn
- 更新日志 — [CHANGELOG.zh-CN.md](CHANGELOG.zh-CN.md)
- English — [README.md](README.md)

## 下载

<!-- BEGIN:DOWNLOADS -->

### Cordy 桌面端 0.5.3

发布于 2026-09-17 · [发布说明](https://github.com/DS-Studio/cordy-releases/releases/tag/desktop-v0.5.3)

| 平台 | 架构 | 文件 | 大小 | SHA-256 |
| --- | --- | --- | --- | --- |
| Windows | x64 | [cordy-Setup-0.5.3.exe](https://github.com/DS-Studio/cordy-releases/releases/download/desktop-v0.5.3/cordy-Setup-0.5.3.exe) | 112.3 MB | `785338759ac0` |
| macOS | arm64 | [cordy-Setup-0.5.3.dmg](https://github.com/DS-Studio/cordy-releases/releases/download/desktop-v0.5.3/cordy-Setup-0.5.3.dmg) | 130.7 MB | `4609064b04b0` |
| macOS | arm64 | [cordy-Setup-0.5.3.zip](https://github.com/DS-Studio/cordy-releases/releases/download/desktop-v0.5.3/cordy-Setup-0.5.3.zip) | 126.2 MB | `14c2feaf7d54` |
| Linux | x64 | [cordy-Setup-0.5.3-linux-x64.AppImage](https://github.com/DS-Studio/cordy-releases/releases/download/desktop-v0.5.3/cordy-Setup-0.5.3-linux-x64.AppImage) | 137.4 MB | `546b1ec39169` |
| Linux | arm64 | [cordy-Setup-0.5.3-linux-arm64.AppImage](https://github.com/DS-Studio/cordy-releases/releases/download/desktop-v0.5.3/cordy-Setup-0.5.3-linux-arm64.AppImage) | 138.4 MB | `44547751054c` |
| Linux | x64 | [cordy-Setup-0.5.3-linux-x64.deb](https://github.com/DS-Studio/cordy-releases/releases/download/desktop-v0.5.3/cordy-Setup-0.5.3-linux-x64.deb) | 108.5 MB | `a7cc16e503c8` |
| Linux | arm64 | [cordy-Setup-0.5.3-linux-arm64.deb](https://github.com/DS-Studio/cordy-releases/releases/download/desktop-v0.5.3/cordy-Setup-0.5.3-linux-arm64.deb) | 103.6 MB | `310a9c7e2227` |

> 仅支持 Windows x64 与 macOS Apple Silicon。Windows 安装包未做代码签名，macOS 构建未经公证，首次运行时系统会弹出安全警告。

### Cordy 浏览器扩展

**[从 Chrome 应用商店安装](https://chromewebstore.google.com/detail/cordy/kdpfbabcgdgcddadcdacejaaepgkajih)**

请从 Chrome 应用商店安装——这是本扩展唯一受支持的安装方式，且会自动保持更新。

_暂无公开构建。_

> Release 中附带的 .zip 是用于核对已审核包内容的校验产物，不是另一条安装路径。

### CordyAI

_暂无公开构建。_

> 尚无可公开下载的构建。首个公开构建发布前，更新日志先在此处维护。

### Tabmori

_暂无公开构建。_

> 尚无可公开下载的构建。

<!-- END:DOWNLOADS -->

## 校验下载文件

每个 Release 都附带 `SHASUMS256.txt`，列出各个文件的 SHA-256。运行前请先核对——
[docs/verify.md](docs/verify.md) 给出了各平台的具体命令。

当前所有构建**均未做代码签名**。校验和只能证明文件完整、与发布内容一致，并不能证明文件安全。
请只从本仓库的 [Releases](https://github.com/DS-Studio/cordy-releases/releases) 下载。

## 安装

由于尚无代码签名证书，操作系统会对这些构建发出警告。下面的文档写明了你会看到什么、该怎么做：

- [Windows](docs/install-windows.zh-CN.md)
- [macOS](docs/install-macos.md)（英文）
- [Chrome 扩展](docs/install-chrome.zh-CN.md)

## 反馈问题

请使用[按产品分类的 issue 表单](https://github.com/DS-Studio/cordy-releases/issues/new/choose)提交。
请填写产品版本与所用平台——表单里都会问到。

安全漏洞请勿公开提 issue，按 [SECURITY.md](SECURITY.md) 的流程私下报告。

## Release 标签

每个产品使用各自的标签前缀，因此可以共用同一个仓库：

| 产品 | 标签 | 示例 |
| --- | --- | --- |
| Cordy 桌面端 | `desktop-v*` | `desktop-v0.5.4` |
| Cordy 浏览器扩展 | `chrome-v*` | `chrome-v2.5.4` |
| CordyAI | `app-v*` | `app-v0.5.0` |
| Tabmori | `tabmori-v*` | `tabmori-v0.1.0` |

GitHub 的「Latest」徽章是仓库级的单一指针，没有按产品区分的概念，因此它指向 **Cordy 桌面端**。
其他产品请通过各自的标签或上方表格查找。

已发布的 Release 不可变：资产与标签在发布后即被冻结，并自动附带构建证明。
发布流程本身、以及这种不可变性在出错时的代价，记录在 [docs/releasing.md](docs/releasing.md)（英文）。

## 许可

专有软件——参见 [LICENSE.md](LICENSE.md) 与 [TERMS.md](TERMS.md)。
