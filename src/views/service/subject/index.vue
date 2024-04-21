<template>
  <meta name="referrer" content="no-referrer">
  <uNavbar/>

  <div class="app-container">
    <el-container>
      <el-aside width="15%" style="height: 80vh; overflow: hidden">
        <el-affix>
          <div>
            <h2 class="title">目录</h2>

            <el-tree
                :data="data"
                node-key="key"
                default-expand-all
                draggable
                :allow-drop="allowDrop"
                :allow-drag="allowDrag"
                @node-click="nodeClick"
            >
              <template #default="{ node, data }">
            <span class="custom-tree-node">
              <span v-if="!editable">{{ node.label }}</span>
              <el-input v-model="node.data.label" v-if="editable" style="height: 25px" maxlength="50"
                        show-word-limit></el-input>
              <span v-if="editable">
                <a @click="remove(node, data)" v-if="node.data.chapterId !== -1"> 删除 </a>
              </span>
            </span>
              </template>
            </el-tree>

            <div class="append">
              <el-button plain type="text" @click="append('新章节', 0)" v-if="editable"> 新增</el-button>
            </div>
          </div>
        </el-affix>
      </el-aside>

      <el-divider direction="vertical" style="height: auto"/>

      <el-container>
        <el-main class="main">
          <h2 class="title">{{ subjectTitle }}</h2>
          <h3 class="author" v-show="subjectChapterId === -1">作者：{{ author }}</h3>
          <h3 class="dateTime" v-show="subjectChapterId === -1">
            创建时间：{{ parseTime(createTime, '{y}年{m}月{d}日 {h}:{i}') }}，
            更新时间：{{ parseTime(updateTime, '{y}年{m}月{d}日 {h}:{i}') }}</h3>
          <div class="ql-container ql-snow" v-if="!editableContent" style="height: auto; border: 0">
            <div class="ql-editor"
                 v-html="subjectChapterId === -1? subjectContent.replace(/\n/g, '<br>'):subjectContent"
            ></div>
          </div>
          <div v-else>
            <el-input v-if="subjectChapterId === -1" v-model="subjectDescription" type="textarea"
                      :autosize="{ minRows: 6}" placeholder="请输入简介" maxlength="250" show-word-limit/>
            <editor v-else v-model="subjectContent" :height="-1"/>
          </div>

          <el-backtop></el-backtop>
        </el-main>
        <el-footer>
          <!--          <el-affix position="bottom">-->
          <!--            <div style="background: #FFFFFF">-->
          <!--              <pagination class="pagi"-->
          <!--                          v-show="total > 0"-->
          <!--                          :total="total"-->
          <!--                          v-model:page="queryParams.pageNum"-->
          <!--                          v-model:limit="queryParams.pageSize"-->
          <!--                          @pagination="getContent"-->
          <!--                          :pc="false"-->
          <!--                          :layout="'total, prev, pager, next, jumper'"-->
          <!--              />-->
          <!--            </div>-->
          <!--          </el-affix>-->
        </el-footer>
      </el-container>

      <el-divider direction="vertical" style="height: auto"/>

      <el-aside width="15%" style="height: auto; overflow: hidden">
        <div class="right-side" v-if="subjectStatus">
          <el-row>
            <router-link :to="`/subject/issue/${subjectId}`" target="_blank">
              <el-button plain type="text" style="margin-top: 0">查看问题</el-button>
            </router-link>
            <el-col>
              <el-button plain type="text" @click="addToLearningList" id="learningList">
                {{ isInLearningList ? "取消学习" : "加入学习" }}
              </el-button>
            </el-col>
            <el-col v-if="isInLearningList">
              <el-button plain type="text" @click="saveProgress" id="saveProgress">保存进度</el-button>
            </el-col>
            <el-col v-if="isInLearningList">
              <el-button plain type="text" @click="doneLearning" id="doneLearning">
                {{ learningStatus ? "取消完成学习" : "完成学习" }}
              </el-button>
            </el-col>
          </el-row>
          <el-divider/>
        </div>
        <div class="right-side" v-if="owner">
          <el-row>
            <el-col>
              <el-button plain type="text" @click="editIndex" id="editIndex" style="margin-top: 0">
                {{ editable ? "完成编辑目录" : "编辑目录" }}
              </el-button>
            </el-col>
            <el-col>
              <el-button plain type="text" @click="editContent" id="editContent">
                {{ editableContent ? "完成编辑内容" : "编辑内容" }}
              </el-button>
            </el-col>
          </el-row>
          <el-row>
            <el-col>
              <el-popconfirm
                  title="确定要发布该文章吗？"
                  @confirm="pressSubject"
                  v-if="subjectStatus === 0"
              >
                <template #reference>
                  <el-button plain type="text" id="press">发布</el-button>
                </template>
              </el-popconfirm>
              <el-popconfirm
                  title="确定要取消发布该文章吗？"
                  @confirm="unPressSubject"
                  v-else
              >
                <template #reference>
                  <el-button plain type="text" id="press">取消发布</el-button>
                </template>
              </el-popconfirm>
            </el-col>
            <el-col>
              <el-popconfirm
                  iconColor="red"
                  title="确定要删除该文章吗？"
                  @confirm="delSubject"
              >
                <template #reference>
                  <el-button plain type="text" id="delete" style="color: #FF0000">删除</el-button>
                </template>
              </el-popconfirm>
            </el-col>
          </el-row>
          <el-divider/>
        </div>

        <el-affix v-if="subjectStatus">
          <div class="communicate">
            <el-card shadow="never">
              <template v-slot:header>
                <div class="clearfix">
                  <span>交流栏</span>
                  <span v-if="msgCount > 0" style="float: right; color: #409EFF" @click="scrollToBottom">新消息</span>
                </div>
              </template>
              <div class="body">
                <el-container>
                  <el-main>
                    <el-scrollbar ref="scrollbar">
                      <div id="scrollbar">
                        <el-row v-for="item in rMsgList" :key="item.userId">
                          <el-col :span="24">
                            <el-row>
                              <el-col :span="24">
                                <span>{{ item.nickName }}</span>：
                              </el-col>
                            </el-row>
                            <el-row style="background: #EEEEEE; padding: 2px; border-radius: 5px; margin: 0 5px 0 5px">
                              <el-col :span="24" style="padding-left: 2%; padding-right: 2%">
                                <span>{{ item.message }}</span>
                              </el-col>
                            </el-row>
                          </el-col>
                        </el-row>
                      </div>
                    </el-scrollbar>
                  </el-main>
                  <el-divider style="margin: 5px 0 5px 0"/>
                  <el-footer>
                    <el-form :rules="rules" ref="msgForm" :model="form">
                      <el-row>
                        <el-col :span="20">
                          <el-form-item prop="msg">
                            <el-input type="textarea" placeholder="请输入内容" v-model="form.msg"
                                      :autosize="{ minRows: 1}"
                                      maxlength="250" show-word-limit @keyup.ctrl.enter="sendMessage"/>
                          </el-form-item>
                        </el-col>
                        <el-col :span="4">
                          <el-form-item>
                            <el-button type="primary" @click="sendMessage">发送</el-button>
                          </el-form-item>
                        </el-col>
                      </el-row>
                    </el-form>
                  </el-footer>
                </el-container>
              </div>
            </el-card>
          </div>
          <el-divider/>
        </el-affix>

        <div class="file-list">
          <el-card shadow="never">
            <template v-slot:header>
              <div class="clearfix">
                <span>附件</span>
              </div>
            </template>
            <div class="body">
              <uFileUpload :owner="owner" :is-show-tip="owner" :subject-id="subjectId" :chapter-id="subjectChapterId"/>
            </div>
          </el-card>
        </div>

      </el-aside>
    </el-container>
  </div>
