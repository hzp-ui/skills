# 微信小程序 AI 开发模式（Beta）

> 基于官方文档 + 官方 Demo (wechat-miniprogram/ai-mode-demo) 深度分析整理。

## 核心定位

小程序 AI 开发模式提供智能化运行环境和开发框架，开发者将小程序功能抽象为**原子接口**和**原子组件**，封装成 **SKILL**，供小程序 AI 调用。

**当前状态：内测阶段，暂未开放代码提审，禁止合入正式版本。**

---

## 架构概览

```
用户对话
    ↓
小程序 AI（基于 MCP 协议分析意图）
    ↓
选择 SKILL → 调用原子接口 → 执行 JS 逻辑
    ↓
返回 structuredContent → 原子组件渲染 GUI 卡片
    ↓
用户操作 → 触发下一步原子接口
```

---

## 核心概念

### 1. 小程序 MCP 协议
向小程序 AI 暴露可调用能力的协议，与标准 MCP 不同，专为小程序特点定制。

### 2. 原子接口（Atomic API）
- **最小执行单元**，封装单一业务功能
- 标准化输入参数和输出结构
- 运行在微信客户端**独立 JS 环境**
- 输出格式：
  ```javascript
  {
    isError: boolean,           // 是否错误
    content: ContentBlock[],     // 返回给 LLM 的文本（≤200KB）
    structuredContent: object,  // 结构化数据，渲染卡片用（≤200KB）
    _meta: object               // 对 LLM 不可见，传给组件（≤200KB）
  }
  ```

### 3. 原子组件（Atomic Component）
- 原子接口的可视化展示单元
- 将 structuredContent 渲染为 GUI 卡片
- 运行在独立上下文，可调用的接口能力与原子接口不同
- 尺寸约束：最小 4:1，最大 1:1，随内容自动撑高

