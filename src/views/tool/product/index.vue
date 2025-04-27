<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="ID" prop="ID">
        <el-input
          v-model="queryParams.ID"
          placeholder="请输入ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="buyList" prop="buyList">
        <el-input
          v-model="queryParams.buyList"
          placeholder="请输入buyList"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="status" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择status" clearable>
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
          v-hasPermi="['system:product:add']"
        >新增</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="productList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="ID" />
      <el-table-column label="buyList" align="center" prop="buyList" >
      <template #default="scope">
        <router-link :to="'/system/buy_List/index/' + scope.row.ID+scope.row.buyListID" class="link-type">
        </router-link>
      </template>
      </el-table-column>
      <el-table-column v-if="showColumn" label="buyListID" align="center" prop="buyListID" />
      <el-table-column label="status" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="buy_list_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
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
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:product:remove']">删除</el-button>
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

<!--    &lt;!&ndash; 添加或修改清单列表对话框 &ndash;&gt;-->
<!--    <el-dialog :title="title" v-model="open" width="500px" append-to-body>-->
<!--      <el-form ref="productRef" :model="form" :rules="rules" label-width="80px">-->
<!--        <el-form-item label="${comment}" prop="ID">-->
<!--          <el-input v-model="form.ID" placeholder="请输入${comment}" />-->
<!--        </el-form-item>-->
<!--        <el-form-item label="${comment}" prop="buyList">-->
<!--          <el-input v-model="form.buyList" placeholder="请输入${comment}" />-->
<!--        </el-form-item>-->
<!--        <el-form-item label="${comment}" prop="buyListID">-->
<!--          <el-input v-model="form.buyListID" placeholder="请输入${comment}" />-->
<!--        </el-form-item>-->
<!--        <el-form-item label="${comment}" prop="status">-->
<!--          <el-radio-group v-model="form.status">-->
<!--            <el-radio-->
<!--              v-for="dict in buy_list_status"-->
<!--              :key="dict.value"-->
<!--              :label="dict.value"-->
<!--            >{{dict.label}}</el-radio>-->
<!--          </el-radio-group>-->
<!--        </el-form-item>-->
<!--        <el-divider content-position="center">采购清单信息</el-divider>-->
<!--        <el-row :gutter="10" class="mb8">-->
<!--          <el-col :span="1.5">-->
<!--            <el-button type="primary" icon="Plus" @click="handleAddBuyList">添加</el-button>-->
<!--          </el-col>-->
<!--          <el-col :span="1.5">-->
<!--            <el-button type="danger" icon="Delete" @click="handleDeleteBuyList">删除</el-button>-->
<!--          </el-col>-->
<!--        </el-row>-->
<!--        <el-table :data="buyListList" :row-class-name="rowBuyListIndex" @selection-change="handleBuyListSelectionChange" ref="buyList">-->
<!--          <el-table-column type="selection" width="50" align="center" />-->
<!--          <el-table-column label="序号" align="center" prop="index" width="50"/>-->
<!--          <el-table-column label="$comment" prop="productCode" width="150">-->
<!--            <template #default="scope">-->
<!--              <el-input v-model="scope.row.productCode" placeholder="请输入$comment" />-->
<!--            </template>-->
<!--          </el-table-column>-->
<!--          <el-table-column label="$comment" prop="MAKER" width="150">-->
<!--            <template #default="scope">-->
<!--              <el-input v-model="scope.row.MAKER" placeholder="请输入$comment" />-->
<!--            </template>-->
<!--          </el-table-column>-->
<!--          <el-table-column label="$comment" prop="modDatetime" width="240">-->
<!--            <template #default="scope">-->
<!--              <el-date-picker clearable-->
<!--                v-model="scope.row.modDatetime"-->
<!--                type="date"-->
<!--                value-format="YYYY-MM-DD"-->
<!--                placeholder="请选择$comment">-->
<!--              </el-date-picker>-->
<!--            </template>-->
<!--          </el-table-column>-->
<!--          <el-table-column label="$comment" prop="CHECKER" width="150">-->
<!--            <template #default="scope">-->
<!--              <el-input v-model="scope.row.CHECKER" placeholder="请输入$comment" />-->
<!--            </template>-->
<!--          </el-table-column>-->
<!--          <el-table-column label="$comment" prop="chckerDatetime" width="240">-->
<!--            <template #default="scope">-->
<!--              <el-date-picker clearable-->
<!--                v-model="scope.row.chckerDatetime"-->
<!--                type="date"-->
<!--                value-format="YYYY-MM-DD"-->
<!--                placeholder="请选择$comment">-->
<!--              </el-date-picker>-->
<!--            </template>-->
<!--          </el-table-column>-->
<!--          <el-table-column label="$comment" prop="STATUS" width="150">-->
<!--            <template #default="scope">-->
<!--              <el-select v-model="scope.row.STATUS" placeholder="请选择$comment">-->
<!--                <el-option-->
<!--                  v-for="dict in buy_list_status"-->
<!--                  :key="dict.value"-->
<!--                  :label="dict.label"-->
<!--                  :value="dict.value"-->
<!--                ></el-option>-->
<!--              </el-select>-->
<!--            </template>-->
<!--          </el-table-column>-->
<!--        </el-table>-->
<!--      </el-form>-->
<!--      <template #footer>-->
<!--        <div class="dialog-footer">-->
<!--          <el-button type="primary" @click="submitForm">确 定</el-button>-->
<!--          <el-button @click="cancel">取 消</el-button>-->
<!--        </div>-->
<!--      </template>-->
<!--    </el-dialog>-->
  </div>
