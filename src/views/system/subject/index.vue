<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
         <el-form-item label="文章标题" prop="subjectTitle">
            <el-input
               v-model="queryParams.subjectTitle"
               placeholder="请输入文章标题"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select
              v-model="queryParams.status"
              placeholder="发布状态"
              clearable
              style="width: 240px"
          >
            <el-option
                v-for="dict in slp_subject_status"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            />
          </el-select>
        </el-form-item>
         <el-form-item label="创建者" prop="createBy">
            <el-input
               v-model="queryParams.createBy"
               placeholder="请输入创建者"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
         </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="handleDelete"
               v-hasPermi="['system:subject:remove']"
            >删除</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="subjectList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="编号" align="center" prop="subjectId" width="100" />
         <el-table-column
            label="文章标题"
            align="center"
            prop="subjectTitle"
            :show-overflow-tooltip="true"
         />
        <el-table-column
            label="文章简介"
            align="left"
            prop="subjectDescription"
            :show-overflow-tooltip="true"
        />
         <el-table-column label="文章状态" align="center" prop="subjectStatus" width="100">
            <template #default="scope">
              <dict-tag :options="slp_subject_status" :value="scope.row.status"/>
            </template>
         </el-table-column>
         <el-table-column label="创建者" align="center" prop="createBy" width="100" />
         <el-table-column label="创建时间" align="center" prop="createTime" width="100">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
            </template>
         </el-table-column>
         <el-table-column label="操作" align="center" width="100">
            <template #default="scope">
               <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:subject:remove']" >删除</el-button>
            </template>
         </el-table-column>
      </el-table>

      <pagination
         v-show="total > 0"
         :total="total"
         v-model:page="queryParams.pageNum"
         v-model:limit="queryParams.pageSize"
         @pagination="getList"
      />

   </div>
</template>

<script setup name="Subject">
import {delSubject, listSubject} from "@/api/system/subject.js";

const { proxy } = getCurrentInstance();
const {slp_subject_status} = proxy.useDict("slp_subject_status");

const subjectList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    subjectTitle: undefined,
    createBy: undefined,
    status: undefined
  }
});

const { queryParams } = toRefs(data);

/** 查询文章列表 */
function getList() {
  loading.value = true;
  listSubject(queryParams.value).then(response => {
    subjectList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}
/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}
/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.subjectId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 删除按钮操作 */
function handleDelete(row) {
  const subjectIds = row.subjectId || ids.value
  proxy.$modal.confirm('是否确认删除文章编号为"' + subjectIds + '"的数据项？').then(function() {
    return delSubject(subjectIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

getList();
</script>
