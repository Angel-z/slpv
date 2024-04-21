import request from '@/utils/request.js'

export function listIssue(query) {
    return request({
        url: '/issue/list',
        method: 'get',
        params: query
    })
}

export function getIssue(issueId){
    return request({
        url: '/issue/' + issueId,
        method: 'get'
    })
}

export function getMyIssues(){
    return request({
        url: '/issue/myIssues',
        method: 'get'
    })

}

export function addIssue(data) {
    return request({
        url: '/issue',
        method: 'post',
        data: data
    })
}

export function deleteIssue(issueId) {
    return request({
        url: '/issue/' + issueId,
        method: 'delete'
    })
}

export function listIssueReply(query) {
    return request({
        url: '/issue/reply/list',
        method: 'get',
        params: query
    })
}

export function addIssueReply(data) {
    return request({
        url: '/issue/reply',
        method: 'post',
        data: data
    })
}

export function deleteIssueReply(replyId) {
    return request({
        url: '/issue/reply/' + replyId,
        method: 'delete'
    })
}