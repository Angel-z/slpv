<template>
  <uNavbar/>

  <div class="pd">
    <el-tabs v-model="activeName" @tab-click="handleClick" class="nav">
      <el-tab-pane label="加入的群组" name="first"></el-tab-pane>
      <el-tab-pane label="创建的群组" name="second"></el-tab-pane>
    </el-tabs>
  </div>

  <div class="app-container">
    <div class="content-list">
      <el-row v-for="(item, index) in groupList" :key="index">
        <el-col>
          <el-card class="content-card" shadow="never" style="background: #F7F7F7">
            <div class="clearfix">
              <el-row>
                <el-col :span="22">
                  <router-link target="_blank" :to="{path: '/group/' + item.groupId}">
                    <span> {{ item.groupName }}</span>
                  </router-link>
                </el-col>
                <el-col :span="2" style="text-align: right" v-if="activeName === 'first'">
                  <el-popconfirm
                      title="确定要退出该群组吗？"
                      iconColor="red"
                      @confirm="quit(item.groupId)"
                  >
                    <template #reference>
                      <el-button class="out" type="text" style="color: #FF0000">退出</el-button>
                    </template>
                  </el-popconfirm>
                </el-col>
                <el-col :span="2" style="text-align: right" v-if="activeName === 'second'">
                  <el-popconfirm
                      title="确定要解散该群组吗？"
                      iconColor="red"
                      @confirm="disband(item.groupId)"
                  >
                    <template #reference>
                      <el-button class="out" type="text" style="color: #FF0000">解散</el-button>
                    </template>
                  </el-popconfirm>
                </el-col>
              </el-row>
            </div>
            <el-divider style="margin-top: 5px; margin-bottom: 5px"/>
            <div class="subTitle">
              <el-space>
                  <span v-if="activeName === 'first'"> 创建者：{{
                      item.createBy
                    }} </span>
                <span>创建时间：{{ parseTime(item.createTime, '{y}年{m}月{d}日 {h}:{i}') }}</span>
                <dict-tag :options="sys_normal_disable" :value="item.status"/>
                <dict-tag :options="slp_group_type" :value="item.groupType"/>
              </el-space>
            </div>
          </el-card>
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
                @pagination="activeName === 'first' ? getJoinedGroupsList() : getMyGroupsList()"
                :pc="false"
    />
  </div>
</template>

<script setup>

import uNavbar from "@/layout/components/uNavbar.vue";
import Pagination from "@/components/Pagination/index.vue";
import {parseTime} from "@/utils/slp.js";
import {getUserName} from "@/api/system/user.js";
import {deleteGroup, getJoinedGroups, getMyGroups, quitGroup} from "@/api/slp/group.js";
import {getCurrentInstance} from "vue";
const {proxy} = getCurrentInstance()
const {slp_group_type, sys_normal_disable} = proxy.useDict("slp_group_type", "sys_normal_disable");

const queryParams = ref({
  pageNum: 1,
  pageSize: 10
})

const groupList = ref([]);
const total = ref(0);
const activeName = ref('first');

function handleClick(tab, event) {
  switch (tab.paneName) {
    case 'first':
      if (activeName.value !== "first") {
        queryParams.value.pageNum = 1;
        getJoinedGroupsList()
      }
      break;
    case 'second':
      if (activeName.value !== "second") {
        queryParams.value.pageNum = 1;
        getMyGroupsList()
      }
      break;
    default:
      break;
  }
}

function quit(groupId) {
  quitGroup(groupId).then(() => {
    proxy.$modal.msgSuccess("退出成功");
    getJoinedGroupsList()
  })

}

function disband(groupId) {
  deleteGroup(groupId).then(() => {
    proxy.$modal.msgSuccess("解散成功");
    getMyGroupsList()
  })
}

function getJoinedGroupsList() {
  getJoinedGroups(queryParams.value).then(response => {
    groupList.value = response.rows;
    total.value = response.total;
    groupList.value.map(item => {
      getUserName(item.createBy).then(response => {
        item.createBy = response.userName
      })
    })
  })
}

function getMyGroupsList() {
  getMyGroups(queryParams.value).then(response => {
    groupList.value = response.rows;
    total.value = response.total;
  })
}

getJoinedGroupsList()
</script>

<style scoped lang="scss">

.pd {
  padding-left: 15%;
  padding-right: 15%;
}

.nav {
  padding-top: 20px;

  :deep(.el-tabs__nav) {
    float: none;
    justify-content: center;
  }

  :deep(.el-tabs__item) {
    font-size: 20px;
  }
}

.app-container {
  .content-list > .el-row {
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

  .clearfix {
    font-size: 20px;

    span {
      &:hover {
        color: #409EFF;
      }
    }

    .out {
      font-size: 17px;
      margin: 0;
      padding: 0;
      border: 0;
      height: auto;
    }
  }

  .subTitle {
    text-align: right;
    font-size: 15px;
  }

}

</style>