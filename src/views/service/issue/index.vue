<template>
  <meta name="referrer" content="no-referrer">
  <uNavbar/>

  <div class="app-container">
    <div>
      <el-row>
        <el-col :span="4" style="width: 274px">
          <el-card class="user-info" shadow="never" style="height: 274px; border-right: 0;border-radius: 0" :body-style="{'padding-top': '5px !important', 'padding-bottom': '0 !important'}">
            <template v-slot:header>
              <div class="clearfix">
                <svg-icon icon-class="user"/>
                发布者
                <span class="pull-right">{{ issueCreateBy.nickName }}</span>
              </div>
            </template>
            <div>
              <div class="text-center">
                <img :src="issueCreateBy.avatar" class="img-circle" alt=""/>
              </div>
              <ul class="list-group">
                <li class="list-group-item">
                  <svg-icon icon-class="email"/>
                  用户邮箱
                  <div class="pull-right">{{ issueCreateBy.email }}</div>
                </li>
                <li class="list-group-item">
                  <svg-icon icon-class="date"/>
                  注册日期
                  <div class="pull-right">{{parseTime(issueCreateBy.createTime, '{y}年{m}月{d}日')}}</div>
                </li>
              </ul>
            </div>
          </el-card>
        </el-col>
        <el-col :span="20">
          <el-card class="issue-card" shadow="never"
                   :body-style="{'padding-top': '0 !important', 'padding-bottom': '0 !important'}"
                   style="border-radius: 0">
            <template v-slot:header>
              <div class="clearfix">
                <span>{{ issue.issueTitle }}</span>
              </div>
              <div class="subTitle">
                <el-space>
                  <span>发布时间：{{ parseTime(issue.createTime, '{y}年{m}月{d}日 {h}:{i}') }}</span>
                  <el-popconfirm
                      title="确定要删除该问题吗？"
                      iconColor="red"
                      @confirm="delIssue(issue.issueId)"
                      v-if="useUserStore().id === issueCreateBy.userId || auth.hasPermi('system:issue:remove')"
                  >
                    <template #reference>
                      <el-button class="delete" plain type="text">删除</el-button>
                    </template>
                  </el-popconfirm>
                </el-space>
              </div>
            </template>
            <div class="content">
              <div class="ql-container ql-snow">
                <div class="ql-editor" v-html="issue.issueContent"></div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-divider/>

    <div class="content-list">
      <el-row v-for="(item, index) in replyList" :key="index">
        <el-col :span="4" style="width: 274px">
          <el-card class="user-info" shadow="never" style="height: 274px; border-right: 0;border-radius: 0" :body-style="{'padding-top': '5px !important', 'padding-bottom': '0 !important'}">
            <template v-slot:header>
              <div class="clearfix">
                <svg-icon icon-class="user"/>
                用户昵称
                <span class="pull-right">{{ item.createBy.nickName }}</span>
              </div>
            </template>
            <div>
              <div class="text-center">
                <img :src="item.createBy.avatar" class="img-circle" alt=""/>
              </div>
              <ul class="list-group">
                <li class="list-group-item">
                  <svg-icon icon-class="email"/>
                  用户邮箱
                  <div class="pull-right">{{ item.createBy.email }}</div>
                </li>
                <li class="list-group-item">
                  <svg-icon icon-class="date"/>
                  注册日期
                  <div class="pull-right">{{parseTime(item.createBy.createTime, '{y}年{m}月{d}日')}}</div>
                </li>
              </ul>
            </div>
          </el-card>
        </el-col>
        <el-col :span="20">
          <el-card class="content-card" shadow="never"
                   :body-style="{'padding-top': '0 !important', 'padding-bottom': '0 !important'}"
                   style="border-radius: 0">
            <div class="content">
              <div class="subTitle">
                <el-space>
              <span>回复时间：{{ parseTime(item.reply.createTime, '{y}年{m}月{d}日 {h}:{i}') }}</span>
                <el-popconfirm
                    title="确定要删除该回复吗？"
                    iconColor="red"
                    @confirm="delIssueReply(item.reply.replyId)"
                    v-if="useUserStore().id === item.createBy.userId || auth.hasPermi('system:issueReply:remove')"
                >
                  <template #reference>
                    <el-button class="delete" plain type="text">删除</el-button>
                  </template>
                </el-popconfirm>
                  </el-space>
              </div>
              <div class="ql-container ql-snow">
                <div class="ql-editor" v-html="item.reply.replyContent"></div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-backtop></el-backtop>
    </div>
  </div>

  <div class="pd">
    <pagination class="pagi"
                v-show="total > 0"
                :total="total"
                v-model:page="queryParams.pageNum"
                v-model:limit="queryParams.pageSize"
                @pagination="getList"
                :pc="false"
    />
  </div>

  <el-divider/>

  <h2 class="pd" style="text-align: center">回复</h2>

  <div class="submitReply">
    <el-form ref="replyRef" :model="form" :rules="rules">
      <el-row>
        <el-col>
          <el-form-item label="内容" prop="replyContent">
            <editor v-model="form.replyContent" :height="300"/>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div style="text-align: right">
      <el-button type="primary" @click="submitForm">发 布</el-button>
      <el-button @click="reset">清 除</el-button>
    </div>
  </div>
