<template>
  <div class="excel-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>Excel 导入导出工具</span>
        </div>
      </template>

      <div class="action-buttons">
        <el-upload
            action=""
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileImport"
            accept=".xlsx, .xls"
        >
          <el-button type="primary" icon="el-icon-upload">导入 Excel</el-button>
        </el-upload>

        <el-button
            type="success"
            icon="el-icon-download"
            @click="exportToCSV"
            :disabled="!tableData.length"
        >
          导出 CSV
        </el-button>
      </div>

      <el-alert
          v-if="errorMessage"
          :title="errorMessage"
          type="error"
          show-icon
          :closable="false"
          class="error-alert"
      />

      <div v-if="tableData.length" class="table-container">
        <el-table v-loading="loading" :data="tableData" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="ID" align="center" prop="ID" />
          <el-table-column label="assetType" align="center" prop="assetType" />
          <el-table-column label="productCode" align="center" prop="productCode" />
          <el-table-column label="MAKER" align="center" prop="MAKER" />
          <el-table-column label="modDatetime" align="center" prop="modDatetime" width="180">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.modDatetime, '{y}-{m}-{d}') }}</span>
            </template>
          </el-table-column>
          <el-table-column label="CHECKER" align="center" prop="CHECKER" />
          <el-table-column label="chckerDatetime" align="center" prop="chckerDatetime" width="180">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.chckerDatetime, '{y}-{m}-{d}') }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-edit"
                  @click="handleUpdate(scope.row)"
                  v-hasPermi="['system:buyList:edit']"
              >修改</el-button>
              <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-delete"
                  @click="handleDelete(scope.row)"
                  v-hasPermi="['system:buyList:remove']"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-empty v-else description="请导入 Excel 文件或直接在表格中输入数据" />
    </el-card>
  </div>
</template>

<script>
import * as XLSX from 'xlsx';
import { ElMessage } from 'element-plus';

export default {
  name: 'ExcelProcessorWithElement',
  data() {
    return {
      tableData: [],
      tableHeaders: [],
      errorMessage: ''
    };
  },
  methods: {
    async handleFileImport(file) {
      this.errorMessage = '';

      try {
        const data = await this.readFile(file.raw);
        const workbook = XLSX.read(data);
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // 转换为 JSON 格式
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length === 0) {
          this.errorMessage = 'Excel 文件中没有数据';
          return;
        }

        // 提取表头（第一行）
        this.tableHeaders = jsonData[0].slice(0, 6); // 只取前6列

        // 处理数据行
        this.tableData = jsonData.slice(1).map(row => {
          // 确保每行有6列，不足的补空字符串
          const rowData = row.slice(0, 6);
          while (rowData.length < 6) {
            rowData.push('');
          }
          return rowData;
        });

        ElMessage.success('Excel 导入成功');

      } catch (error) {
        console.error('导入失败:', error);
        this.errorMessage = '导入失败，请检查文件格式';
        ElMessage.error('Excel 导入失败');
      }
    },

    readFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsArrayBuffer(file);
      });
    },

    handleCellEdit(rowIndex, cellIndex, value) {
      // 确保行数据存在
      if (!this.tableData[rowIndex]) {
        this.tableData[rowIndex] = Array(6).fill('');
      }

      // 确保单元格存在
      if (this.tableData[rowIndex][cellIndex] === undefined) {
        this.$set(this.tableData[rowIndex], cellIndex, value);
      }

      // 确保每行有6列
      while (this.tableData[rowIndex].length < 6) {
        this.tableData[rowIndex].push('');
      }
    },

    exportToCSV() {
      if (!this.tableData.length) return;

      try {
        // 准备数据（包含表头）
        const exportData = [
          this.tableHeaders.length ? this.tableHeaders : Array(6).fill('').map((_, i) => `列 ${i + 1}`),
          ...this.tableData.map(row => row.slice(0, 6)) // 确保每行只有6列
        ];

        // 创建工作表
        const worksheet = XLSX.utils.aoa_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

        // 导出为CSV
        XLSX.writeFile(workbook, 'exported_data.csv', { bookType: 'csv' });

        ElMessage.success('CSV 导出成功');

      } catch (error) {
        console.error('导出失败:', error);
        ElMessage.error('CSV 导出失败');
      }
    }
  }
};
</script>

<style scoped>
.excel-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

.box-card {
  min-height: 500px;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: center;
}

.error-alert {
  margin-bottom: 20px;
}

.data-table {
  margin-top: 20px;
}

.data-table :deep(.el-table__cell) {
  padding: 4px 0;
}

.data-table :deep(.el-input__inner) {
  border: none;
  height: 30px;
  padding: 0 10px;
}

.data-table :deep(.el-input__inner:focus) {
  border: 1px solid #409eff;
  outline: none;
}
</style>