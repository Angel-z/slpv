import request from "@/utils/request.js";

export function listGroup(query) {
    return request({
        url: '/group/list',
        method: 'get',
        params: query
    })
}

export function getGroup(groupId) {
    return request({
        url: '/group/' + groupId,
        method: 'get'
    })
}

export function getMyGroups(query) {
    return request({
        url: '/group/mine',
        method: 'get',
        params: query
    })
}

export function getJoinedGroups(query) {
    return request({
        url: '/group/joined',
        method: 'get',
        params: query
    })
}

export function addGroup(data) {
    return request({
        url: '/group',
        method: 'post',
        data: data
    })
}

export function deleteGroup(groupId) {
    return request({
        url: '/group/' + groupId,
        method: 'delete'
    })

}

export function getGroupMemberList(groupId) {
    return request({
        url: '/group/member/list/' + groupId,
        method: 'get'
    })
}

export function isInGroup(groupId) {
    return request({
        url: '/group/member/isInGroup/' + groupId,
        method: 'get'
    })
}

export function joinGroup(groupId) {
    return request({
        url: '/group/member/join/' + groupId,
        method: 'post'
    })
}

export function quitGroup(groupId) {
    return request({
        url: '/group/member/quit/' + groupId,
        method: 'delete'
    })
}