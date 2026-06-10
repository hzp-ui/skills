/**
 * SKILL 入口文件 - 原子接口注册
 * 
 * 规范：
 * 1. 必须使用 createSkill 创建 skill 实例
 * 2. 通过 skill.registerAPI 注册原子接口
 * 3. 可选使用 skill.use 注册中间件
 */

// 引入原子接口实现
const getRecommendedItems = require('./apis/getRecommendedItems.js')
const searchItems = require('./apis/searchItems.js')
const selectItem = require('./apis/selectItem.js')
const confirmAction = require('./apis/confirmAction.js')

// 创建 skill 实例，path 需与 app.json 中 agent.skills[].path 一致
const skill = wx.modelContext.createSkill('skills/my-skill')

// 可选：注册中间件（统一处理登录态、上报、错误监听等）
skill.use(async (ctx, next) => {
  // 前置逻辑：记录开始时间、检查登录态等
  console.log('[my-skill] API 调用开始', ctx.apiName)
  
  try {
    await next()  // 执行原子接口
  } catch (err) {
    // 统一错误处理
    console.error('[my-skill] API 执行异常', ctx.apiName, err)
  }
  
  // 后置逻辑：记录结果、上报等
  console.log('[my-skill] API 调用完成', ctx.apiName)
})

// 注册原子接口，name 需与 mcp.json 中声明的一致
skill.registerAPI('getRecommendedItems', getRecommendedItems)
skill.registerAPI('searchItems', searchItems)
skill.registerAPI('selectItem', selectItem)
skill.registerAPI('confirmAction', confirmAction)

console.log('[my-skill] APIs registered successfully')
