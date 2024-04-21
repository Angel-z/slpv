<template>
  <meta name="referrer" content="no-referrer">
  <uNavbar/>

  <div class="app-container pd">
    <el-card>
      <template v-slot:header>
        <div class="clearfix">
          <span>{{ groupName }}</span>
        </div>
      </template>
      <el-container>
        <el-container style="height: 70vh">
          <el-main class="messages">
            <el-scrollbar ref="scrollbar" style="height: 100%">
              <div id="scrollbar">
                <el-space direction="vertical">
                  <el-row v-for="(item, index) in rMsgList" :key="index"
                          :class="item.userId ===useUserStore().id ? 'row-me':false">
                    <el-col style="margin: 0 8px 0 8px" v-if="item.userId !==useUserStore().id">
                      <img :src="`${getAvatar(item.avatar)}`" class="img-circle" alt=""/>
                    </el-col>
                    <el-col :span="18">
                      <div style="height: 100%">
                        <el-row style="margin-bottom: 5px">
                          <el-col :class="item.userId ===useUserStore().id ? 'col-me':false">
                            <span style="font-size: 14px">{{ item.nickName }}</span>
                          </el-col>
                        </el-row>
                        <el-row>
                          <el-col>
                            <el-card class="msgBubble" shadow="never">
                              <span>{{ item.message }}</span>
                            </el-card>
                          </el-col>
                        </el-row>
                      </div>
                    </el-col>
                    <el-col style="margin: 0 8px 0 8px" v-if="item.userId ===useUserStore().id">
                      <img :src="`${getAvatar(item.avatar)}`" class="img-circle" alt=""/>
                    </el-col>
                  </el-row>
                </el-space>
              </div>
            </el-scrollbar>
          </el-main>
          <el-footer class="messageSend">
            <el-row style="height: 80%">
              <el-col>
                <el-input style="height: auto" type="textarea" v-model="newMessage" placeholder="请输入消息内容"
                          resize="none" @keyup.ctrl.enter="sendMessage"></el-input>
              </el-col>
            </el-row>
            <el-row style="height: 20%">
              <el-col style="text-align: right">
                <el-button type="primary" @click="sendMessage">发送</el-button>
              </el-col>
            </el-row>
          </el-footer>
        </el-container>
        <el-aside class="right-side">
          <h3 style="text-align: center; color: #409EFF;" @click="getMembers">{{ memberSwitch ? "所有成员" : "在线成员" }}</h3>
          <div v-if="memberSwitch">
            <el-row v-for="(member, index) in members" :key="index">
              <el-col :span="24">
                {{ member.nickName }}
              </el-col>
            </el-row>
          </div>
          <div v-else>
            <el-row v-for="(member, index) in onlineMembers" :key="index" >
              <el-col :span="24">
                {{ member.nickName }}
              </el-col>
            </el-row>
          </div>
        </el-aside>
      </el-container>
    </el-card>

  </div>
</template>

<script setup>
import uNavbar from "@/layout/components/uNavbar.vue";
import {getToken} from "@/utils/auth.js";
import {useRoute} from "vue-router";
import useUserStore from "@/store/modules/user.js";
import defAva from "@/assets/images/profile.png";
import {getGroup, getGroupMemberList} from "@/api/slp/group.js";
import useSettingsStore from "@/store/modules/settings.js";

const {proxy} = getCurrentInstance();
const route = useRoute()

const groupId = ref("")
const groupName = ref("")
const memberSwitch = ref(false)

const websocket = reactive({
  url: "wss://" + import.meta.env.VITE_APP_DOMAIN + "/websocket/group/",
  rMsgList: [],
  newMessage: "",
  members: [],
  onlineMembers: []
})

let ws = null;

const {url, rMsgList, newMessage, members, onlineMembers} = toRefs(websocket);
const msgCount = ref(-1)

function getGroupInfo() {
  getGroup(groupId.value).then(res => {
    groupName.value = res.data.groupName
    useSettingsStore().setTitle(groupName.value)
  })
}

function getMembers() {
  if (!memberSwitch.value) {
    getGroupMemberList(groupId.value).then(res => {
      members.value = res.data
      memberSwitch.value = true
    })
  } else {
    memberSwitch.value = false
  }
}

function connect() {
  const wsurl = url.value + groupId.value
  ws = new WebSocket(wsurl, [getToken()])

  ws.onopen = function (event) {};
  ws.onmessage = function (event) {
    const json = JSON.parse(event.data)
    if (json.messageType === 0) {
      rMsgList.value.push(json)
      msgCount.value++
      if (proxy.$refs["scrollbar"].wrapRef.scrollTop + proxy.$refs["scrollbar"].wrapRef.clientHeight === proxy.$refs["scrollbar"].wrapRef.scrollHeight) {
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
  if (newMessage.value !== "") {
    if (ws) {
      ws.send(newMessage.value)
      newMessage.value = ""
    } else {
      proxy.$modal.msgWarning("未连接到服务器")
    }
  }
}

function getAvatar(avatar) {
  return avatar === "" || avatar == null ? defAva : import.meta.env.VITE_APP_BASE_API + avatar
}

function scrollToBottom() {
  nextTick(() => {
    proxy.$refs["scrollbar"].setScrollTop(proxy.$refs["scrollbar"].wrapRef.scrollHeight)
    msgCount.value = 0
  });
}

onMounted(() => {
  proxy.$refs["scrollbar"].wrapRef.addEventListener('scroll', () => {
    if (proxy.$refs["scrollbar"].wrapRef.scrollTop + proxy.$refs["scrollbar"].wrapRef.clientHeight === proxy.$refs["scrollbar"].wrapRef.scrollHeight) {
      msgCount.value = 0
    }
  })
})

groupId.value = route.params && route.params.groupId;

getGroupInfo()
connect()
</script>

<style scoped lang="scss">
.pd {
  padding-left: 20%;
  padding-right: 20%;
}

.app-container {
  .clearfix {
    font-size: 20px;
    font-weight: bold;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :deep(.el-card__body) {
    padding: 0 !important;
  }

  .messages {
    height: 70%;
    border-bottom: 1px solid #e4e7ed;
    padding: 0;

    .el-space {
      align-items: normal !important;
      width: 100%;

      :deep(.el-space__item) {
        padding-top: 8px;
        //margin-bottom: 8px;
      }

      .el-row {
        flex-wrap: nowrap;
        overflow-x: hidden;
      }

      .row-me {
        justify-content: right
      }

      .el-col {
        flex: none;
      }

      .col-me {
        flex: auto;
        text-align: right
      }
    }


    .img-circle {
      width: 48px;
      height: 48px;
    }

    .msgBubble {
      word-break: break-all;
      padding: 8px;
      border-radius: 8px;
      background-color: #F0F0F0;
      border: 0;
    }
  }

  .messageSend {
    height: 30%;
    padding: 2% 1% 1% 1%;

    :deep(.el-textarea) {
      height: 100% !important;

      .el-textarea__inner {
        height: 100% !important;
        box-shadow: none !important;
      }
    }
  }

  .right-side {
    border-left: 1px solid #e4e7ed;
    background-color: #FFFFFF;
    width: 20%;
    margin: 0;
  }
}
</style>