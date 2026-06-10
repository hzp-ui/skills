---
name: api-batch-tester
description: "API接口批量测试。手动测API太慢？自动发送请求验证接口返回是否正确 This skill should be used when the user asks about API接口批量测试. Keywords: API测试, 接口测试, 测试API."
---

# API接口批量测试

> 手动测API太慢？自动发送请求验证接口返回是否正确

## 前置依赖

```bash
pip install requests
```

## 核心能力

### 能力1：读取 API 文档或 Swagger/OpenAPI spec（read_file）

用 `web_fetch` 抓取页面内容 / 用 `read_file` 读取文件。

### 能力2：自动生成测试用例（正常/异常/边界）

用 `write_to_file` 生成文件。

### 能力3：执行测试请求（execute_command + curl/httpie）

用 `read_file` 读取API文档或配置文件，用 `execute_command` 运行curl命令批量测试接口并收集结果。

### 能力4：验证响应（状态码/字段/性能）

用 `read_file` 读取API文档或配置文件，用 `execute_command` 运行curl命令批量测试接口并收集结果。

### 能力5：生成测试报告

用 `write_to_file` 生成文件。

## 使用流程

### 步骤 1：收集用户需求

向用户确认以下信息（如果未主动提供）：
- API的基础URL是什么？
- 需要测试哪些接口？（提供接口列表或Swagger/OpenAPI文档路径）
- 认证方式（Bearer Token/API Key/无需认证）
- 期望的测试报告格式（Markdown/JSON/HTML）

### 步骤 2：运行脚本处理数据

```bash
python3 scripts/api_batch_tester_tool.py run \
  --input "用户提供的输入" \
  --output "/path/to/output_file"
```

读取脚本输出的结果，确认数据处理成功。

### 步骤 3：生成最终产出

基于脚本输出和搜索到的资源，用 `write_to_file` 生成以下文件：

- **测试报告（Markdown）**
- **测试用例集**

输出格式要求：Markdown 测试报告 + 用例清单

### 步骤 4：汇总交付

向用户展示：
1. 生成的文件路径和内容摘要
2. 搜集到的资源链接列表
3. 关键发现和建议

## 输出格式

```markdown
# 📋 API接口批量测试 — 执行报告

**生成时间**: YYYY-MM-DD HH:MM
**目标用户**: 后端开发、测试工程师、API 设计师

## 执行摘要
[基于实际执行结果的一段话摘要]

## 详细结果

### 📊 生成的文件
| 文件名 | 类型 | 说明 |
|--------|------|------|
| [文件名] | [类型] | [说明] |

### 🔗 资源链接
| 名称 | 链接 | 说明 |
|------|------|------|
| [资源] | [URL] | [说明] |

## 行动建议
[具体的下一步建议]
```

## 验收标准

- ✅ 所有接口已覆盖
- ✅ 测试用例含正常+异常
- ✅ 响应验证正确
- ✅ 报告可追踪

## 场景化适配

根据 API 类型（REST/GraphQL/gRPC）调整测试策略


## 依赖 Skills

本 Skill 参考以下已有 Skill 的能力进行增强：
- **api-tester**

## 注意事项

- 所有数据必须来自 `web_search` / `web_fetch` 的真实搜索结果，**严禁编造数据**
- 数据缺失时标注"数据不可用"而非猜测
- 报告必须保存为文件（`write_to_file`），不能只在对话中输出
- 建议结合人工判断使用，AI 分析仅供参考