</template>

<script setup>

import uNavbar from "@/layout/components/uNavbar.vue";
import {useRoute, useRouter} from "vue-router";
import {
  addLearningList,
  addSubjectChapter,
  deleteLearningList,
  deleteSubject,
  deleteSubjectChapter,
  getLearningList,
  getSubject,
  getSubjectChapter,
  getSubjectContent,
  updateLearningList,
  updateSubject,
  updateSubjectChapter,
  updateSubjectContent
} from "@/api/slp/subject.js";
import useSettingsStore from "@/store/modules/settings.js";
import uFileUpload from "@/components/uFileUpload/index.vue";
import {getUserName, getUserProfile} from "@/api/system/user.js";
import {parseTime} from "@/utils/slp.js";
import {getToken} from "@/utils/auth.js";
import {watchEffect} from "vue";

const {proxy} = getCurrentInstance();
const route = useRoute();
const router = useRouter()

const key = ref(1)
const data = ref([])
const dataDel = ref([])

const queryParams = ref({
  pageNum: 1,
  pageSize: 1,
  subjectId: "",
  chapterId: ""
})

const owner = ref(false)
const editable = ref(false)
const editableContent = ref(false)
const isInLearningList = ref(false)

const total = ref(0);

const author = ref("")
const createTime = ref()
const updateTime = ref()

