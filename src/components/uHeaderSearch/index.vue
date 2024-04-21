<template>
  <div class="header-search">
    <el-input v-model="search" @keyup.enter="querySearch" class="header-search-select" placeholder="搜索"/>
    <span class="search-icon" @click="querySearch">
        <svg-icon icon-class="search"/>搜索
    </span>
  </div>
</template>

<script setup>
import {useRouter} from "vue-router";
import {parseStrEmpty} from "@/utils/slp.js";

const router = useRouter()

const search = ref('');
const options = ref([]);
const query = ref({})

function querySearch() {
  if (parseStrEmpty(search.value) !== "") {
    query.value.subjectTitle = search.value
    query.value.time = new Date().getTime()
  }
  router.push({path: "/search", query: query.value})
}
</script>

<style lang='scss' scoped>
.header-search {
  font-size: 0 !important;

  .search-icon {
    cursor: pointer;
    font-size: 18px;
    vertical-align: middle;
  }

  .header-search-select {
    font-size: 18px;
    //transition: width 0.2s;
    width: 0;
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


  .header-search-select {
    width: 310px;
    margin-right: 10px;
  }

}
</style>