### 4. SKILL
完成特定场景任务的完整能力封装，包含：
- **SKILL.md** - 业务说明
- **mcp.json** - 模型可调用能力的声明
- **index.js** - 原子接口注册
- **apis/** - 原子接口实现
- **components/** - 原子组件实现

---

## SKILL 标准目录结构

```
my-skill/
├── SKILL.md              # SKILL 详细说明（最大 16KB）
├── index.js              # 注册所有原子接口
├── mcp.json              # MCP 协议声明（最大 24KB，除去 outputSchema 和空格）
├── apis/
│   ├── getSomething.js   # 原子接口实现
│   └── doSomething.js
└── components/
    ├── result-card/      # 原子组件
    │   ├── index.js
    │   ├── index.json
    │   ├── index.wxml
    │   └── index.wxss
    └── detail-card/
```

---

## mcp.json 声明规范

### 接口声明字段

| 字段 | 必填 | 说明 |
|------|------|------|
| name | ✅ | 标识符，与 index.js 中导出的函数名一致 |
| description | ✅ | 原子接口功能描述，**首句声明业务对象** |
| inputSchema | ✅ | 入参，需为对象格式 |
| outputSchema | 建议 | structuredContent 的 schema |
| _meta.ui.componentPath | 否 | 指定渲染的原子组件路径 |

### description 写作要点

```javascript
// ✅ 正确：首句声明业务对象
"description": "搜索饮品。按关键词、温度、杯型检索饮品列表..."

// ❌ 错误：首句强调入参，语义过宽
"description": "按关键词、温度、杯型搜索商品列表..."
```

### inputSchema 字段规范

- **ID 类字段**：必须声明取值来源接口，禁止编造
  ```javascript
  "drinkId": {
    "description": "商品唯一标识，必须来自 getRecommendedDrinks / searchDrinks 返回的 items[].drinkId。【禁止编造】"
  }
  ```
- **普通字段**：给多个不同样本 + 明确缺省处理
  ```javascript
  "scenario": {
    "description": "使用场景。取值：'default'/'coffee'/'tea'/'warm'，用户未明确时留空走 default。"
  }
  ```

### 处理图片/文件输入

```javascript
// 在 inputSchema 中声明 image/file 类型的字段
"inputSchema": {
  "properties": {
    "image": {
      "type": "string",
      "format": "image"  // 或 "format": "file"
    }
  }
}
```

---

## 原子接口实现规范

### 标准返回结构

```javascript
async function myAPI({ param1, param2 }) {
  try {
    // 业务逻辑...
    
    return {
      isError: false,
      // content：事实陈述 + 业务动作（两段式）
      content: [{
        type: 'text',
        text: `已完成 XXX。接下来展示结果卡片，禁止以纯文本列出详情。`
      }],
      // structuredContent：Agent 理解的结构化数据
      structuredContent: {
        itemId: 'xxx',
        name: 'xxx',
        // ...卡片渲染需要、Agent 需要理解的数据
      },
      // _meta：纯渲染数据，Agent 不可见
      _meta: {
        imageUrl: 'xxx',
        // ...仅组件需要的冗余字段
      }
    }
  } catch (err) {
    return {
      isError: true,
      content: [{ type: 'text', text: `失败原因：${err.message}。下一步动作：xxx。` }]
    }
  }
}

module.exports = myAPI
```

### 错误处理三要素

失败时 content 必须包含：
1. **陈述具体事实**：把问题原因写清楚
2. **给出下一步出口**：接下来应该 xxx
3. **指出不应做的动作**：禁止再次 xxx（配对出现）

```javascript
// 示例
content: [{
  type: 'text',
  text: `未找到「圣诞限定款」。请告诉用户未找到，并引导用户在其他热销饮品中挑选。不要再以相同关键词重试。`
}]
```

### 禁止编造原则

- `drinkId` 必须来自上游接口返回的 `items[].drinkId`
- `orderId` 必须来自 `confirmSku` 等接口返回的 `orderId`
- 所有枚举值必须使用声明的英文枚举（如 `'ice'`、`'hot'`）

---

## 原子组件实现规范

### 组件基础结构

```javascript
Component({
  data: {
    // 渲染数据
    title: '',
    items: []
  },
  lifetimes: {
    created() {
      // 获取上下文
      this._modelCtx = wx.modelContext.getContext(this)
      this._viewCtx = wx.modelContext.getViewContext(this)
      
      // 监听原子接口返回结果
      const { NotificationType } = wx.modelContext
      this._modelCtx.on(NotificationType.Result, (data) => {
        const result = data?.result || {}
        const sc = result.structuredContent || {}
        const meta = result._meta || {}
        
        // 渲染逻辑
        this.setData({
          // 优先使用 _meta（含 imageUrl），fallback 到 structuredContent
          items: meta.viewItems || sc.items || []
        })
        
        // 设置关联小程序页面（必须）
        this._viewCtx.setRelatedPage({
          query: `itemId=${sc.itemId}`
        })
      })
    }
  },
  methods: {
    onTapItem(e) {
      const item = e.currentTarget.dataset.item
      // 点击后上行消息给 Agent
      this._modelCtx.sendFollowUpMessage({
        content: [
          { type: 'text', text: `选择${item.name}` },
          { type: 'api/call', data: { name: 'selectItem', arguments: { itemId: item.id } } }
        ]
      })
    }
  }
})
```

### 原子组件约束

| 特性 | 说明 |
|------|------|
| 渲染尺寸 | 宽度随屏幕，高度 4:1 ~ 1:1 |
| 初始化 | 初始化时决定卡片高度，后续不可改变 |
| 事件支持 | 仅支持 tap、Image load/error |
| 网络请求 | 默认不支持，需声明为「实时动态组件」 |
| 定时器 | 默认不支持，需声明为「实时动态组件」 |
| 滚动 | 禁止上下滚动（overflow-y） |
| 半屏页面 | 支持点击打开半屏页面 |
| 动画 | 不支持 |

### 组件过期机制

```javascript
// mcp.json 中声明
"components": [{
  "path": "components/my-card",
  "expirable": true,
  "expiredText": "服务已过期"
}]

// 原子接口中使过期
return {
  _meta: {
    expirePreviousCards: true  // 使之前渲染的同类卡片过期
  }
}
```

---

## 中间件机制

统一处理登录态、上报、错误监听等公共逻辑。

```javascript
const skill = wx.modelContext.createSkill('skills/my-skill')

// 注册中间件
skill.use(async (ctx, next) => {
  console.log('前置逻辑')
  await next()
  console.log('后置逻辑')
})

// 注册原子接口
skill.registerAPI('myAPI', myAPIHandler)
```

---

## app.json 配置

```json
{
  "subPackages": [{
    "root": "skills",
    "pages": [],
    "independent": true
  }],
  "lazyCodeLoading": "requiredComponents",
  "agent": {
    "skills": [
      {
        "name": "my-skill",
        "description": "我的 SKILL 场景描述",
        "path": "skills/my-skill"
      }
    ]
  }
}
```

---

## 最佳实践要点

### 信息源注意力权重

| 信息源 | 权重 | 写什么 |
|--------|------|--------|
| content 返回值 | ★★★★★ | 本次调用结果 + 下一步动作 |
| mcp.json description | ★★★★ | 接口功能、调用时机、不适用场景 |
| inputSchema.description | ★★★★ | 参数语义、取值来源、缺省处理 |
| SKILL.md | ★★★ | 业务流程、跨接口规则、意图分流 |

### 内容分工

- **content**：本次调用结果与下一步动作
- **description**：接口本身的功能、调用时机
- **inputSchema.description**：参数语义、取值来源、缺省处理
- **SKILL.md**：业务流程、跨接口规则、意图分流

### SKILL.md 必备内容

1. **业务流程图**：用户意图 → 原子接口 → 用户操作 → 原子接口
2. **接口依赖关系表**：前置条件、组件绑定
3. **业务约束**：输出形态、执行顺序、数据来源
4. **意图分流规则**：哪些表达触发哪个接口

### 上行消息文案原则

- 用户视角出发，第一人称
- 自然语言表达，摒弃字段罗列
- 描述当前操作，不预判未来
- 信息充分但不过载

---

## 参考资料

- 官方文档：https://developers.weixin.qq.com/miniprogram/dev/ai/guide.html
- 官方 Demo：https://github.com/wechat-miniprogram/ai-mode-demo
- 接入方式：https://developers.weixin.qq.com/miniprogram/dev/ai/integration.html
- 最佳实践：https://developers.weixin.qq.com/miniprogram/dev/ai/best-practices.html
- 调试工具：微信开发者工具 Nightly Electron Build

---

## 相关文件

- `reference/mcp.json` - mcp.json 模板参考
- `reference/index.js` - index.js 注册模板
- `reference/apis/原子接口示例.js` - 原子接口实现参考
- `reference/components/组件示例/index.js` - 原子组件实现参考
