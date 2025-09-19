import React from 'react';

interface WidgetProps {
  title: string;
  children?: React.ReactNode;
}

const Widget: React.FC<WidgetProps> = ({ title, children }) => (
  <div style={{
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: 8,
    padding: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  }}>
    <h3
      className="widget-drag-handle"
      style={{
        margin: 0,
        marginBottom: 8,
        fontSize: 18,
        cursor: 'grab',
        fontWeight: 600,
        background: '#f3f4f6',
        padding: 4,
        borderRadius: 4,
        userSelect: 'none',
      }}
    >
      {title}
    </h3>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

export default Widget;
