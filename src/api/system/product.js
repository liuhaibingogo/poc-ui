import request from '@/utils/request'

// 查询清单列表列表
export function listProduct(query) {
  return request({
    url: '/system/product/list',
    method: 'get',
    params: query
  })
}

// 查询清单列表详细
export function getProduct(ID) {
  return request({
    url: '/system/product/' + ID,
    method: 'get'
  })
}

// 新增清单列表
export function addProduct(data) {
  return request({
    url: '/system/product',
    method: 'post',
    data: data
  })
}

// 修改清单列表
export function updateProduct(data) {
  return request({
    url: '/system/product',
    method: 'put',
    data: data
  })
}

// 删除清单列表
export function delProduct(ID) {
  return request({
    url: '/system/product/' + ID,
    method: 'delete'
  })
}