</template>

<script setup name="Product">
import { listProduct, getProduct, delProduct, addProduct, updateProduct } from "@/api/system/product";

const { proxy } = getCurrentInstance();
const { buy_list_status } = proxy.useDict('buy_list_status');
const router = useRouter();

const productList = ref([]);
const buyListList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const checkedBuyList = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const showColumn=ref(false);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    ID: null,
    buyList: null,
    status: null
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询清单列表列表 */
function getList() {
  loading.value = true;
  listProduct(queryParams.value).then(response => {
    productList.value = response.rows;
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
    buyList: null,
    buyListID: null,
    status: null,

  };
  buyListList.value = [];
  proxy.resetForm("productRef");
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
const handleAdd = (row) => {
  // 打开一个新窗口，指向你的子页面路由
  const ID = 1;
  router.push({ path: "/tool/tool-buyList/index/" + ID});
}
/** 提交按钮 */
function submitForm() {
  proxy.$refs["productRef"].validate(valid => {
    if (valid) {
      form.value.buyListList = buyListList.value;
      if (form.value.ID != null) {
        updateProduct(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addProduct(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除清单列表编号为"' + _IDs + '"的数据项？').then(function() {
    return delProduct(_IDs);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 采购清单序号 */
function rowBuyListIndex({ row, rowIndex }) {
  row.index = rowIndex + 1;
}

/** 采购清单添加按钮操作 */
function handleAddBuyList() {
  let obj = {};
  obj.assetType = "";
  obj.productCode = "";
  obj.MAKER = "";
  obj.modDatetime = "";
  obj.CHECKER = "";
  obj.chckerDatetime = "";
  obj.STATUS = "";
  buyListList.value.push(obj);
}

/** 采购清单删除按钮操作 */
function handleDeleteBuyList() {
  if (checkedBuyList.value.length == 0) {
    proxy.$modal.msgError("请先选择要删除的采购清单数据");
  } else {
    const buyLists = buyListList.value;
    const checkedBuyLists = checkedBuyList.value;
    buyListList.value = buyLists.filter(function(item) {
      return checkedBuyLists.indexOf(item.index) == -1
    });
  }
}

/** 复选框选中数据 */
function handleBuyListSelectionChange(selection) {
  checkedBuyList.value = selection.map(item => item.index)
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/product/export', {
    ...queryParams.value
  }, `product_${new Date().getTime()}.xlsx`)
}

getList();
</script>
