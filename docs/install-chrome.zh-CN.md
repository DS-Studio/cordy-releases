# 安装 Cordy 浏览器扩展

English version: [install-chrome.md](install-chrome.md)

## 从 Chrome 应用商店安装

这是安装 Cordy 浏览器扩展的受支持方式：

**https://chromewebstore.google.com/detail/cordy/kdpfbabcgdgcddadcdacejaaepgkajih**

商店上架的就是当前版本。通过应用商店安装可以获得自动更新，也不会有 Chrome
的安全警告——除非有特别原因，否则请使用这种方式。

## Release 里的 .zip 是做什么用的

每个 Release 也会附带一个扩展的 `.zip`（约 13.4MB）。**这是一个核对/审计用的
校验产物，不是另一条安装路径。** 它让你可以核对提交给 Chrome 应用商店审核的
究竟是哪个具体的包——适合审计，不适合日常安装。

Chrome 不允许普通用户从任意来源安装打包好的扩展。从 Windows 上的 Chrome 33、
macOS 上的 Chrome 44 开始，除非你自己开启开发者模式，否则 Chrome 只允许通过
应用商店安装扩展。这个 zip 无法通过双击或拖拽装入 Chrome。

## 开发者模式：适合确实需要的人

如果你需要使用这个具体的包而不是商店版本——用于评审、测试或审计——可以
以"加载已解压的扩展程序"的方式安装：

1. 下载该 Release 的 `.zip`。
2. 对照 `SHASUMS256.txt` 核对它的 SHA-256——见 [verify.md](verify.md)（英文）。
3. **解压**到一个你会保留的文件夹。Chrome 每次启动都会从这个文件夹加载，
   安装完成后不要删除它。
4. 打开 `chrome://extensions`。
5. 打开右上角的 **"开发者模式"** 开关。
6. 点击 **"加载已解压的扩展程序"**。
7. 选择解压后的文件夹。

### 这样做需要付出的代价

- **没有自动更新。** 每次有新版本都要重复上面这些步骤。
- **持续显示的警告。** 只要还有任何以开发者模式加载的扩展，Chrome 每次启动都会
  显示"停用开发者模式扩展程序"的提示条。

只有在理解并接受这两点之后，才使用这种方式。

## 相关链接

- [校验你的下载文件](verify.md)（英文）
- [SECURITY.md](../SECURITY.md)（英文）——所有产品当前已知的安全状态说明
