import request from "@/utils/request.js";

export function listSubject(query) {
    return request({
        url: '/system/subject/list',
        method: 'get',
        params: query
    })
}

export function delSubject(subjectId) {
    return request({
        url: '/system/subject/' + subjectId,
        method: 'delete'
    })
}