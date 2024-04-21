import request from "@/utils/request.js";

export function listGroup(query) {
    return request({
        url: '/system/group/list',
        method: 'get',
        params: query
    })
}

export function changeGroupStatus(groupId, status) {
    const data = {
        groupId,
        status
    }
    return request({
        url: '/system/group/changeStatus',
        method: 'put',
        data: data
    })
}

export function delGroup(groupId) {
    return request({
        url: '/system/group/' + groupId,
        method: 'delete'
    })
}