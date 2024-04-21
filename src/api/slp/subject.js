import request from '@/utils/request.js'

export function listSubject(query) {
    return request({
        url: '/subject/list',
        method: 'get',
        params: query
    })
}

export function getSubject(subjectId){
    return request({
        url: '/subject/' + subjectId,
        method: 'get'
    })
}

export function getMySubjects(){
    return request({
        url: '/subject/mySubjects',
        method: 'get'
    })

}

export function addSubject(data) {
    return request({
        url: '/subject',
        method: 'post',
        data: data
    })
}

export function updateSubject(data) {
    return request({
        url: '/subject',
        method: 'put',
        data: data
    })
}

export function deleteSubject(subjectId) {
    return request({
        url: '/subject/' + subjectId,
        method: 'delete'
    })
}

export function searchSubject(query){
    return request({
        url: '/subject/search',
        method: 'get',
        params: query
    })
}

export function getSubjectChapter(query){
    return request({
        url: '/subject/chapter',
        method: 'get',
        params: query
    })
}

export function addSubjectChapter(data) {
    return request({
        url: '/subject/chapter',
        method: 'post',
        data: data
    })
}

export function updateSubjectChapter(data) {
    return request({
        url: '/subject/chapter',
        method: 'put',
        data: data
    })
}

export function deleteSubjectChapter(chapterId, subjectId) {
    return request({
        url: '/subject/chapter/' + chapterId,
        method: 'delete',
        params: {subjectId: subjectId}
    })
}

export function getSubjectContent(query) {
    return request({
        url: '/subject/content',
        method: 'get',
        params: query
    })
}

export function getSubjectContentFile(query) {
    return request({
        url: '/subject/content/file',
        method: 'get',
        params: query
    })
}

export function addSubjectContent(data) {
    return request({
        url: '/subject/content',
        method: 'post',
        data: data
    })
}

export function updateSubjectContent(data) {
    return request({
        url: '/subject/content',
        method: 'put',
        data: data
    })
}

export function deleteSubjectContent(contentId, subjectId) {
    return request({
        url: '/subject/content/' + contentId,
        method: 'delete',
        params: {subjectId: subjectId}
    })
}

export function getLearningList(query) {
    return request({
        url: '/subject/learning',
        method: 'get',
        params: query
    })
}

export function addLearningList(data) {
    return request({
        url: '/subject/learning',
        method: 'post',
        data: data
    })
}

export function updateLearningList(data) {
    return request({
        url: '/subject/learning',
        method: 'put',
        data: data
    })
}

export function deleteLearningList(subjectId) {
    return request({
        url: '/subject/learning/' + subjectId,
        method: 'delete',
    })
}