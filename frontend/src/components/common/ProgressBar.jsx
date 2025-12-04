import './ProgressBar.css';

const ProgressBar = ({ 
  value = 0, 
  max = 100, 
  color = 'primary',
  showLabel = true,
  size = 'medium',
  className = '' 
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`progress-bar progress-bar--${size} ${className}`}>
      <div className="progress-bar__track">
        <div 
          className={`progress-bar__fill progress-bar__fill--${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="progress-bar__label">{Math.round(percentage)}%</span>
      )}
    </div>
  );
};

export default ProgressBar;

