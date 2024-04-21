<template>
  <meta name="referrer" content="no-referrer">
  <uNavbar/>

  <h1 style="text-align: center">本文问题</h1>

  <div class="app-container">
    <div class="content-list">
      <el-row v-for="(item, index) in issueList" :key="index">
        <el-col>
          <router-link target="_blank" :to="{path: '/issue/' + item.issueId}">
            <el-card class="content-card" shadow="hover"
                     :body-style="{'padding-top': '0 !important', 'padding-bottom': '0 !important'}">
              <template v-slot:header>
                <div class="clearfix">
                  <span>{{ item.issueTitle }}</span>
                </div>
                <div class="subTitle">
                  <el-space>
                  <span> 发布者：{{
                      item.createBy
                    }} </span>
                    <span>发布日期：{{ parseTime(item.createTime, '{y}年{m}月{d}日 {h}:{i}') }}</span>
                    <span>最近更新：{{ parseTime(item.updateTime, '{y}年{m}月{d}日 {h}:{i}') }}</span>
                  </el-space>
                </div>
              </template>
              <div class="content">
                <div class="ql-container ql-snow" style="border: 0">
                  <div class="ql-editor" v-html="item.issueContent"></div>
                </div>
              </div>
            </el-card>
          </router-link>
        </el-col>
      </el-row>
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

  <h2 class="pd" style="text-align: center">发布问题</h2>

  <div class="submitReply">
    <el-form ref="issueRef" :model="form" :rules="rules">
      <el-row>
        <el-col>
          <el-form-item label="标题" prop="issueTitle">
            <el-input v-model="form.issueTitle" placeholder="请输入标题" maxlength="50" show-word-limit/>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col>
          <el-form-item label="内容" prop="issueContent">
            <editor v-model="form.issueContent" :height="300"/>
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
import {getUserName} from "@/api/system/user.js";
import {addIssue, listIssue} from "@/api/slp/issue.js";
import {useRoute} from "vue-router";

const { proxy } = getCurrentInstance();
const route = useRoute();

const data = reactive({
  form: {},
  rules: {
    issueTitle: [{required: true, message: "标题不能为空", trigger: "blur"}],
    issueContent: [{required: true, message: "内容不能为空", trigger: "blur"},{
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
});
const {form, rules} = toRefs(data);

const queryParams = ref({
  pageNum: 1,
  pageSize: 10
})

const issueList = ref([]);
const total = ref(0);

function reset() {
  form.value = {
    issueTitle: undefined,
    issueContent: "<br>",
  };
  proxy.resetForm("issueRef");
}

function submitForm() {
  proxy.$refs["issueRef"].validate(valid => {
    if (valid) {
      form.value.subjectId = route.params && route.params.subjectId;
      addIssue(form.value).then(() => {
        reset();
        getList();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
        proxy.$modal.msgSuccess("发布成功");
      });
    }
  });
}

function getList() {
  queryParams.value.subjectId = route.params && route.params.subjectId;
  listIssue(queryParams.value).then(response => {
    issueList.value = response.rows;
    total.value = response.total;
    issueList.value.map(item => {
      getUserName(item.createBy).then(response => {
        item.createBy = response.userName
      })
    })
  })
}

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
  .el-row {
    margin-bottom: 20px;
    padding-left: 20%;
    padding-right: 20%;

    &:first-child {
      margin-top: 20px;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.pagi {
  display: flex;
  justify-content: center;
  padding-bottom: 20px;
}

.content-card {
  cursor: pointer;

  .clearfix {
    margin-left: 20px;
    font-size: 25px;

  }

  .content {
    max-height: 200px;
    word-break: normal;
    word-wrap: break-word;
    white-space: pre-wrap;
    overflow-y: auto;
  }

  .subTitle {
    text-align: right;
    font-size: 15px;
    white-space: nowrap;
  }
}

.submitReply {
  padding-left: 19%;
  padding-right: 21%;
  padding-bottom: 20px;

  :deep(.el-form-item__content) {
    display: block;
  }
}


</style>