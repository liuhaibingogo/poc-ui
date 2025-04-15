<template>
  <div class="container">
    <h2>📊 Excel 表格编辑器</h2>

    <div class="actions">
      <label class="file-label">
        📁 导入 Excel
        <input type="file" accept=".xlsx,.xls" @change="onFileChange" hidden />
      </label>
      <button @click="addRow">➕ 添加行</button>
      <button @click="addColumn">➕ 添加列</button>
      <button @click="deleteRow">➖ 删除最后一行</button>
      <button @click="deleteColumn">➖ 删除最后一列</button>
      <button @click="exportToExcel">⬇️ 导出 Excel</button>
      <button @click="saveToBackend">💾 保存到后端</button>
    </div>

    <table v-if="tableData.length" class="excel-table">
      <thead>
      <tr>
        <th v-for="(col, colIndex) in columnCount" :key="'header' + colIndex">列 {{ colIndex + 1 }}</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(row, rowIndex) in tableData" :key="rowIndex">
        <td v-for="(cell, colIndex) in columnCount" :key="colIndex">
          <input v-model="tableData[rowIndex][colIndex]" />
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import * as XLSX from 'xlsx'
import axios from 'axios'
import { ref, computed } from 'vue'

const tableData = ref([])

const columnCount = computed(() =>
    tableData.value.reduce((max, row) => Math.max(max, row.length), 0)
)

const onFileChange = (e) => {
  const file = e.target.files[0]
  const reader = new FileReader()
  reader.onload = (evt) => {
    const data = evt.target.result
    const workbook = XLSX.read(data, { type: 'binary' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 })
    tableData.value = jsonData
  }
  reader.readAsBinaryString(file)
}

const addRow = () => {
  const newRow = Array(columnCount.value).fill('')
  tableData.value.push(newRow)
}

const addColumn = () => {
  tableData.value.forEach(row => row.push(''))
}

const deleteRow = () => {
  if (tableData.value.length > 0) {
    tableData.value.pop()
  }
}

const deleteColumn = () => {
  const maxCol = columnCount.value
  if (maxCol > 0) {
    tableData.value.forEach(row => row.splice(maxCol - 1, 1))
  }
}

const exportToExcel = () => {
  const worksheet = XLSX.utils.aoa_to_sheet(tableData.value)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  XLSX.writeFile(workbook, 'exported.xlsx')
}

const saveToBackend = async () => {
  try {
    await axios.post('/api/save-table', { data: tableData.value })
    alert('✅ 数据已成功保存到后端！')
  } catch (error) {
    alert('❌ 保存失败：' + error.message)
  }
}
</script>

<style scoped>
.container {
  padding: 30px;
  max-width: 1000px;
  margin: auto;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
  justify-content: center;
}

button,
.file-label {
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: 0.2s;
}

button:hover,
.file-label:hover {
  background-color: #1d4ed8;
}

table.excel-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

table.excel-table th,
table.excel-table td {
  border: 1px solid #ccc;
  padding: 6px;
}

table.excel-table input {
  width: 100%;
  border: none;
  padding: 4px;
  box-sizing: border-box;
}
</style>
