<template>
  <uNavbar :active-index="'1'"/>

  <div class="app-container home">
    <div>
      <el-carousel height="350px" trigger="click" interval="5000">
        <el-carousel-item style="text-align: center;display: grid;align-items: center">
          <div class="c1">
            <h2>自主学习同步交流平台</h2>
          </div>
        </el-carousel-item>
        <el-carousel-item style="text-align: center;display: grid;align-items: center">
          <div class="c2">
            <h2>自主学习同步交流平台</h2>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <el-divider style="margin-top: 0"/>

    <div class="pd">
      <el-row :gutter="50">
        <el-col :xs="24" :sm="24" :md="9" :lg="9">
          <el-card class="update-log" shadow="never">
            <template v-slot:header>
              <div class="clearfix">
                <span>官网</span>
              </div>
            </template>
            <div class="body">
              <p>
                <el-icon size="24" style="margin-right: 10px">
                  <promotion />
                </el-icon>
                <el-link
                    href="https://slp.kanofans.org"
                    target="_blank"
                >https://slp.kanofans.org
                </el-link
                >
              </p>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="24" :md="15" :lg="15">
          <el-card class="update-log" shadow="never">
            <el-table v-loading="loading" :data="noticeList" @row-click="showDetail">
              <el-table-column
                  label="公告"
                  align="left"
                  prop="noticeTitle"
                  :show-overflow-tooltip="true"
              >
                <template #default="scope">
                  <span>{{ scope.row.noticeTitle }}</span>
                </template>
              </el-table-column>
              <el-table-column label="公告类型" align="center" prop="noticeType" width="100">
                <template #default="scope">
                  <dict-tag :options="sys_notice_type" :value="scope.row.noticeType"/>
                </template>
              </el-table-column>
              <el-table-column label="创建时间" align="center" prop="createTime" width="100">
                <template #default="scope">
                  <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
                </template>
              </el-table-column>
            </el-table>

            <pagination
                v-show="total > 0"
                :total="total"
                v-model:page="queryParams.pageNum"
                v-model:limit="queryParams.pageSize"
                @pagination="getList"
                :layout="'total, prev, pager, next, jumper'"
            />

            <el-dialog :title="title" v-model="open" width="780px" append-to-body>
              <el-form ref="noticeRef" :model="form" :disabled="true" label-width="80px">
                <el-row>
                  <el-col :span="12">
                    <el-form-item label="公告标题" prop="noticeTitle">
                      <el-text>{{ form.noticeTitle }}</el-text>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="公告类型" prop="noticeType">
                      <dict-tag :options="sys_notice_type" :value="form.noticeType"/>
                    </el-form-item>
                  </el-col>
                  <el-divider style="margin: 0"/>
                  <el-col :span="24">
                    <el-form-item>
                      <div v-html="form.noticeContent"/>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
              <template #footer>
                <div class="dialog-footer">
                  <el-button @click="cancel">关 闭</el-button>
                </div>
              </template>
            </el-dialog>

          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-divider/>

    <div class="recent-content pd">
      <h2 class="title">
        <span>最新内容</span>
      </h2>

      <div class="content-list">
        <el-row :gutter="20">
          <el-col :xs="22" :sm="22" :md="10" :lg="6" v-for="(item, index) in subjectList" :key="index">
            <router-link target="_blank" :to="`/subject/${item.subjectId}`">
              <el-card class="content-card" shadow="hover"
                       :body-style="{'padding-top': '0 !important', 'padding-bottom': '0 !important'}">
                <template v-slot:header>
                  <div class="clearfix">
                    <el-tooltip :content="item.subjectTitle" effect="light" placement="top-start">
                    <span>{{ item.subjectTitle }}</span>
                    </el-tooltip>
                  </div>
                  <div class="subTitle">
                    <el-space>
                  <span>作者：{{
                      item.createBy
                    }} </span>
                      <span>{{ parseTime(item.createTime, '{y}年{m}月{d}日 {h}:{i}') }}</span>
                    </el-space>
                  </div>
                </template>
                <div class="body">
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

  </div>
</template>

<script setup name="Index">
import uNavbar from "@/layout/components/uNavbar.vue";
import {listNotice, getNotice} from "@/api/system/notice.js";
import {listSubject} from "@/api/slp/subject.js";
import {parseTime} from "../utils/slp.js";
import {getUserName} from "@/api/system/user.js";
import {Promotion} from "@element-plus/icons-vue";

const {proxy} = getCurrentInstance();
const {sys_notice_type} = proxy.useDict("sys_notice_type");
const open = ref(false);
const noticeList = ref([]);
const loading = ref(true);
const total = ref(0);
const title = ref("");
const subjectList = ref([])

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 5,
    noticeTitle: undefined,
    createBy: undefined,
    status: undefined
  }
});

const {queryParams, form} = toRefs(data);

/** 查询公告列表 */
function getList() {
  loading.value = true;
  listNotice(queryParams.value).then(response => {
    noticeList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

function getSubject() {
  listSubject({
    pageNum: 1,
    pageSize: 8
  }).then(response => {
    subjectList.value = response.rows;
    subjectList.value.map(item => {
      getUserName(item.createBy).then(response => {
        item.createBy = response.userName
      })
    })
  })
}

/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}

/** 表单重置 */
function reset() {
  form.value = {
    noticeId: undefined,
    noticeTitle: undefined,
    noticeType: undefined,
    noticeContent: undefined,
    status: "0"
  };
  proxy.resetForm("noticeRef");
}

/**修改按钮操作 */
function showDetail(row) {
  reset();
  const noticeId = row.noticeId;
  getNotice(noticeId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "公告详情";
  });
}

getList();
getSubject();
</script>

<style scoped lang="scss">
.pd {
  padding-left: 15%;
  padding-right: 15%;
}

.app-container {
  padding-left: 0;
  padding-right: 0;
  padding-top: 0;

  .c1 {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    background-image: url("../assets/images/carousel1.png");
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-position: center;
  }

  .c2 {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    background-image: url("../assets/images/carousel2.png");
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-position: center;
  }

  .el-carousel__item {
    font-size: 14px;
    opacity: 0.75;
    line-height: 150px;
    margin: 0;

    h2 {
      font-size: 50px;
      color: #FFFFFF;
    }
  }
}

.home {
  background: #F6FAFF;

  .col-item {
    margin-bottom: 20px;
  }

  font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 13px;
  color: #676a6c;
  overflow-x: hidden;

  ul {
    list-style-type: none;
  }

  h4 {
    margin-top: 0px;
  }

  h2 {
    margin-top: 10px;
    font-size: 26px;
    font-weight: 100;
  }

  p {
    margin-top: 10px;

  }

  .update-log {
    ol {
      display: block;
      list-style-type: decimal;
      margin-block-start: 1em;
      margin-block-end: 1em;
      margin-inline-start: 0;
      margin-inline-end: 0;
      padding-inline-start: 40px;
    }

    .body {
      p {
        display: flex;
        align-items: center;
      }
    }
  }
}

.recent-content {
  .title {
    text-align: center;
    color: #1A1A1A;
  }

}

.content-card {
  cursor: pointer;
  margin-top: 10px;
  margin-bottom: 10px;
  background: #F7F7F7;

  .clearfix {
    font-size: 18px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .subTitle {
    text-align: right;
    font-size: 13px;
  }

  .body {
    height: 200px;
    word-break: normal;
    word-wrap: break-word;
    white-space: pre-wrap;

  }

}

</style>

