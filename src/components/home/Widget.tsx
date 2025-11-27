import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { ExpandOutlined, CompressOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

interface WidgetProps {
  title: string;
  children?: React.ReactNode;
}

const Widget: React.FC<WidgetProps> = ({ title, children }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const expandButton = (
    <Tooltip title={isExpanded ? 'Reduzir' : 'Expandir'}>
      <button
        onClick={toggleExpand}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-white/20 transition-colors text-white/80 hover:text-white"
        style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}
      >
        {isExpanded ? (
          <CompressOutlined style={{ fontSize: 16 }} />
        ) : (
          <ExpandOutlined style={{ fontSize: 16 }} />
        )}
      </button>
    </Tooltip>
  );

  const widgetContent = (expanded: boolean) => (
    <div 
      className={`widget-container backdrop-blur-sm widget-no-scrollbar`}
      style={{
        background: 'rgba(224,163,123, 0.3)',
        border: '1px solid #ddd',
        borderRadius: expanded ? 12 : 8,
        boxShadow: expanded ? '0 25px 50px rgba(0,0,0,0.25)' : '0 2px 8px rgba(0,0,0,0.05)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100px', 
        overflow: 'hidden',
      }}
    >
      <div
        className="widget widget-title flex items-center justify-between"
        style={{
          margin: 0,
          marginBottom: 8,
          cursor: expanded ? 'default' : 'grab',
          fontWeight: 600,
          background: '#1F1E27',
          borderRadius: expanded ? '12px 12px 0 0' : '4px 4px 0 0',
          padding: 'clamp(6px, 1.5cqw, 12px)',
          flexShrink: 0, 
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <h3 style={{ margin: 0, fontWeight: 600, color: 'inherit' }}>
          {title}
        </h3>
        {expandButton}
      </div>
      <div 
        className='flex flex-1 overflow-hidden widget-content responsive-padding widget-no-scrollbar'
        style={{
          minHeight: 0,
        }}
      >
        {children}
      </div>
    </div>
  );

  // Expanded modal rendered via Portal
  const expandedModal = isExpanded && ReactDOM.createPortal(
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60" 
        onClick={toggleExpand}
        style={{ cursor: 'pointer', zIndex: 999 }}
      />
      {/* Expanded widget */}
      <div 
        className="fixed"
        style={{
          top: '20px',
          left: '20px',
          right: '20px',
          bottom: '20px',
          zIndex: 1000
        }}
      >
        {widgetContent(true)}
      </div>
    </>,
    document.body
  );

  return (
    <>
      {widgetContent(false)}
      {expandedModal}
    </>
  );
};

export default Widget;
