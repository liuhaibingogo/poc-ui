<template>
  <div class="container">
    <!-- 功能操作区 -->
    <div class="toolbar">
      <label class="upload-label">
        📁 导入 Excel
        <input type="file" @change="handleFileChange" hidden />
      </label>
      <button @click="addRow">➕ 添加行</button>
      <button @click="addColumn">➕ 添加列</button>
      <button @click="deleteRow">🗑️ 删除选中行</button>
      <button @click="deleteColumn">🗑️ 删除选中列</button>
      <button @click="saveData">💾 保存到后端</button>
      <button @click="exportToExcel">⬇️ 导出 Excel</button>
    </div>

    <!-- Handsontable 容器 -->
    <div ref="hotContainer" class="hot-table"></div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import Handsontable from 'handsontable'
import 'handsontable/dist/handsontable.full.css'
import * as XLSX from 'xlsx'

export default {
  name: 'ExcelTable',
  setup() {
    const hotContainer = ref(null)
    const hotInstance = ref(null)
    const tableData = ref([['']]) // 初始化一个默认空表格

    onMounted(() => {
      hotInstance.value = new Handsontable(hotContainer.value, {
        data: [],
        colHeaders: true, // 显示列头
        rowHeaders: true, // 显示行头
        contextMenu: true, // 右键菜单
        manualColumnResize: true, // 列宽可调整
        manualRowResize: true, // 行高可调整
        columnSorting: true, // 支持排序
        licenseKey: 'non-commercial-and-evaluation',
      })
    })

    // 读取 Excel 文件
    const handleFileChange = (e) => {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (evt) => {
        const data = evt.target.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })
        hotInstance.value.loadData(jsonData)
      }
      reader.readAsBinaryString(file)
    }

    const addRow = () => {
      const data = hotInstance.value.getData()
      const newRow = new Array(data[0]?.length || 1).fill('')
      data.push(newRow)
      tableData.value = data
      hotInstance.value.loadData(data)
    }

    const addColumn = () => {
      const data = hotInstance.value.getData()
      for (let i = 0; i < data.length; i++) {
        data[i].push('')
      }
      tableData.value = data
      hotInstance.value.loadData(data)
    }

    const deleteRow = () => {
      const selected = hotInstance.value.getSelectedLast()
      if (selected) {
        const [rowIndex] = selected
        const data = hotInstance.value.getData()
        data.splice(rowIndex, 1)
        tableData.value = data
        hotInstance.value.loadData(data)
      }
    }

    const deleteColumn = () => {
      const selected = hotInstance.value.getSelectedLast()
      if (selected) {
        const [, colIndex] = selected
        const data = hotInstance.value.getData()
        const newData = data.map(row => {
          row.splice(colIndex, 1)
          return row
        })
        tableData.value = newData
        hotInstance.value.loadData(newData)
      }
    }
    const saveData = async () => {
      try {
        await axios.post('/api/save-excel', {
          data: fullData.value,
        })
        alert('保存成功！')
      } catch (error) {
        alert('保存失败：' + error.message)
      }
    }
    // 导出为 Excel 文件
    const exportToExcel = () => {
      const data = hotInstance.value.getData()
      const ws = XLSX.utils.aoa_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
      XLSX.writeFile(wb, '表格导出.xlsx')
    }

    return {
      hotContainer,
      handleFileChange,
      addRow,
      addColumn,
      deleteRow,
      deleteColumn,
      saveData,
      exportToExcel,
    }
  },
}
</script>

<style scoped>
.container {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}

button,
.upload-label {
  background-color: #3b82f6;
  color: white;
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

button:hover,
.upload-label:hover {
  background-color: #2563eb;
}

.hot-table {
  border: 1px solid #ccc;
  height: 500px;
  overflow: auto;
}
</style>