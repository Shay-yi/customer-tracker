// Google Apps Script - 客户记录系统 V3

const SHEET_ID = '1nooJ3DgN4P3EWFjynwBPIlc9uOZMekfpzi6_32WcJB8';

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = e.parameter.action;
  
  try {
    const sheetName = getWeekSheetName();
    const sheet = getOrCreateSheet(sheetName);
    
    // 删除记录
    if (action === 'delete') {
      const rowIndex = findPhone(data.phone, sheet);
      if (rowIndex === -1) {
        return ContentService
          .createTextOutput(JSON.stringify({ 
            success: false, 
            message: '未找到该记录' 
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      sheet.deleteRow(rowIndex);
      
      return ContentService
        .createTextOutput(JSON.stringify({ 
          success: true, 
          message: '✅ 已删除记录' 
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 更新记录
    if (action === 'update') {
      const rowIndex = findPhone(data.originalPhone || data.phone, sheet);
      if (rowIndex === -1) {
        return ContentService
          .createTextOutput(JSON.stringify({ 
            success: false, 
            message: '未找到该记录' 
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      const timestamp = new Date();
      const statusText = data.status === 'replied' ? '✅ 已回复' : '⏳ 未回复';
      
      sheet.getRange(rowIndex, 1, 1, 11).setValues([[
        timestamp,
        data.status || 'unreplied',
        data.phone,
        data.email || '',
        data.country,
        data.region || '',
        data.customerName,
        data.source || '',
        data.background || '',
        data.details || '',
        data.amount || 0
      ]]);
      
      return ContentService
        .createTextOutput(JSON.stringify({ 
          success: true, 
          message: '✅ ' + data.customerName + ' (' + statusText + ') 已更新！' 
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 新增记录
    const existingIndex = findPhone(data.phone, sheet);
    if (existingIndex !== -1) {
      return ContentService
        .createTextOutput(JSON.stringify({ 
          success: false, 
          message: '⚠️ 电话 ' + data.phone + ' 已在第 ' + existingIndex + ' 行记录！',
          existing: true
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const timestamp = new Date();
    const statusText = data.status === 'replied' ? '✅ 已回复' : '⏳ 未回复';
    
    sheet.appendRow([
      timestamp,
      data.status || 'unreplied',
      data.phone,
      data.email || '',
      data.country,
      data.region || '',
      data.customerName,
      data.source || '',
      data.background || '',
      data.details || '',
      data.amount || 0
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: '✅ ' + data.customerName + ' (' + statusText + ') 保存成功！' 
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

function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'list') {
    const sheetName = getWeekSheetName();
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, records: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = sheet.getDataRange().getValues();
    const records = [];
    
    for (let i = 1; i < data.length; i++) {
      records.push({
        time: data[i][0],
        status: data[i][1],
        phone: data[i][2],
        email: data[i][3],
        country: data[i][4],
        region: data[i][5],
        customerName: data[i][6],
        source: data[i][7],
        background: data[i][8],
        details: data[i][9],
        amount: data[i][10]
      });
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        records: records,
        week: sheetName 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService
    .createTextOutput(JSON.stringify({ success: true, message: '客户记录系统运行中' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getWeekSheetName() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return year + '年' + month + '月-W' + Math.ceil(now.getDate() / 7);
}

function getOrCreateSheet(sheetName) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(['记录时间', '状态', '电话', '邮箱', '国家', '区域', '客户名称', '获客途径', '客户背景', '具体情况', '成单金额']);
    sheet.getRange('A1:K1').setFontWeight('bold').setBackground('#E5E7EB');
  }
  
  return sheet;
}

function findPhone(phone, sheet) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][2]) === String(phone)) return i + 1;
  }
  return -1;
}
