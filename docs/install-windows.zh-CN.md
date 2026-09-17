# 在 Windows 上安装 Cordy 桌面端

适用范围：Cordy 桌面端，仅支持 Windows x64。**没有 Windows on ARM 版本**——
如果你使用的是 ARM64 设备（例如搭载 Snapdragon 芯片的 Surface），这个安装包无法运行。

English version: [install-windows.md](install-windows.md)

## 你会看到什么：Windows SmartScreen

运行安装包时，Windows 会弹出一个标题为「Windows 已保护你的电脑」的对话框：

> **Windows 已保护你的电脑**
>
> Microsoft Defender SmartScreen 已阻止无法识别的应用启动。运行此应用可能会
> 使电脑面临风险。

此时只会显示一个 **"更多信息"** 链接和一个 **"不运行"** 按钮。点击 **"更多信息"**，
对话框会展开显示：

> 应用: `cordy-desktop-<版本>-win-x64.exe`
> 发布者: 未知发布者

以及两个按钮：**"仍要运行"** 和 **"不运行"**。

## 为什么会出现这个提示

SmartScreen 拦截这个安装包，是因为它没有代码签名证书。Cordy 桌面端目前还没有
证书——这不是对文件内容的扫描结果，而是信誉/签名检查，任何未签名的二进制文件
都会触发它，无论其内容如何。当前的签名状态见 [SECURITY.md](../SECURITY.md)（英文）。

## 在继续之前：校验文件

在点击"仍要运行"**之前**，先确认你下载的安装包与实际发布的内容一致：

1. 从同一个 Release 中下载 `SHASUMS256.txt`。
2. 核对安装包的哈希值——具体的 PowerShell 命令见
   [verify.md](verify.md)（英文）。

哈希一致只能说明文件完整、确实来自本仓库的 Release，并不代表这个应用是安全的——
详见 [verify.md](verify.md) 末尾的说明。

## 如何继续

哈希核对无误后：

1. 如果对话框已关闭，重新运行安装包。
2. 点击 **"更多信息"**。
3. 点击 **"仍要运行"**。

不要为了绕过这个对话框而关闭 SmartScreen、Windows Defender 或任何其他防护功能。
上面的点击路径就是唯一需要的步骤。

## 相关链接

- [校验你的下载文件](verify.md)（英文）
- [SECURITY.md](../SECURITY.md)（英文）——所有产品当前已知的安全状态说明
