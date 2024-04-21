<template>
  <div class="navbar" :class="{desktop : isDesktop}">
    <div class="sidebar-logo-container">
      <transition name="sidebarLogoFade">
        <router-link class="sidebar-logo-link" to="/">
          <img :src="logo" class="sidebar-logo"/>
          <h1 class="sidebar-title">{{ title }}</h1>
        </router-link>
      </transition>
    </div>

    <div class="right-menu">
      <template v-if="appStore.device !== 'mobile'">
        <screenfull id="screenfull" class="right-menu-item hover-effect"/>

        <el-tooltip content="布局大小" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect"/>
        </el-tooltip>
      </template>
      <div class="avatar-container">
        <el-dropdown @command="handleCommand" class="right-menu-item hover-effect" trigger="click">
          <div class="avatar-wrapper">
            <img :src="userStore.avatar" class="user-avatar"/>
            <el-icon>
              <caret-bottom/>
            </el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="write">
                <span>写文章</span>
              </el-dropdown-item>
              <el-dropdown-item command="createGroup">
                <span>创建群组</span>
              </el-dropdown-item>
              <router-link to="/subject/learning">
                <el-dropdown-item>学习中</el-dropdown-item>
              </router-link>
              <router-link to="/subject/mine">
                <el-dropdown-item>我的文章</el-dropdown-item>
              </router-link>
              <router-link to="/issue/mine">
                <el-dropdown-item>我的问题</el-dropdown-item>
              </router-link>
              <router-link to="/group/mine">
                <el-dropdown-item>我的群组</el-dropdown-item>
              </router-link>
              <router-link to="/user/profile">
                <el-dropdown-item>个人中心</el-dropdown-item>
              </router-link>
              <el-dropdown-item divided command="logout">
                <span>退出登录</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <div class="center-search" :class="{ 'hidden': hidden }">
      <template v-if="appStore.device !== 'mobile'">
        <uHeaderSearch id="header-search"/>
      </template>
    </div>
  </div>

  <div class="secondNav">
    <el-menu
        :default-active="activeIndex"
        class="menu"
        mode="horizontal"
        @select="handleSelect"
        background-color="#1d7ffd"
        text-color="#fff"
        active-text-color="#00f8ff"
        :class="{desktop : isDesktop}"
    >
      <el-menu-item index="1">首页</el-menu-item>
      <el-menu-item index="2">文章</el-menu-item>
      <el-menu-item index="3">问题</el-menu-item>
      <el-menu-item index="4">群组</el-menu-item>
      <el-menu-item index="5">消息</el-menu-item>
    </el-menu>
  </div>

  <el-dialog :title="'创建文章'" v-model="open" width="780px" append-to-body>
    <el-form ref="subjectRef" :model="form" :rules="rules" label-width="80px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="标题" prop="subjectTitle">
            <el-input v-model="form.subjectTitle" placeholder="请输入标题" maxlength="50" show-word-limit/>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col>
          <el-form-item label="简介" prop="subjectDescription">
            <el-input v-model="form.subjectDescription" type="textarea"
                      :autosize="{ minRows: 6}" placeholder="请输入简介"  maxlength="250" show-word-limit/>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog :title="'创建群组'" v-model="openGroup" width="780px" append-to-body>
    <el-form ref="groupRef" :model="groupForm" :rules="groupRules" label-width="80px">
      <el-row>
        <el-col :span="18">
          <el-form-item label="群组名称" prop="groupName">
            <el-input v-model="groupForm.groupName" placeholder="请输入群组名称" maxlength="16" show-word-limit/>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="群组类型" prop="groupType">
            <el-select v-model="groupForm.groupType" placeholder="请选择">
              <el-option
                  v-for="dict in slp_group_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitGroupForm">确 定</el-button>
        <el-button @click="cancelGroup">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import {ElMessageBox} from 'element-plus'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import uHeaderSearch from '@/components/uHeaderSearch'
import useAppStore from '@/store/modules/app'
import useUserStore from '@/store/modules/user'
import useSettingsStore from '@/store/modules/settings'
import {CaretBottom} from "@element-plus/icons-vue";
import logo from "@/assets/logo/logo.png";
import {useWindowSize} from "@vueuse/core";
import {useRouter} from "vue-router";
import {addSubject} from "@/api/slp/subject.js";
import {addGroup} from "@/api/slp/group.js";

