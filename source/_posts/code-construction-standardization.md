---
title: 代码建设标准
date: 2026-03-22
tags: [study, coding, standardization, tutorial]
---

# 代码建设标准

## 概述

代码建设标准化是对项目从初始化到交付全过程的约束，覆盖目录结构、命名规范、配置管理、日志体系、脚本规范、版本控制等维度。目标是让任何人在任何时间接手项目，都能快速理解并参与开发。

---

## 项目结构

一个标准化项目应具备清晰的目录分层：

```
project/
├── main.py                 # 主程序入口
├── config/                 # 配置文件目录
│   ├── config.json         # 运行时配置（JSON）
│   └── config.py           # 配置加载模块
├── logs/                   # 日志目录（按日期/类别）
├── scripts/                # 启动与部署脚本
│   ├── start.sh            # Linux/macOS
│   ├── start.ps1           # Windows PowerShell
│   └── start.bat           # Windows CMD
├── src/                    # 数据文件
│   ├── input/              # 输入
│   └── output/             # 输出
├── .gitignore              # 版本控制忽略规则
├── claude.md               # 更新记录
└── README.md               # 项目说明
```

**原则：**

- 入口文件置于根目录，一眼可见
- 配置、日志、脚本、数据各自独立成目录
- 每个目录职责单一，不混放

---

## 配置管理

### 分层设计

配置应分为静态配置文件与运行时环境变量两层：

```json
{
  "app": {
    "name": "project-name",
    "version": "1.0.0",
    "debug": false
  },
  "server": {
    "host": "127.0.0.1",
    "port": 8080
  },
  "log": {
    "level": "INFO",
    "dir": "logs"
  }
}
```

### 加载优先级

环境变量覆盖配置文件，便于不同环境部署：

```python
env = os.getenv("APP_ENV", "development")
host = os.getenv("APP_HOST", CONFIG.get("server", {}).get("host", "127.0.0.1"))
port = os.getenv("APP_PORT", CONFIG.get("server", {}).get("port", 8080))
```

| 优先级 | 来源 | 适用场景 |
|--------|------|----------|
| 1（最高） | 命令行参数 | 临时调试、单次覆盖 |
| 2 | 环境变量 | CI/CD、容器部署 |
| 3 | 配置文件 | 默认值、团队共享 |

### 敏感信息

- 密码、密钥、Token **禁止** 写入配置文件或代码
- 使用 `.env` 文件本地管理，通过 `.gitignore` 排除

```gitignore
.env
.env.local
.env.*.local
```

---

## 日志体系

### 目录结构

日志按日期分目录，按类别分文件：

```
logs/
├── 2026-03-22/
│   ├── app.log        # 应用日志
│   ├── error.log      # 错误日志
│   └── access.log     # 访问日志
└── 2026-03-23/
    └── ...
```

### 格式规范

统一的日志格式便于检索和分析：

```
[2026-03-22 14:30:00] [INFO] [main] 应用启动成功
[2026-03-22 14:30:05] [ERROR] [db] 数据库连接超时
```

格式组成：`[时间] [级别] [模块] 消息`

### 分级使用

| 级别 | 用途 | 示例 |
|------|------|------|
| DEBUG | 开发调试细节 | 变量值、执行路径 |
| INFO | 正常运行节点 | 启动、配置加载完成 |
| WARNING | 潜在问题 | 配置缺失使用默认值 |
| ERROR | 错误但可恢复 | 请求失败、重试 |
| CRITICAL | 致命错误 | 服务崩溃、数据损坏 |

### 实现参考

```python
def setup_logger(name: str, category: str = "app", level: int = None) -> logging.Logger:
    logger = logging.getLogger(name)
    if level is None:
        level_str = CONFIG.get("log", {}).get("level", "INFO")
        level = getattr(logging, level_str, logging.INFO)
    logger.setLevel(level)

    # 按日期创建日志目录
    today = datetime.now().strftime("%Y-%m-%d")
    log_dir = LOG_DIR / today
    log_dir.mkdir(parents=True, exist_ok=True)

    # 文件 + 控制台双输出
    formatter = logging.Formatter(
        "[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    for handler in [
        logging.FileHandler(log_dir / f"{category}.log", encoding="utf-8"),
        logging.StreamHandler()
    ]:
        handler.setLevel(level)
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    return logger
```

