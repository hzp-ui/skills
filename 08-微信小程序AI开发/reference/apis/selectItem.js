/**
 * 原子接口示例：selectItem 查看详情
 * 
 * 规范：
 * - 必须校验 itemId 有效性
 * - 返回详情 + 可选规格
 */

async function selectItem({ itemId } = {}) {
  try {
    // 1. 校验必填参数
    if (!itemId) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: `缺少 itemId。必须先调用 getRecommendedItems 或 searchItems 获取有效 itemId，禁止自行编造。`
        }]
      }
    }

    // 2. 模拟查询详情数据
    const mockItem = {
      'item001': { id: 'item001', name: '拿铁', price: 28, category: '咖啡', description: '经典意式拿铁，丝滑香浓' },
      'item002': { id: 'item002', name: '美式', price: 22, category: '咖啡', description: '双份浓缩加水，清爽提神' },
      'item003': { id: 'item003', name: '奶茶', price: 18, category: '茶饮', description: '香浓奶茶，甜而不腻' },
    }[itemId]

    // 3. 校验数据存在
    if (!mockItem) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: `未找到 itemId=${itemId} 的项。禁止编造 ID，应重新调用 getRecommendedItems 获取有效项。`
        }]
      }
    }

    // 4. 返回详情 + 规格选项
    const specOptions = {
      temperature: {
        name: '温度',
        options: [
          { label: '热', value: 'hot' },
          { label: '冰', value: 'ice' }
        ]
      },
      sugar: {
        name: '糖度',
        options: [
          { label: '无糖', value: 'none' },
          { label: '少糖', value: 'less' },
          { label: '标准', value: 'normal' },
          { label: '多糖', value: 'more' }
        ]
      },
      cupSize: {
        name: '杯型',
        options: [
          { label: '中杯', value: 'medium' },
          { label: '大杯', value: 'large' }
        ]
      }
    }

    return {
      isError: false,
      // 事实 + 动作两段式
      content: [{
        type: 'text',
        text: `已为你找到「${mockItem.name}」详情（¥${mockItem.price}）。接下来展示详情卡片，等待用户在卡片上选择规格后继续。禁止主动跳过卡片展示。`
      }],
      structuredContent: {
        itemId: mockItem.id,
        name: mockItem.name,
        price: mockItem.price,
        description: mockItem.description,
        categoryName: mockItem.category,
        specOptions
      },
      _meta: {
        imageUrl: `https://example.com/images/${mockItem.id}.jpg`
      }
    }
  } catch (err) {
    console.error('[selectItem] error', err)
    return {
      isError: true,
      content: [{
        type: 'text',
        text: `查询详情失败：${err.message || '未知错误'}。请告知用户稍后再试，禁止重试本接口。`
      }]
    }
  }
}

module.exports = selectItem
