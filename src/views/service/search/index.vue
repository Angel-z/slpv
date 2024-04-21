<template>
  <uNavbar :hidden="true"/>

  <h1 style="text-align: center">搜索</h1>
  <el-affix>
    <div class="searchBar pd">
      <div class="header-search">
        <el-input v-model="search" @keyup.enter="querySearch" class="header-search-select"
                  placeholder="输入关键字搜索"/>
        <el-button type="primary" @click="querySearch" class="searchBtn">
          <svg-icon icon-class="search"/>
          搜索
        </el-button>
      </div>
    </div>
  </el-affix>

  <h2 style="text-align: center" v-if="total===0">没有相关内容</h2>

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

import UNavbar from "@/layout/components/uNavbar.vue";
import {useRoute, useRouter} from "vue-router";
import {searchSubject} from "@/api/slp/subject.js";
import Pagination from "@/components/Pagination/index.vue";
import {parseStrEmpty, parseTime} from "@/utils/slp.js";
import {getUserName} from "@/api/system/user.js";

const route = useRoute();
const router = useRouter()

const queryParams = ref({
  pageNum: 1,
  pageSize: 10
})

const subjectList = ref([]);
const total = ref(0);

const search = ref('');
const query = ref({})

function querySearch() {
  if (parseStrEmpty(search.value) !== "") {
    query.value.subjectTitle = search.value
    query.value.time = new Date().getTime()
  }
  router.push({path: "/search", query: query.value})
}

function getList() {
  if (parseStrEmpty(queryParams.value.subjectTitle) !== "") {
    searchSubject(queryParams.value).then(response => {
      subjectList.value = response.rows;
      total.value = response.total;

      subjectList.value.forEach(item => {
        const regExp = new RegExp(queryParams.value.subjectTitle, 'gi')
        const rp = item.subjectTitle
        item.subjectTitle = rp.replace(regExp, '<em style="font-style: normal; color: #fc5531">$&</em>')

        getUserName(item.createBy).then(response => {
          item.createBy = response.userName
        })
      })
    })
  }
}

(() => {
  queryParams.value.subjectTitle = route.query.subjectTitle;
  getList()
})();

watch(route, () => {
  queryParams.value.subjectTitle = route.query.subjectTitle;
  getList()
})

</script>

<style scoped lang="scss">
.searchBar {
  height: auto;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  padding-top: 15px;
  padding-bottom: 15px;

  .header-search {
    text-align: center;
    font-size: 0 !important;

    .searchBtn {
      height: 50px;
      width: 7%;
      margin-left: 10px;
    }

    .search-icon {
      cursor: pointer;
      font-size: 18px;
      vertical-align: middle;
    }

    .header-search-select {
      font-size: 18px;
      width: 60%;
      height: 50px;
      overflow: hidden;
      background: transparent;
      border-radius: 0;
      vertical-align: middle;

      :deep(.el-input__inner) {
        border-radius: 0;
        border: 0;
        padding-left: 0;
        padding-right: 0;
        box-shadow: none !important;
        border-bottom: 1px solid #d9d9d9;
        vertical-align: middle;
      }
    }

  }
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
    max-height: 130px;
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