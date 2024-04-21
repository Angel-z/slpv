<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
         <el-form-item label="群组名称" prop="groupName">
            <el-input
               v-model="queryParams.groupName"
               placeholder="请输入群组名称"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
        <el-form-item label="类型" prop="groupType">
          <el-select
              v-model="queryParams.groupType"
              placeholder="群组类型"
              clearable
              style="width: 240px"
          >
            <el-option
                v-for="dict in slp_group_type"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select
              v-model="queryParams.status"
              placeholder="群组状态"
              clearable
              style="width: 240px"
          >
            <el-option
                v-for="dict in sys_normal_disable"
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
               v-hasPermi="['system:group:remove']"
            >删除</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="groupList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="编号" align="center" prop="groupId" width="100" />
         <el-table-column
            label="群组名称"
            align="center"
            prop="groupName"
            :show-overflow-tooltip="true"
         />
         <el-table-column label="群组类型" align="center" prop="groupType" width="100">
            <template #default="scope">
              <dict-tag :options="slp_group_type" :value="scope.row.groupType"/>
            </template>
         </el-table-column>
        <el-table-column label="状态" align="center" key="status">
          <template #default="scope">
            <el-switch
                v-model="scope.row.status"
                :active-value=0
                :inactive-value=1
                @change="handleStatusChange(scope.row)"
            ></el-switch>
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
               <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:group:remove']" >删除</el-button>
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

<script setup name="Group">

import {changeGroupStatus, delGroup, listGroup} from "@/api/system/group.js";

const { proxy } = getCurrentInstance();
const {slp_group_type, sys_normal_disable} = proxy.useDict("slp_group_type", "sys_normal_disable");

const groupList = ref([]);
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
    groupName: undefined,
    groupType: undefined,
    createBy: undefined,
    status: undefined
  }
});

const { queryParams } = toRefs(data);

/** 查询群组列表 */
function getList() {
  loading.value = true;
  listGroup(queryParams.value).then(response => {
    groupList.value = response.rows;
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
  ids.value = selection.map(item => item.groupId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 删除按钮操作 */
function handleDelete(row) {
  const groupIds = row.groupId || ids.value
  proxy.$modal.confirm('是否确认删除群组编号为"' + groupIds + '"的数据项？').then(function() {
    return delGroup(groupIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

function handleStatusChange(row) {
  let text = row.status === 0 ? "启用" : "停用";
  proxy.$modal.confirm('确认要"' + text + '""' + row.groupName + '"群组吗?').then(function () {
    return changeGroupStatus(row.groupId, row.status);
  }).then(() => {
    proxy.$modal.msgSuccess(text + "成功");
  }).catch(function () {
    row.status = row.status === 0 ? 1 : 0;
  });
}

getList();
</script>
