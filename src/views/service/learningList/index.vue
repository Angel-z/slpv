<template>
  <uNavbar/>

  <h1 style="text-align: center">学习中</h1>

  <div class="app-container">
    <div class="content-list">
      <el-row class="pd" v-for="(item, index) in subjectList" :key="index">
        <el-col>
          <router-link target="_blank" :to="{path: '/subject/' + item.subjectId}">
            <el-card class="content-card" shadow="hover" :body-style="{'padding-top': '0 !important'}">
              <template v-slot:header>
                <div class="clearfix">
                  <span v-html="item.subjectTitle"></span>
                </div>
                <div class="subTitle">
                  <el-space>
                  <span> 作者：{{
                      item.createBy
                    }} </span>
                    <span>{{ parseTime(item.createTime, '{y}年{m}月{d}日 {h}:{i}') }}</span>
                    <span>当前进度：{{item.chapterOrder ? '第 ' + item.chapterOrder + ' 章' : '未开始' }}</span>
                    <dict-tag :options="slp_learning_status" :value="item.status"/>
                  </el-space>
                </div>
              </template>
              <div class="content">
                <p>
                  {{ item.subjectDescription }}
                </p>
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
import {getLearningList, getSubject, listSubject} from "@/api/slp/subject.js";
import Pagination from "@/components/Pagination/index.vue";
import {parseTime} from "@/utils/slp.js";
import {getUserName} from "@/api/system/user.js";

const {proxy} = getCurrentInstance();
const {slp_learning_status} = proxy.useDict("slp_learning_status");

const queryParams = ref({
  pageNum: 1,
  pageSize: 10
})

const subjectList = ref([]);
const total = ref(0);

function getList() {
  getLearningList(null).then(response => {
    subjectList.value = response.rows;
    total.value = response.total;
    subjectList.value.map(item => {
      getSubject(item.subjectId).then(response => {
        const res = response.data
        item.subjectTitle = res.subjectTitle
        item.subjectDescription = res.subjectDescription
        item.createTime = res.createTime
        item.createBy = res.createBy
        getUserName(item.createBy).then(response => {
          item.createBy = response.userName
        })
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
  height: 230px;

  .clearfix {
    margin-left: 20px;
    font-size: 25px;

  }

  .content {
    margin-left: 15px;
    word-break: normal;
    word-wrap: break-word;
    white-space: pre-wrap
  }

  .subTitle {
    text-align: right;
    font-size: 15px;
  }

}

</style>