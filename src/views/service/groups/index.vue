<template>
  <uNavbar :active-index="'4'"/>

  <h1 style="text-align: center">加入群组</h1>

  <div class="pd" style="text-align: center">
    <el-space>
      <el-input placeholder="群组ID" v-model="groupId" @input="(v)=>(groupId=v.replace(/\D/g,''))"></el-input>
      <el-button type="primary" @click="apply">申请加入</el-button>
    </el-space>
  </div>

  <h1 style="text-align: center; margin-bottom: 0">公共群组</h1>

  <div class="app-container">
    <div class="content-list">
      <el-row v-for="(item, index) in groupList" :key="index">
        <el-col>
          <el-card class="content-card" shadow="never" style="background: #F7F7F7">
            <div class="clearfix">
              <el-row>
                <el-col :span="22">
                  <span> {{ item.groupName }}</span>
                </el-col>
                <el-col :span="2" style="text-align: right">
                  <el-button class="join" type="text" @click="join(item.groupId)">加入</el-button>
                </el-col>
              </el-row>
            </div>
            <el-divider style="margin-top: 5px; margin-bottom: 5px"/>
            <div class="subTitle">
              <el-space>
                  <span> 创建者：{{
                      item.createBy
                    }} </span>
                <span>创建时间：{{ parseTime(item.createTime, '{y}年{m}月{d}日 {h}:{i}') }}</span>
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
                @pagination="getList"
                :pc="false"
    />
  </div>
</template>

<script setup>

import uNavbar from "@/layout/components/uNavbar.vue";
import Pagination from "@/components/Pagination/index.vue";
import {parseTime} from "@/utils/slp.js";
import {getUserName} from "@/api/system/user.js";
import {joinGroup, listGroup} from "@/api/slp/group.js";
import {useRouter} from "vue-router";
import {getCurrentInstance} from "vue";
import {applyGroup} from "@/api/slp/message.js";

const router = useRouter();
const {proxy} = getCurrentInstance()

const queryParams = ref({
  pageNum: 1,
  pageSize: 10
})

const groupId = ref("");
const groupList = ref([]);
const total = ref(0);

function apply() {
  applyGroup(groupId.value).then(() => {
    groupId.value = "";
    proxy.$modal.msgSuccess("申请成功");
  })
}

function join(groupId) {
  joinGroup(groupId).then(() => {
    proxy.$modal.msgSuccess("加入成功");
    window.open(router.resolve('/group/' + groupId).href, '_blank')
  })
}

function getList() {
  listGroup(queryParams.value).then(response => {
    groupList.value = response.rows;
    total.value = response.total;
    groupList.value.map(item => {
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

    .join {
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