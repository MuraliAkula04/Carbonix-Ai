import React, { useState } from 'react';

export default function BillOcrSimulator({ onApplyValue }) {
  const [extracting, setExtracting] = useState(false);
  const [extractedValue, setExtractedValue] = useState(null);

  const handleSimulate = () => {
    setExtracting(true);
    setExtractedValue(null);
    setTimeout(() => {
      setExtracting(false);
      // Realistic electricity bill extraction simulation
      const mockKwh = 345.5;
      setExtractedValue(mockKwh);
    }, 1200);
  };

  return (
    <div className="card margin-top drop-in" id="ocr-simulation">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Simulate Bill Upload (OCR)</h3>
        <span className="badge" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--primary)' }}>AI Powered</span>
      </div>
      <p className="text-sm text-muted">Click the dropzone below to simulate scanning and extracting kWh from a utility bill image.</p>

      <div
        className="upload-zone"
        id="upload-zone"
        onClick={handleSimulate}
        style={{ cursor: extracting ? 'wait' : 'pointer' }}
      >
        {extracting ? (
          <div>
            <i className="fas fa-spinner fa-spin fa-3x text-primary" style={{ marginBottom: '0.8rem' }}></i>
            <p><strong>Extracting Utility Data (OCR Engine)...</strong></p>
            <p className="text-sm text-muted">Parsing meter readings and kWh units...</p>
          </div>
        ) : extractedValue ? (
          <div>
            <p className="text-success"><i className="fas fa-check-circle"></i> OCR Scanning Succeeded</p>
            <h3 style={{ margin: '0.5rem 0', fontSize: '1.4rem' }}>Extracted Reading: {extractedValue} kWh</h3>
            <button
              type="button"
              id="apply-ocr-btn"
              className="btn btn-sm btn-outline margin-top-sm"
              onClick={(e) => {
                e.stopPropagation();
                onApplyValue(extractedValue);
              }}
            >
              <i className="fas fa-check"></i> Apply to Electricity Field
            </button>
          </div>
        ) : (
          <div>
            <i className="fas fa-file-invoice fa-3x text-muted" style={{ marginBottom: '0.8rem' }}></i>
            <p><strong>Click to Simulate Bill Upload</strong></p>
            <p className="text-sm text-muted">Supported formats: JPG, PNG, PDF (Mocked)</p>
          </div>
        )}
      </div>
    </div>
  );
}
