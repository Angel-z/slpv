<template>
  <uNavbar :active-index="'5'"/>

  <div class="pd">
    <el-tabs v-model="activeName" @tab-click="handleClick" class="nav">
      <el-tab-pane label="收到的消息" name="first"></el-tab-pane>
      <el-tab-pane label="发送的消息" name="second"></el-tab-pane>
    </el-tabs>
  </div>

  <div class="app-container">
    <div class="content-list">
      <h1 style="text-align: center"
          v-if="(activeName === 'first' && receivedMessageList.length === 0) || (activeName === 'second' && sentMessageList.length === 0)">
        无消息</h1>

      <el-row v-for="(item, index) in receivedMessageList" :key="index" v-if="activeName === 'first'">
        <el-col>
          <el-card class="content-card" shadow="never" style="background: #F7F7F7"
                   v-if="item.messageType ===0">
            <div class="clearfix">
              <el-row>
                <el-col :span="20">
                  <span>申请加入群组</span>
                </el-col>
                <el-col :span="4" style="text-align: right">
                  <el-space :size="'large'" style="height: 100%; align-items: end">
                    <el-button class="groupBtn" type="text" @click="accept(item)">同意</el-button>
                    <el-button class="groupBtn" type="text" style="color: #FF0000" @click="reject(item)">拒绝</el-button>
                  </el-space>
                </el-col>
              </el-row>
            </div>
            <el-divider style="margin-top: 5px; margin-bottom: 5px"/>
            <div class="subTitle">
              用户 <span style="color: #409EFF">{{ item.fromUser }}</span> 申请加入群组 <span>{{
                item.groupName
              }}</span>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row v-for="(item, index) in sentMessageList" :key="index" v-if="activeName === 'second'">
        <el-col>
          <el-card class="content-card" shadow="never" style="background: #F7F7F7"
                   v-if="item.messageType ===0">
            <div class="clearfix">
              <el-row>
                <el-col>
                  <span>申请加入群组</span>
                </el-col>
              </el-row>
            </div>
            <el-divider style="margin-top: 5px; margin-bottom: 5px"/>
            <div class="subTitle">
              已申请加入群组 <span>{{ item.groupName }}</span>，组创建者 <span>{{ item.toUser }}</span>
            </div>
          </el-card>
        </el-col>
      </el-row>

    </div>
  </div>

</template>

<script setup>

import uNavbar from "@/layout/components/uNavbar.vue";
import {acceptGroup, getReceivedMessages, getSentMessages, rejectGroup} from "@/api/slp/message.js";
import {getUserName} from "@/api/system/user.js";
import {getGroup} from "@/api/slp/group.js";

const activeName = ref('first');
const sentMessageList = ref([]);
const receivedMessageList = ref([]);

function handleClick(tab, event) {
  switch (tab.paneName) {
    case 'first':
      if (activeName.value !== "first") {
        getReceivedMessagesList()
      }
      break;
    case 'second':
      if (activeName.value !== "second") {
        getSentMessagesList()
      }
      break;
    default:
      break;
  }
}

function getReceivedMessagesList() {
  getReceivedMessages().then(res => {
    receivedMessageList.value = res.data;
    receivedMessageList.value.forEach(item => {
      if (item.messageType === 0) {
        getGroup(item.message).then(res => {
          item.groupName = res.data.groupName
        })
      }
      getUserName(item.fromUserId).then(res => {
        item.fromUser = res.userName
      })
    })
  })
}

function getSentMessagesList() {
  getSentMessages().then(res => {
    sentMessageList.value = res.data;
    sentMessageList.value.forEach(item => {
      if (item.messageType === 0) {
        getGroup(item.message).then(res => {
          item.groupName = res.data.groupName
        })
      }
      getUserName(item.toUserId).then(res => {
        item.toUser = res.userName
      })
    })
  })
}

function accept(message) {
  const data = {
    fromUserId: message.fromUserId,
    toUserId: message.toUserId,
    messageType: message.messageType,
    message: message.message
  }
  if (data.messageType === 0) {
    acceptGroup(data).then(() => {
      getReceivedMessagesList()
    })
  }
}

function reject(message) {
  const data = {
    fromUserId: message.fromUserId,
    toUserId: message.toUserId,
    messageType: message.messageType,
    message: message.message
  }
  if (data.messageType === 0) {
    rejectGroup(data).then(() => {
      getReceivedMessagesList()
    })
  }
}

getReceivedMessagesList()
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

    .groupBtn {
      font-size: 17px;
      margin: 0;
      padding: 0;
      border: 0;
      height: auto;
    }
  }

  .subTitle {
    font-size: 15px;

    span {
      color: #409EFF
    }
  }

}

</style>