const title = import.meta.env.VITE_APP_TITLE;
const appStore = useAppStore()
const userStore = useUserStore()
const { proxy } = getCurrentInstance();
const {slp_group_type} = proxy.useDict("slp_group_type");
computed(() => useAppStore().device);
useSettingsStore();
const props = defineProps({
  hidden: {
    default: false,
    type: Boolean
  },
  activeIndex: {
    default: '0',
    type: String
  }
})

const data = reactive({
  form: {},
  rules: {
    subjectTitle: [{required: true, message: "标题不能为空", trigger: "blur"}]
  },
  groupForm: {},
  groupRules: {
    groupName: [{required: true, message: "群组名称不能为空", trigger: "blur"}],
    groupType: [{ required: true, message: "公告类型不能为空", trigger: "change" }]
  }
});
const open = ref(false);
const openGroup = ref(false);
const {form, rules, groupForm, groupRules} = toRefs(data);

const router = useRouter()

const {width, height} = useWindowSize();
const WIDTH = 992; // refer to Bootstrap's responsive design

const isDesktop = ref(undefined)

const handleSelect = (key, keyPath) => {
  switch (key) {
    case '1':
      router.push('/');
      break;
    case '2':
      router.push('/subject');
      break;
    case '3':
      router.push('/issue');
      break;
    case '4':
      router.push('/group');
      break;
    case '5':
      router.push('/message');
      break;
    default:
      break;
  }
};

/** 表单重置 */
function reset() {
  form.value = {
    subjectTitle: undefined,
    subjectDescription: undefined,
  };
  proxy.resetForm("subjectRef");
}

function resetGroupForm() {
  groupForm.value = {
    groupName: undefined,
    groupType: undefined
  };
  proxy.resetForm("groupRef");
}

/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}

function cancelGroup() {
  openGroup.value = false;
  resetGroupForm();
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["subjectRef"].validate(valid => {
    if (valid) {
      addSubject(form.value).then(res => {
        open.value = false;
        router.push('/subject/' + res.data)
        proxy.$modal.msgSuccess("创建成功");
      })
    }
  })
}

function submitGroupForm() {
  proxy.$refs["groupRef"].validate(valid => {
    if (valid) {
      addGroup(groupForm.value).then(() => {
        openGroup.value = false;
        proxy.$modal.msgSuccess("创建成功");
      })
    }
  })
}

watchEffect(() => {
  if (width.value - 1 < WIDTH) {
    useAppStore().toggleDevice('mobile')
    isDesktop.value = false
  } else {
    useAppStore().toggleDevice('desktop')
    isDesktop.value = true
  }
})

function handleCommand(command) {
  switch (command) {
    case "logout":
      logout();
      break;
    case "write":
      reset();
      open.value = true;
      break;
    case "createGroup":
      resetGroupForm();
      openGroup.value = true;
      break;
    default:
      break;
  }
}

function logout() {
  ElMessageBox.confirm('确定注销并退出系统吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logOut().then(() => {
      location.href = '/index';
    })
  }).catch(() => {
  });
}

</script>

<style lang='scss' scoped>
.navbar {
  &.desktop {
    padding-left: 15%;
    padding-right: 15%;
  }

  &:not(.desktop) {
    padding-left: 10%
  }

  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .sidebar-logo-container {
    position: relative;
    float: left;
    height: 50px;
    line-height: 50px;
    text-align: center;
    overflow: hidden;

    & .sidebar-logo-link {
      height: 100%;
      width: 100%;

      & .sidebar-logo {
        width: 32px;
        height: 32px;
        vertical-align: middle;
        margin-right: 12px;
      }

      & .sidebar-title {
        display: inline-block;
        margin: 0;
        font-weight: 600;
        line-height: 50px;
        font-size: 14px;
        font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
        vertical-align: middle;
      }
    }

    &.collapse {
      .sidebar-logo {
        margin-right: 0px;
      }
    }
  }

  .topmenu-container {
    position: absolute;
    left: 50px;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .center-search {
    &.hidden {
      display: none;
    }

    display: flex;
    justify-content: center;
    line-height: 50px;
    height: 100%;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;
    display: flex;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      margin-right: 40px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        i {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}

.secondNav {
  .desktop {
    padding-left: 15%;
    padding-right: 15%;
  }
}

</style>