---

## 启动脚本规范

### 跨平台覆盖

每个项目应提供三套启动脚本：

| 脚本 | 平台 | 执行方式 |
|------|------|----------|
| `start.sh` | Linux/macOS | `./scripts/start.sh` |
| `start.ps1` | Windows PowerShell | `.\scripts\start.ps1` |
| `start.bat` | Windows CMD | `scripts\start.bat` |

### 统一参数

所有脚本接受相同的参数集：

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `-c, --config` | 配置文件路径 | config/config.json |
| `-e, --env` | 运行环境 | development |
| `-l, --log-level` | 日志级别 | INFO |
| `-H, --host` | 服务器主机 | 127.0.0.1 |
| `-p, --port` | 服务器端口 | 8080 |
| `-d, --daemon` | 后台运行 | - |

### 脚本职责

启动脚本不应包含业务逻辑，只负责：

1. 解析命令行参数
2. 检测并激活虚拟环境
3. 设置环境变量
4. 调用主程序入口

---

## 版本控制

### .gitignore 分类

按类别组织忽略规则，而非随意堆砌：

```gitignore
# Dependencies
node_modules/
venv/
vendor/

# Build outputs
dist/
build/
*.o
*.so

# IDE
.idea/
.vscode/
*.swp

# OS files
.DS_Store
Thumbs.db

# Logs（保留目录结构）
logs/*
!logs/.gitkeep

# Data（保留目录结构）
src/input/*
src/output/*
!src/input/.gitkeep
!src/output/.gitkeep

# Environment
.env
.env.local

# Cache
__pycache__/
.pytest_cache/
```

**关键技巧：** 使用 `.gitkeep` 保留空目录结构，使用 `!` 取反排除。

### 更新记录

维护 `claude.md` 或 `CHANGELOG.md`，按日期记录变更：

```markdown
## 2026-03-22

### 新增功能
- 功能描述

### 修复
- 修复描述
```

### 提交规范

```
<type>: <subject>

type:
  feat     新功能
  fix      修复
  docs     文档
  style    格式（不影响逻辑）
  refactor 重构
  test     测试
  chore    构建/工具变更
```

---

## 命名规范

| 对象 | 规范 | 示例 |
|------|------|------|
| 文件/目录 | 小写 + 下划线 | `config.py`, `log_dir` |
| 类 | PascalCase | `ConfigLoader` |
| 函数/变量 | snake_case | `get_app_logger` |
| 常量 | 全大写 + 下划线 | `BASE_DIR`, `CONFIG_FILE` |
| 配置键 | 小写 + 下划线 | `log_level`, `max_size_mb` |
| 环境变量 | 全大写 + 前缀 | `APP_ENV`, `APP_HOST` |

---

## 代码风格

### 模块头部

每个模块以 docstring 说明用途：

```python
"""
配置文件模块
支持从 config.json 加载配置，并提供日志配置
"""
```

### 路径处理

使用 `pathlib.Path` 代替字符串拼接：

```python
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
CONFIG_FILE = BASE_DIR / "config" / "config.json"
LOG_DIR = BASE_DIR / "logs"
```

### 函数文档

公开函数提供类型注解和 docstring：

```python
def setup_logger(
    name: str,
    category: str = "app",
    level: int = None
) -> logging.Logger:
    """
    设置日志记录器

    Args:
        name: 日志记录器名称
        category: 日志类别（app, error, access）
        level: 日志级别

    Returns:
        配置好的 Logger 实例
    """
```

### 防御性编程

配置读取使用安全的链式 `.get()`，避免 KeyError：

```python
level_str = CONFIG.get("log", {}).get("level", "INFO")
host = CONFIG.get("server", {}).get("host", "127.0.0.1")
```

---

## 检查清单

新项目初始化时逐项确认：

- [ ] 目录结构是否符合标准模板
- [ ] README.md 是否包含项目说明、结构树、启动方式
- [ ] 配置文件是否分离敏感信息
- [ ] 日志是否按日期/类别分文件
- [ ] .gitignore 是否覆盖依赖、构建、日志、环境文件
- [ ] 三平台启动脚本是否齐全
- [ ] 入口文件是否支持环境变量覆盖
- [ ] 更新记录是否已创建
