// Google Apps Script - 客户记录系统

const SHEET_ID = '1nooJ3DgN4P3EWFjynwBPIlc9uOZMekfpzi6_32WcJB8'; // 你的表格ID

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  
  try {
    // 1. 获取或创建本周的sheet
    const sheetName = getWeekSheetName();
    const sheet = getOrCreateSheet(sheetName);
    
    // 2. 检测电话是否已存在
    const existingIndex = findPhone(data.phone, sheet);
    if (existingIndex !== -1) {
      return ContentService
        .createTextOutput(JSON.stringify({ 
          success: false, 
          message: `⚠️ 电话 ${data.phone} 已在第 ${existingIndex} 行记录！` 
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 3. 写入新记录
    const timestamp = new Date();
    sheet.appendRow([
      timestamp,                           // A: 记录时间
      data.phone,                          // B: 电话
      data.country,                        // C: 国家
      data.region || '',                   // D: 区域
      data.customerName,                   // E: 客户名称
      data.source || '',                   // F: 获客途径
      data.background || '',               // G: 客户背景
      data.details || '',                  // H: 具体需求
      data.amount                          // I: 成单金额
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: `✅ ${data.customerName} 保存成功！` 
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        message: '保存失败: ' + error.message 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 获取本周sheet名称（格式：2024-W01）
function getWeekSheetName() {
  const now = new Date();
  const year = now.getFullYear();
  
  // 计算本周是第几周
  const start = new Date(year, 0, 1);
  const diff = now - start;
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  const weekNum = Math.floor(diff / oneWeek) + 1;
  
  return `${year}-W${weekNum.toString().padStart(2, '0')}`;
}

// 获取或创建sheet
function getOrCreateSheet(sheetName) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    // 添加表头
    sheet.appendRow([
      '记录时间', '电话', '国家', '区域', '客户名称', '获客途径', '客户背景', '具体情况', '成单金额'
    ]);
    // 设置表头样式
    sheet.getRange('A1:I1').setFontWeight('bold').setBackground('#E5E7EB');
  }
  
  return sheet;
}

// 查找电话是否已存在
function findPhone(phone, sheet) {
  const data = sheet.getDataRange().getValues();
  
  // 从第2行开始检查（第1行是表头）
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] == phone) { // 第2列是电话
      return i + 1; // 返回行号
    }
  }
  return -1;
}

// 测试用 - 在浏览器打开
function doGet() {
  return HtmlService.createHtmlOutput('<h1>客户记录系统运行中</h1><p>请使用表单提交数据</p>');
}