const subjectId = ref("")
const subjectTitle = ref("");
const subjectDescription = ref("")
const subjectStatus = ref(0)
const subjectChapterId = ref(-1)
const subjectContent = ref("");
const subjectContentId = ref("")

const learningStatus = ref(0)

const websocket = reactive({
  url: "wss://" + import.meta.env.VITE_APP_DOMAIN + "/websocket/subject/",
  rMsgList: []
})

const form = reactive({
  msg: ""
})

const rules = {
  msg: [
    {required: true, message: '消息不能为空', trigger: 'blur'}
  ]
}

let ws = null;

const {url, rMsgList} = toRefs(websocket);
const msgCount = ref(-1)

function join() {
  const wsurl = url.value + subjectId.value
  ws = new WebSocket(wsurl, [getToken()])

  ws.onopen = function (event) {};
  ws.onmessage = function (event) {
    const json = JSON.parse(event.data)
    if (json.messageType === 0) {
      rMsgList.value.push(json)
      msgCount.value++
      if (proxy.$refs["scrollbar"].wrapRef.scrollTop + proxy.$refs["scrollbar"].wrapRef.clientHeight + 0.5 >= proxy.$refs["scrollbar"].wrapRef.scrollHeight) {
        scrollToBottom()
      }
    } else if (json.messageType === 1) {
      proxy.$modal.msgWarning(json)
    } else if (json.messageType === 2) {
      //
    } else if (json.messageType === 3) {
      //
    } else if (json.messageType === 4) {
      onlineMembers.value = JSON.parse(json.message)
    }
  };
  ws.onclose = function (event) {};
}

function sendMessage() {
  proxy.$refs["msgForm"].validate(valid => {
    if (valid) {
      if (ws) {
        ws.send(form.msg)
        form.msg = ""
      } else {
        proxy.$modal.msgWarning("未连接到服务器")
      }
    }
  });
}

function scrollToBottom() {
  nextTick(() => {
    proxy.$refs["scrollbar"].setScrollTop(proxy.$refs["scrollbar"].wrapRef.scrollHeight)
    msgCount.value = 0
  });
}

const scrollbar = ref()
watch(scrollbar, (val) => {
  val.wrapRef.addEventListener('scroll', () => {
    console.log(val.wrapRef.scrollTop + val.wrapRef.clientHeight, val.wrapRef.scrollHeight)
    if (val.wrapRef.scrollTop + val.wrapRef.clientHeight + 0.5 >= val.wrapRef.scrollHeight) {
      msgCount.value = 0
    }
  })
})

