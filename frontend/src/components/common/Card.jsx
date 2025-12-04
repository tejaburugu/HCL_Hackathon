import './Card.css';

const Card = ({ children, className = '', padding = 'medium', ...props }) => {
  return (
    <div className={`card card--padding-${padding} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;