</template>

<script setup>

import uNavbar from "@/layout/components/uNavbar.vue";
import Pagination from "@/components/Pagination/index.vue";
import {parseTime} from "@/utils/slp.js";
import {getUserPublicInfo} from "@/api/system/user.js";
import {
  addIssueReply,
  deleteIssue,
  deleteIssueReply,
  getIssue,
  listIssueReply
} from "@/api/slp/issue.js";
import {useRoute, useRouter} from "vue-router";
import defAva from "@/assets/images/profile.png";
import useUserStore from "@/store/modules/user.js";
import useSettingsStore from "@/store/modules/settings.js";
import auth from "@/plugins/auth.js";

const {proxy} = getCurrentInstance();
const route = useRoute();
const router = useRouter();

const data = reactive({
  form: {},
  rules: {
    replyContent: [{required: true, message: "内容不能为空", trigger: "blur"}, {
      validator: (rules, value, callback) => {
        if (value === "<p><br></p>") {
          callback(new Error('内容不能为空'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }]
  },
  issue: {},
  issueCreateBy: {}
});
const {form, rules, issue, issueCreateBy} = toRefs(data);

const queryParams = ref({
  pageNum: 1,
  pageSize: 10
})

const replyList = ref([]);
const total = ref(0);

function delIssue(issueId) {
  deleteIssue(issueId).then(() => {
    router.push({path: '/issue/mine'})
    proxy.$modal.msgSuccess("删除成功");
  })
}

function delIssueReply(replyId) {
  deleteIssueReply(replyId).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功");
  })
}

function reset() {
  form.value = {
    replyContent: "<br>",
  };
  proxy.resetForm("replyRef");
}

function submitForm() {
  proxy.$refs["replyRef"].validate(valid => {
    if (valid) {
      form.value.issueId = route.params && route.params.issueId;
      addIssueReply(form.value).then(() => {
        reset();
        getList();
        proxy.$modal.msgSuccess("回复成功");
      });
    }
  });
}

function getList() {
  queryParams.value.issueId = route.params && route.params.issueId;
  listIssueReply(queryParams.value).then(response => {
    const combine =[];
    let replies = response.rows;
    let pairs = [];
    total.value = response.total;
    replies.map(item => {
      combine.push(getUserPublicInfo(item.createBy).then(response => {
        let creator = response.data
        creator.avatar = getAvatar(creator.avatar)
        pairs.push({createBy: creator,reply: item})
      }))
    })

    Promise.all(combine).then(() => {
      replyList.value = pairs
    })
  })
}

function getMainIssue() {
  queryParams.value.issueId = route.params && route.params.issueId;
  getIssue(queryParams.value.issueId).then(response => {
    issue.value = response.data;
    useSettingsStore().setTitle(issue.value.issueTitle)
    getUserPublicInfo(issue.value.createBy).then(response => {
      issueCreateBy.value = response.data
      issueCreateBy.value.avatar = getAvatar(issueCreateBy.value.avatar)
    })
  })
}

function getAvatar(avatar) {
  return avatar === "" || avatar == null ? defAva : import.meta.env.VITE_APP_BASE_API + avatar
}

getMainIssue()
getList()
</script>

<style scoped lang="scss">

.pd {
  padding-left: 15%;
  padding-right: 15%;

  > .editor {
    padding-left: 20%;
    padding-right: 20%;
  }
}

.app-container {
  padding-top: 0;
  .el-row {
    margin-bottom: 20px;
    padding-left: 6%;
    padding-right: 6%;

    &:first-child {
      margin-top: 20px;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  .list-group {
    margin: 0;

    .list-group-item {
      border-bottom: 0;
    }
  }

  .img-circle {
    width: 128px;
    height: 128px;
  }
}

.pagi {
  display: flex;
  justify-content: center;
  padding-bottom: 20px;
}

.delete {
  color: #FF0000;
  margin: 0 ;
  padding: 0 ;
  border: 0 ;
  height: auto;
}

.issue-card {
  background: #fff8e7;
  :deep(.el-card__header) {
    min-height: 70px;
  }

  .clearfix {
    margin-left: 20px;
    font-size: 25px;
  }

  .content {
    min-height: 202px;
    word-break: normal;
    word-wrap: break-word;
    white-space: pre-wrap;
  }

  .subTitle {
    text-align: right;
    font-size: 13px;
    white-space: nowrap;
  }
}

.content-card {
  background: #fff8e7;
  .content {
    min-height: 272px;
    word-break: normal;
    word-wrap: break-word;
    white-space: pre-wrap;
  }

  .subTitle {
    text-align: right;
    font-size: 13px;
    white-space: nowrap;
  }
}

.user-info{
  background: #fff6df;
}

.submitReply {
  padding-left: 19%;
  padding-right: 7%;
  padding-bottom: 20px;

  :deep(.el-form-item__content) {
    display: block;
  }
}

.ql-container {
  border: 0;
}


</style>