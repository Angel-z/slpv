<template>
  <uNavbar/>

  <h1 style="text-align: center">我的文章</h1>
  <div class="app-container">
    <h2 style="text-align: center;" v-if="total===0" >没有发布任何文章</h2>

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
                    <span>{{ parseTime(item.createTime, '{y}年{m}月{d}日 {h}:{i}') }}</span>
                    <dict-tag :options="slp_subject_status" :value="item.status"/>
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
import {getMySubjects} from "@/api/slp/subject.js";
import Pagination from "@/components/Pagination/index.vue";
import {parseTime} from "@/utils/slp.js";

const {proxy} = getCurrentInstance();
const {slp_subject_status} = proxy.useDict("slp_subject_status");

const queryParams = ref({
  pageNum: 1,
  pageSize: 10
})

const subjectList = ref([]);
const total = ref(-1);

function getList() {
  getMySubjects().then(response => {
    subjectList.value = response.rows;
    total.value = response.total;
  })
}

getList()
</script>

<style scoped lang="scss">
[v-cloak] {
  display: none !important;
}

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
    margin-left: 15px;
    word-break: normal;
    word-wrap: break-word;
    white-space: pre-wrap
  }

  .subTitle {
    text-align: right;
    font-size: 15px;
    white-space: nowrap;
  }

}

</style>