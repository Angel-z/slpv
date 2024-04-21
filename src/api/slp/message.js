import request from "@/utils/request.js";

export function getSentMessages() {
    return request({
        url: '/message/sent',
        method: 'get'
    })
}

export function getReceivedMessages() {
    return request({
        url: '/message/received',
        method: 'get'
    })

}

export function applyGroup(groupId) {
    return request({
        url: '/message/group/apply/' + groupId,
        method: 'post'
    })
}

export function acceptGroup(data) {
    return request({
        url: '/message/group/accept',
        method: 'post',
        data: data
    })
}

export function rejectGroup(data) {
    return request({
        url: '/message/group/reject',
        method: 'post',
        data: data
    })
}