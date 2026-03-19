// Reusable logo component — image must be placed at client/public/logo.png
const Logo = ({ size = 'md', className = '' }) => {
  const sizes = {
    xs: 'h-7',
    sm: 'h-9',
    md: 'h-11',
    lg: 'h-14',
    xl: 'h-20',
  };

  return (
    <img
      src="/logo.png"
      alt="EOPANSE Logo"
      className={`${sizes[size]} w-auto object-contain ${className}`}
    />
  );
};

export default Logo;
