---
title: 代理配置
date: 2023-04-07
tags: [study, proxy, tutorial, network]
---
# 代理配置

## PowerShell 代理

需要管理员权限，否则报错：`Error writing proxy settings. (5) Access is denied.`

```powershell
# 查看当前代理
netsh winhttp show proxy

# 设置代理
netsh winhttp set proxy 127.0.0.1:7890
# 或从 IE 导入
netsh winhttp import proxy source=ie

# 临时环境变量
$env:HTTP_PROXY="http://127.0.0.1:7890"
$env:HTTPS_PROXY="https://127.0.0.1:7890"

# 重置代理
netsh winhttp reset proxy
```

### Git 代理

```bash
# 设置
git config --global http.proxy 127.0.0.1:7890
git config --global https.proxy 127.0.0.1:7890

# 取消
git config --global --unset http.proxy
git config --global --unset https.proxy
```

### CMD 代理

```cmd
netsh winhttp set proxy 127.0.0.1:7890
netsh winhttp reset proxy

set http_proxy=127.0.0.1:7890
set https_proxy=127.0.0.1:7890
set http_proxy=
set https_proxy=
```

## Ubuntu 代理

```bash
http_proxy="http://127.0.0.1:7890"
https_proxy="http://127.0.0.1:7890"
ftp_proxy="ftp://myproxy3.server.com:8080/"
socks_proxy="socks://myproxy4.server.com:8080/"
no_proxy="localhost,127.0.0.1,localaddress,.localdomain.com"
```
