<template>
  <meta name="referrer" content="no-referrer">
  <uNavbar :active-index="'3'"/>

  <h1 style="text-align: center">问题一览</h1>

  <div class="app-container">
    <div class="content-list">
      <el-row v-for="(item, index) in issueList" :key="index">
        <el-col>
          <router-link target="_blank" :to="{path: '/issue/' + item.issueId}">
            <el-card class="content-card" shadow="hover" :body-style="{'padding-top': '0 !important', 'padding-bottom': '0 !important'}">
              <template v-slot:header>
                <div class="clearfix">
                  <span>{{ item.issueTitle }}</span>
                </div>
                <div class="subTitle">
                  <el-space>
                  <span> 发布者：{{
                      item.createBy
                    }} </span>
                    <span>最近更新：{{ parseTime(item.updateTime, '{y}年{m}月{d}日 {h}:{i}') }}</span>
                    <span>关联文章：<el-link :href="`/subject/${item.subjectId}`" target="_blank" style="vertical-align: baseline !important;">{{item.subjectTitle}}</el-link></span>
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
</template>

<script setup>

import uNavbar from "@/layout/components/uNavbar.vue";
import {getSubject} from "@/api/slp/subject.js";
import Pagination from "@/components/Pagination/index.vue";
import {parseTime} from "@/utils/slp.js";
import {getUserName} from "@/api/system/user.js";
import {listIssue} from "@/api/slp/issue.js";

const queryParams = ref({
  pageNum: 1,
  pageSize: 10
})

const issueList = ref([]);
const total = ref(0);

function getList() {
  listIssue(queryParams.value).then(response => {
    issueList.value = response.rows;
    total.value = response.total;
    issueList.value.map(item => {
      getUserName(item.createBy).then(response => {
        item.createBy = response.userName
      })
      getSubject(item.subjectId).then(response => {
        item.subjectTitle = response.data.subjectTitle
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

    > p {
      height: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .subTitle {
    text-align: right;
    font-size: 15px;
    white-space: nowrap;
  }
}

</style>