watchEffect(() => {
  if (proxy.$refs["scrollbar"] !== undefined) {
    console.log(proxy.$refs["scrollbar"])
  }
})

function getContent() {
  getSubjectContent(queryParams.value).then(response => {
    if (response.rows.length > 0) {
      subjectContentId.value = response.rows[0].contentId
      subjectContent.value = response.rows[0].content
    } else {
      subjectContentId.value = ""
      subjectContent.value = ""
    }
    total.value = response.total
  })
}

function allowDrop(draggingNode, dropNode, type) {
  return type !== 'inner'
}

function allowDrag(draggingNode) {
  return draggingNode.data.chapterId !== -1
}

function append(subjectTitle, chapterId) {
  const newChild = {key: key.value++, label: subjectTitle, chapterId: chapterId}
  data.value.push(newChild)
}

function remove(node, data) {
  if (data.chapterId !== 0) {
    dataDel.value.push(data)
  }
  const parent = node.parent
  const children = parent.data.children || parent.data
  const index = children.findIndex((d) => d.key === data.key)
  children.splice(index, 1)
  this.data = [...this.data]
}

function nodeClick(data) {
  if (!editable.value && !editableContent.value) {
    subjectChapterId.value = data.chapterId
    queryParams.value.pageNum = 1
    subjectTitle.value = data.label
    if (data.chapterId === -1) {
      total.value = 0
      subjectContent.value = subjectDescription.value
    } else {
      queryParams.value.chapterId = data.chapterId
      getContent()
    }
  }
}

function addToLearningList() {
  if (!isInLearningList.value) {
    addLearningList({subjectId: subjectId.value}).then(() => {
      proxy.$modal.msgSuccess("加入学习成功");
      isInLearningList.value = !isInLearningList.value
    })
  } else {
    deleteLearningList(subjectId.value).then(() => {
      proxy.$modal.msgSuccess("取消学习成功");
      isInLearningList.value = !isInLearningList.value
    })
  }
}

function doneLearning() {
  if (learningStatus.value === 0) {
    updateLearningList({subjectId: subjectId.value, status: 1}).then(() => {
      proxy.$modal.msgSuccess("已完成学习");
      learningStatus.value = 1
    })
  } else {
    updateLearningList({subjectId: subjectId.value, status: 0}).then(() => {
      proxy.$modal.msgSuccess("取消完成学习");
      learningStatus.value = 0
    })
  }
}

function saveProgress() {
  updateLearningList({
    subjectId: subjectId.value,
    chapterOrder: data.value.findIndex(item => item.chapterId === subjectChapterId.value)
  }).then(() => {
    proxy.$modal.msgSuccess("保存进度成功");
  })
}

function editIndex() {
  if (editable.value) {
    const combine = []
    dataDel.value.map((item) => {
      if (item.chapterId !== 0) {
        combine.push(deleteSubjectChapter(item.chapterId, subjectId.value))
      }
    })
    data.value.map((item, index) => {
      if (item.chapterId === -1) {
        let req = {}
        req.subjectId = subjectId.value
        req.subjectTitle = item.label
        combine.push(updateSubject(req))
      } else {
        let req = {
          chapterId: item.chapterId,
          subjectId: subjectId.value,
          chapterTitle: item.label,
          chapterOrder: index
        }
        if (item.chapterId === 0) {
          combine.push(addSubjectChapter(req))
        } else {
          combine.push(updateSubjectChapter(req))
        }
      }
    })
    Promise.all(combine).then(() => {
      dataDel.value = []
      editable.value = !editable.value
      proxy.$modal.msgSuccess("目录编辑成功");
      getChapter()
    })
  } else {
    editable.value = !editable.value
  }
}

