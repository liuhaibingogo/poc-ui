import request from '@/utils/request'

// 查询采购清单列表
export function listBuyList(query) {
  return request({
    url: '/system/buyList/list',
    method: 'get',
    params: query
  })
}

// 查询采购清单详细
export function getBuyList(ID) {
  return request({
    url: '/system/buyList/' + ID,
    method: 'get'
  })
}

// 新增采购清单
export function addBuyList(data) {
  return request({
    url: '/system/buyList',
    method: 'post',
    data: data
  })
}

// 修改采购清单
export function updateBuyList(data) {
  return request({
    url: '/system/buyList',
    method: 'put',
    data: data
  })
}

// 删除采购清单
export function delBuyList(ID) {
  return request({
    url: '/system/buyList/' + ID,
    method: 'delete'
  })
}
