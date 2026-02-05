// Google Apps Script - 客户记录系统

const SHEET_ID = '1nooJ3DgN4P3EWFjynwBPIlc9uOZMekfpzi6_32WcJB8';

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  
  try {
    const sheetName = getWeekSheetName();
    const sheet = getOrCreateSheet(sheetName);
    
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
    sheet.appendRow([
      timestamp, data.phone, data.country, data.region || '', 
      data.customerName, data.source || '', data.background || '', 
      data.details || '', data.amount
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: '✅ ' + data.customerName + ' 保存成功！' 
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
    // 返回本周记录列表
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
    
    // 跳过表头
    for (let i = 1; i < data.length; i++) {
      records.push({
        time: data[i][0],
        phone: data[i][1],
        country: data[i][2],
        region: data[i][3],
        customerName: data[i][4],
        source: data[i][5],
        background: data[i][6],
        details: data[i][7],
        amount: data[i][8]
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
  const start = new Date(year, 0, 1);
  const diff = now - start;
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  const weekNum = Math.floor(diff / oneWeek) + 1;
  return year + '-W' + weekNum.toString().padStart(2, '0');
}

function getOrCreateSheet(sheetName) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow([
      '记录时间', '电话', '国家', '区域', '客户名称', '获客途径', '客户背景', '具体情况', '成单金额'
    ]);
    sheet.getRange('A1:I1').setFontWeight('bold').setBackground('#E5E7EB');
  }
  
  return sheet;
}

function findPhone(phone, sheet) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] == phone) return i + 1;
  }
  return -1;
}