function editContent() {
  if (editableContent.value) {
    if (subjectChapterId.value === -1) {
      let req = {
        subjectId: subjectId.value,
        subjectDescription: subjectDescription.value
      }
      updateSubject(req).then(() => {
        proxy.$modal.msgSuccess("内容编辑成功");
        subjectContent.value = subjectDescription.value
        editableContent.value = !editableContent.value
      })
    } else {
      let req = {
        contentId: subjectContentId.value,
        content: subjectContent.value
      }
      updateSubjectContent(req).then(() => {
        proxy.$modal.msgSuccess("内容编辑成功");
        editableContent.value = !editableContent.value
      })
    }
  } else {
    editableContent.value = !editableContent.value

  }
}

function pressSubject() {
  let req = {
    subjectId: subjectId.value,
    status: 1
  }
  updateSubject(req).then(() => {
    subjectStatus.value = 1
    proxy.$modal.msgSuccess("发布成功");
  })
}

function unPressSubject() {
  let req = {
    subjectId: subjectId.value,
    status: 0
  }
  updateSubject(req).then(() => {
    subjectStatus.value = 0
    proxy.$modal.msgSuccess("取消发布成功");
  })
}

function delSubject() {
  deleteSubject(subjectId.value).then(() => {
    proxy.$modal.msgSuccess("删除成功");
    router.push('/')
  })
}

function getChapter() {
  data.value = []
  const query = {subjectId: subjectId.value}
  append(subjectTitle.value, -1)
  getSubjectChapter(query).then(response => {
    const res = response.data
    res.map(item => {
      append(item.chapterTitle, item.chapterId)
    })
  })
}

(() => {
  subjectId.value = route.params && route.params.subjectId;
  queryParams.value.subjectId = subjectId.value;

  getSubject(subjectId.value).then(response => {
    const res = response.data
    subjectTitle.value = res.subjectTitle
    useSettingsStore().setTitle(res.subjectTitle)
    subjectDescription.value = res.subjectDescription == null ? "" : res.subjectDescription
    subjectStatus.value = res.status
    subjectContent.value = subjectDescription.value
    createTime.value = res.createTime
    updateTime.value = res.updateTime == null ? res.createTime : res.updateTime
    getChapter()

    getLearningList({subjectId: subjectId.value}).then(response => {
      isInLearningList.value = response.total > 0
      if (response.total > 0) {
        learningStatus.value = response.rows[0].status
      }
    })

    getUserName(res.createBy).then(response => {
      author.value = response.userName
    })

    getUserProfile().then(response => {
      owner.value = response.data.userId.toString() === res.createBy
    })

    if (subjectStatus.value) {
      join()
    }
  })
})();
</script>

<style scoped lang="scss">
.app-container {
  padding-left: 0;
  padding-right: 0;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  padding-right: 8px;
  width: 100%;

  > span {
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.append {
  text-align: center;

  .el-button {
    font-size: 18px;
    color: #337ab7;
  }
}

.right-side {
  text-align: left;

  .el-button {
    margin-top: 15px;
    font-size: 22px;
    color: #337ab7;
  }
}

.main {
  padding-top: 0;

  :deep(img) {
    max-width: 100%;
  }
}

.pagi {
  display: flex;
  justify-content: center;
}

.el-aside {
  background-color: #FFFFFF;
}

.communicate {
  :deep(.el-card__header) {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    min-height: 0;
  }

  :deep(.el-card__body) {
    padding: 0 !important;
  }

  .body {

    .el-main {
      padding: 0;
      height: 200px;
    }

    .el-footer {
      padding: 0;
      height: auto;
      line-height: normal;

      .el-button {
        width: 100%;
        margin: 0;
        padding-left: 0;
        padding-right: 0;
      }

      .el-form-item {
        margin: 0;
      }
    }

    span {
      white-space: pre-wrap;
      overflow-wrap: break-word;
    }
  ;
  }
}


.title {
  text-align: center;
  font-size: 25px;
}


.author, .dateTime {
  text-align: center;
  font-size: 15px;
}

</style>