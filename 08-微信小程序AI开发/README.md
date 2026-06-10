# 08 - 微信小程序 AI 开发

> 微信小程序 AI 开发模式（Beta）技能包

## 📋 概述

本技能包整理了微信小程序 AI 开发模式的核心开发规范和参考实现，基于官方文档和 [wechat-miniprogram/ai-mode-demo](https://github.com/wechat-miniprogram/ai-mode-demo) 深度分析。

## ⚠️ 当前状态

**内测阶段**，暂未开放代码提审，**禁止将相关代码合入正式版本**。

## 📁 目录结构

```
08-微信小程序AI开发/
├── SKILL.md                          # 核心开发规范文档
└── reference/                       # 参考实现模板
    ├── mcp.json                      # MCP 协议声明模板
    ├── index.js                      # SKILL 入口注册模板
    ├── apis/                         # 原子接口示例
    │   ├── getRecommendedItems.js    # 获取推荐列表
    │   └── selectItem.js             # 查看详情
    └── components/                   # 原子组件示例
        └── recommended-list/
            ├── index.js
            └── index.wxml
```

## 🚀 快速开始

### 1. 申请开启
在微信公众平台「基础功能 - AI能力」或小程序「微信开发者助手」中申请「开发模式」。

### 2. 创建 SKILL 分包
按照 `reference/` 目录下的模板创建你的 SKILL：
- SKILL.md - 业务说明
- mcp.json - 接口声明
- index.js - 接口注册
- apis/ - 原子接口实现
- components/ - 原子组件实现

### 3. 配置 app.json
```json
{
  "subPackages": [{
    "root": "skills",
    "pages": [],
    "independent": true
  }],
  "agent": {
    "skills": [{
      "name": "my-skill",
      "description": "我的 SKILL 描述",
      "path": "skills/my-skill"
    }]
  }
}
```

### 4. 开发调试
使用微信开发者工具 Nightly Electron Build 版本进行调试。

## 📚 参考资料

- [官方开发文档](https://developers.weixin.qq.com/miniprogram/dev/ai/guide.html)
- [官方 Demo](https://github.com/wechat-miniprogram/ai-mode-demo)
- [接入方式](https://developers.weixin.qq.com/miniprogram/dev/ai/integration.html)
- [最佳实践](https://developers.weixin.qq.com/miniprogram/dev/ai/best-practices.html)

## 🔑 核心概念

| 概念 | 说明 |
|------|------|
| 原子接口 | 封装单一业务功能的最小执行单元 |
| 原子组件 | 原子接口的可视化展示单元（GUI 卡片） |
| SKILL | 完成特定场景任务的完整能力封装 |
| MCP 协议 | 向小程序 AI 暴露可调用能力的协议 |

## 📝 SKILL.md 核心要点

SKILL.md 应包含：

1. **业务流程图**：用户意图 → 原子接口 → 用户操作 → 原子接口
2. **接口依赖关系表**：前置条件、组件绑定
3. **业务约束**：
   - 输出形态（何时出卡片）
   - 执行顺序（禁止跳过前置接口）
   - 数据来源（禁止编造 ID）
4. **意图分流规则**：哪些表达触发哪个接口

## ⚡ 最佳实践

- **content 写作**：「事实陈述 + 业务动作」两段式
- **禁止编造**：所有 ID 必须来自上游接口返回
- **错误处理**：陈述事实 + 给出出口 + 指出禁令
- **信息分层**：
  - `content` → 返回结果 + 下一步动作
  - `structuredContent` → Agent 理解的数据
  - `_meta` → 仅组件渲染用的数据（Agent 不可见）
