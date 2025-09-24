import React from 'react';

interface WidgetProps {
  title: string;
  children?: React.ReactNode;
}

const Widget: React.FC<WidgetProps> = ({ title, children }) => (
  <div className="widget-container" style={{
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100px', 
    overflow: 'hidden', // Prevent content overflow
  }}>
    <h3
      className="widget widget-title"
      style={{
        margin: 0,
        marginBottom: 8,
        cursor: 'grab',
        fontWeight: 600,
        background: '#f3f4f6',
        borderRadius: '4px 4px 0 0',
        padding: 'clamp(6px, 1.5cqw, 12px)',
        flexShrink: 0, // Prevent header from shrinking
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      {title}
    </h3>
    <div 
      className='flex flex-1 overflow-hidden widget-content responsive-padding'
      style={{
        minHeight: 0, // Allow flex child to shrink
      }}
    >
      {children}
    </div>
  </div>
);

export default Widget;
