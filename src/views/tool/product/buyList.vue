<template>
  <div class="container">
    <h2>📋BuyList</h2>

    <div class="actions">
      <el-select v-model="buyListParams" placeholder="请选择BuyList" clearable>
        <el-option label="BuyListA" value="BuyListA"></el-option>
        <el-option label="BuyListB" value="BuyListB"></el-option>
        <el-option label="BuyListC" value="BuyListC"></el-option>
      </el-select>
      <input type="file" @change="onFileChange" accept=".xlsx,.xls" />
      <el-button type="primary" @click="exportExcel">Download</el-button>
      <el-button type="success" @click="addRow">addRow</el-button>
    </div>

    <el-table :data="buyListData" style="width: 100%" border>
      <!-- 隐藏 ID 列（保留在数据中） -->
      <el-table-column prop="assetType" label="assetType">
        <template #default="scope"><el-input v-model="scope.row.assetType" /></template>
      </el-table-column>
      <el-table-column prop="productCode" label="productCode">
        <template #default="scope"><el-input v-model="scope.row.productCode" /></template>
      </el-table-column>
      <el-table-column prop="MAKER" label="MAKER">
        <template #default="scope"><el-input v-model="scope.row.MAKER" /></template>
      </el-table-column>
      <el-table-column prop="modDatetime" label="modDatetime">
        <template #default="scope">
          <el-date-picker
              v-model="scope.row.modDatetime"
              type="datetime"
              placeholder="选择时间"
              style="width: 100%;"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
          />
        </template>
      </el-table-column>
      <el-table-column prop="CHECKER" label="CHECKER">
        <template #default="scope"><el-input v-model="scope.row.CHECKER" /></template>
      </el-table-column>
      <el-table-column prop="chckerDatetime" label="chckerDatetime">
        <template #default="scope">
          <el-date-picker
              v-model="scope.row.chckerDatetime"
              type="datetime"
              placeholder="选择时间"
              style="width: 100%;"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
          />
        </template>
      </el-table-column>
<!--      <el-table-column label="操作" width="150">-->
<!--        <template #default="scope">-->
<!--          <el-button @click="deleteRow(scope.$index)" type="danger" size="small">删除</el-button>-->
<!--        </template>-->
<!--      </el-table-column>-->
    </el-table>
    <el-button @click="saveData()" type="warning" :disabled="!buyListData" size="small">Save</el-button>
    <el-button @click="reset" type="warning" size="small">Cancel</el-button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import * as XLSX from 'xlsx'
import { ElMessage } from 'element-plus'
import {getToken} from "@/utils/auth.js";

const buyListData = ref([])
const newRowStatus = ref(0)

onMounted(async () => {
  const id=buyListData.value.buyListId;

  const res = await axios.get('http://localhost:8080/system/product/buylist',{
    headers: { 'Authorization': getToken() },
    data:id
});
  buyListData.value = res.data
})

const addRow = () => {
  buyListData.value.push({
    id: null,
    assetType: '',
    productCode: '',
    MAKER: '',
    modDatetime: '',
    CHECKER: '',
    chckerDatetime: '',
    status: newRowStatus.value
  })
}

const reset = () => {
  buyListData.value.pop({
    id: null,
    assetType: '',
    productCode: '',
    MAKER: '',
    modDatetime: '',
    CHECKER: '',
    chckerDatetime: '',
    status: newRowStatus.value
  })
}

const deleteRow = async (index) => {
  const item = buyListData.value[index]
  if (item.id) {
    await axios.delete(`/api/buylist/${item.id}`)
  }
  buyListData.value.splice(index, 1)
}
const saveData = async () => {
  if (buyListData.value.length === 0) {
    alert("请先上传文件！");
    return;
  }

  try {
    const response = await axios.post('http://localhost:8080/system/product/save', {
      headers: { 'Authorization': getToken() },
      data: buyListData.value,
    });
    alert(`上传成功！共 ${buyListData.value.length} 条数据`);
    console.log("后端返回:", response.data);

    // 清空数据
    buyListData.value = [];
    // if (fileInput.value) fileInput.value.value = ''; // 清空文件输入框
  } catch (error) {
    alert(`上传失败: ${error.message}`);
    console.error("Error:", error);
  }
};

const onFileChange = (e) => {
  const file = e.target.files[0]
  const reader = new FileReader()
  reader.onload = (evt) => {
    const wb = XLSX.read(evt.target.result, { type: 'binary' })
    const sheet = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }).slice(1)
    buyListData.value = rows.map(row => ({
      id: null,
      assetType: row[0] || '',
      productCode: row[1] || '',
      MAKER: row[2] || '',
      modDatetime: row[3] || '',
      CHECKER: row[4] || '',
      chckerDatetime: row[5] || '',
      status: Number(row[6]) || 0
    }))
  }
  reader.readAsBinaryString(file)
}

const exportExcel = () => {
  const data = [
    ['资产类型', '产品编号', '制造商', '修改时间', '检查员', '检查时间', '状态'],
    ...buyListData.value.map(item => [
      item.assetType, item.productCode, item.MAKER,
      item.modDatetime, item.CHECKER, item.chckerDatetime, item.status
    ])
  ]
  const sheet = XLSX.utils.aoa_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, sheet, '采购清单')
  XLSX.writeFile(wb, '采购清单.xlsx')
}
</script>

<style scoped>
.container {
  max-width: 1100px;
  margin: auto;
  padding: 20px;
}
.actions {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 15px;
}
</style>
