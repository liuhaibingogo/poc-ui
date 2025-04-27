<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="STATUS" prop="STATUS">
        <el-select v-model="queryParams.STATUS" placeholder="请选择STATUS" clearable>
          <el-option
            v-for="dict in buy_list_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['system:buyList:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:buyList:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:buyList:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['system:buyList:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="buyListList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="ID" />
      <el-table-column label="assetType" align="center" prop="assetType" />
      <el-table-column label="productCode" align="center" prop="productCode" />
      <el-table-column label="MAKER" align="center" prop="MAKER" />
      <el-table-column label="modDatetime" align="center" prop="modDatetime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.modDatetime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="CHECKER" align="center" prop="CHECKER" />
      <el-table-column label="chckerDatetime" align="center" prop="chckerDatetime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.chckerDatetime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="STATUS" align="center" prop="STATUS">
        <template #default="scope">
          <dict-tag :options="buy_list_status" :value="scope.row.STATUS"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:buyList:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:buyList:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改采购清单对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="buyListRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="assetType" prop="assetType">
          <el-input v-model="form.assetType" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="productCode" prop="productCode">
          <el-input v-model="form.productCode" placeholder="请输入productCode" />
        </el-form-item>
        <el-form-item label="MAKER" prop="MAKER">
          <el-input v-model="form.MAKER" placeholder="请选择MAKER" />
        </el-form-item>
        <el-form-item label="modDatetime" prop="modDatetime">
          <el-date-picker clearable
            v-model="form.modDatetime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择modDatetime">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="CHECKER" prop="CHECKER">
          <el-input v-model="form.CHECKER" placeholder="请输入CHECKER" />
        </el-form-item>
        <el-form-item label="chckerDatetime" prop="chckerDatetime">
          <el-date-picker clearable
            v-model="form.chckerDatetime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择chckerDatetime">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="STATUS" prop="STATUS">
          <el-radio-group v-model="form.STATUS">
            <el-radio
              v-for="dict in buy_list_status"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="BuyList">
import { listBuyList, getBuyList, delBuyList, addBuyList, updateBuyList } from "@/api/system/buyList";

const { proxy } = getCurrentInstance();
const { buy_list_status } = proxy.useDict('buy_list_status');

const buyListList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    STATUS: null
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询采购清单列表 */
function getList() {
  loading.value = true;
  listBuyList(queryParams.value).then(response => {
    buyListList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    ID: null,
    assetType: null,
    productCode: null,
    MAKER: null,
    modDatetime: null,
    CHECKER: null,
    chckerDatetime: null,
    STATUS: null
  };
  proxy.resetForm("buyListRef");
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

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.ID);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加采购清单";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _ID = row.ID || ids.value
  getBuyList(_ID).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改采购清单";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["buyListRef"].validate(valid => {
    if (valid) {
      if (form.value.ID != null) {
        updateBuyList(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addBuyList(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _IDs = row.ID || ids.value;
  proxy.$modal.confirm('是否确认删除采购清单编号为"' + _IDs + '"的数据项？').then(function() {
    return delBuyList(_IDs);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/*** 用户导入参数 */
const upload = reactive({
  // 是否显示弹出层（用户导入）
  open: false,
  // 弹出层标题（用户导入）
  title: "",
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的用户数据
  updateSupport: 0,
  // 设置上传的请求头部
  // headers: { Authorization: "Bearer " + getToken() },
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + "system/buyList/upload"
});
/** 导入按钮操作 */
function handleImport() {
  upload.title = "用户导入";
  upload.open = true;
};
/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/buyList/export', {
    ...queryParams.value
  }, `buyList_${new Date().getTime()}.xlsx`)
}

getList();
</script>
