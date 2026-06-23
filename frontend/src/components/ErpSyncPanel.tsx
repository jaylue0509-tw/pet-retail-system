import React, { useState } from 'react';
import api from '../api';

interface ErpSyncPanelProps {
  onSyncComplete: () => void;
}

const ErpSyncPanel: React.FC<ErpSyncPanelProps> = ({ onSyncComplete }) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  const handleErpImport = async () => {
    if (!csvFile) {
      alert('請先選擇 CSV 檔案！');
      return;
    }
    
    setIsImporting(true);
    setImportResult(null);
    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      const res = await api.post('/pets/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImportResult(res.data);
      alert('ERP 資料同步完成！');
      setCsvFile(null);
      onSyncComplete();
    } catch (err: any) {
      alert('同步失敗：' + (err.response?.data?.detail || err.message));
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <div className="admin-topbar">
        <h2 className="admin-title" style={{ fontWeight: 700 }}>ERP 數據單向同步</h2>
      </div>

      <div className="card" style={{ padding: '2rem', maxWidth: '700px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 700 }}>模擬 ERP 批次匯入</h3>
        <p style={{ color: 'var(--ink-light)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          本平台以「活體編號」作為唯一主鍵識別。您可以直接上傳 ERP 系統匯出的原始 CSV，系統將自動解析並比對。新進活體自動建立（預設為草稿狀態）；已存在的活體則更新資料。
        </p>

        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--ink-mid)', marginBottom: '1.5rem' }}>
          <strong>📌 支援的 ERP 匯出格式（系統自動識別）：</strong><br />
          <div style={{ marginTop: '0.5rem' }}>
            <span style={{ background: '#ebf8ff', color: '#2b6cb0', padding: '2px 6px', borderRadius: '4px', marginRight: '4px', fontSize: '0.8rem' }}>店倉</span>
            <span style={{ background: '#ebf8ff', color: '#2b6cb0', padding: '2px 6px', borderRadius: '4px', marginRight: '4px', fontSize: '0.8rem' }}>店倉名稱</span>
            <span style={{ background: '#ebf8ff', color: '#2b6cb0', padding: '2px 6px', borderRadius: '4px', marginRight: '4px', fontSize: '0.8rem' }}>活體編號</span>
            <span style={{ background: '#ebf8ff', color: '#2b6cb0', padding: '2px 6px', borderRadius: '4px', marginRight: '4px', fontSize: '0.8rem' }}>品名</span>
            <span style={{ background: '#ebf8ff', color: '#2b6cb0', padding: '2px 6px', borderRadius: '4px', marginRight: '4px', fontSize: '0.8rem' }}>晶片號碼</span>
            <span style={{ background: '#ebf8ff', color: '#2b6cb0', padding: '2px 6px', borderRadius: '4px', marginRight: '4px', fontSize: '0.8rem' }}>性別</span>
            <span style={{ background: '#ebf8ff', color: '#2b6cb0', padding: '2px 6px', borderRadius: '4px', marginRight: '4px', fontSize: '0.8rem' }}>出生日期</span>
            <span style={{ background: '#ebf8ff', color: '#2b6cb0', padding: '2px 6px', borderRadius: '4px', marginRight: '4px', fontSize: '0.8rem' }}>天數</span>
            <span style={{ background: '#ebf8ff', color: '#2b6cb0', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>成本</span>
          </div>
          <div style={{ marginTop: '0.75rem', color: '#718096', fontSize: '0.8rem' }}>
            ⚠️ 請用 <strong>Excel 另存新檔 → CSV UTF-8（逗號分隔）</strong> 格式儲存後再上傳，避免晶片號碼顯示異常。
          </div>
        </div>

        <div className="form-group">
          <input 
            type="file" 
            accept=".csv"
            onChange={e => e.target.files && setCsvFile(e.target.files[0])}
            style={{ display: 'block', marginBottom: '1rem' }}
          />
        </div>

        <button 
          className="btn btn-primary" 
          onClick={handleErpImport}
          disabled={isImporting || !csvFile}
          style={{ borderRadius: '8px', fontWeight: 700 }}
        >
          {isImporting ? '同步處理中...' : '🚀 啟動 CSV 資料比對與更新'}
        </button>

        {importResult && (
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f0fff4', border: '1px solid #c6f6d5', borderRadius: '12px', color: '#22543d' }}>
            <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>同步成功回報：</h4>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.9rem', lineHeight: '1.8' }}>
              <li>🆕 新增活體筆數：{importResult.added} 筆</li>
              <li>🔄 更新狀態筆數：{importResult.updated} 筆</li>
              <li>⏭ 跳過/忽略筆數：{importResult.skipped} 筆</li>
            </ul>
            {importResult.errors && importResult.errors.length > 0 && (
              <div style={{ marginTop: '1rem', borderTop: '1px solid #c6f6d5', paddingTop: '1rem', color: '#c53030' }}>
                <strong style={{ display: 'block', marginBottom: '0.3rem' }}>警告或錯誤列表：</strong>
                <div style={{ maxHeight: '150px', overflowY: 'auto', fontSize: '0.8rem' }}>
                  {importResult.errors.map((err: string, i: number) => <div key={i}>{err}</div>)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ErpSyncPanel;
