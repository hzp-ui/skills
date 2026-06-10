// 推荐列表组件 - 原子组件示例
// 
// 规范：
// - 组件数据从 structuredContent（Agent 语义筛选后下发）
// - imageUrl 等纯渲染字段从 _meta 补充（Agent 不可见）
Component({
  data: {
    title: '为你推荐',
    items: [],
    total: 0,
    hasMore: false
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
        
        // 优先使用 _meta.viewItems（含 imageUrl），fallback 到 structuredContent.items
        const viewItems = meta.viewItems || sc.items || []
        
        this.setData({
          items: viewItems.slice(0, 3),  // 最多展示 3 个
          total: sc.total || viewItems.length,
          hasMore: sc.hasMore || (sc.total && sc.total > 3),
          title: sc.keyword ? `"${sc.keyword}" 搜索结果` : '为你推荐'
        })
        
        // 设置关联小程序页面（必须）
        if (sc.keyword) {
          this._viewCtx.setRelatedPage({
            query: `keyword=${encodeURIComponent(sc.keyword)}`
          })
        }
      })
    }
  },
  
  methods: {
    // 点击列表项
    onTapItem(e) {
      const item = e.currentTarget.dataset.item
      if (!item) return
      
      // 点击后上行消息给 Agent，触发 selectItem
      this._modelCtx.sendFollowUpMessage({
        content: [
          { type: 'text', text: `选择${item.name}` },
          { type: 'api/call', data: { name: 'selectItem', arguments: { itemId: item.itemId } } }
        ]
      })
    },
    
    // 点击查看更多
    onTapMore() {
      // 打开半屏页面
      this._viewCtx.openDetailPage({
        url: '/packageDetail/pages/item-list'
      })
    }
  }
})
