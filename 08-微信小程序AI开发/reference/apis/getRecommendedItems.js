/**
 * 原子接口示例：getRecommendedItems 获取推荐列表
 * 
 * 规范：
 * - content：「事实陈述 + 业务动作」两段式
 * - structuredContent：供 Agent 理解的结构化数据
 * - _meta：纯渲染数据，Agent 不可见（如 imageUrl）
 */

// 假设的业务数据
const mockCatalog = [
  { id: 'item001', name: '拿铁', price: 28, category: '咖啡', description: '经典意式拿铁' },
  { id: 'item002', name: '美式', price: 22, category: '咖啡', description: '双份浓缩加水' },
  { id: 'item003', name: '奶茶', price: 18, category: '茶饮', description: '香浓奶茶' },
]

async function getRecommendedItems({ scenario = 'default' } = {}) {
  try {
    // 业务逻辑：根据 scenario 筛选推荐项
    let items = mockCatalog
    if (scenario === 'coffee') {
      items = mockCatalog.filter(i => i.category === '咖啡')
    } else if (scenario === 'tea') {
      items = mockCatalog.filter(i => i.category === '茶饮')
    }

    // 构建返回数据
    const resultItems = items.map(item => ({
      itemId: item.id,
      name: item.name,
      price: item.price,
      description: item.description,
      categoryName: item.category
    }))

    // structuredContent：Agent 理解用的数据
    const structuredContent = {
      items: resultItems,
      total: resultItems.length,
      hasMore: false,
      keyword: null  // 推荐场景无关键词
    }

    // _meta：纯渲染数据，Agent 不可见
    // 注意：imageUrl 等图片字段应该放在 _meta 里
    const viewItems = resultItems.map(item => ({
      ...item,
      imageUrl: `https://example.com/images/${item.id}.jpg`  // 仅渲染用
    }))

    return {
      isError: false,
      // content：事实陈述 + 业务动作（两段式）
      content: [{
        type: 'text',
        text: `为你推荐 ${resultItems.length} 款饮品。接下来展示推荐卡片，点击卡片可查看详情并选择。`
      }],
      structuredContent,
      _meta: {
        viewItems  // 带 imageUrl 的渲染数据
      }
    }
  } catch (err) {
    console.error('[getRecommendedItems] error', err)
    return {
      isError: true,
      content: [{
        type: 'text',
        text: `获取推荐列表失败：${err.message || '未知错误'}。请告知用户稍后再试，禁止重试本接口。`
      }]
    }
  }
}

module.exports = getRecommendedItems
