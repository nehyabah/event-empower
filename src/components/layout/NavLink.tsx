
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  showIcon?: boolean;
}

const NavLink = ({ to, children, className, onClick, icon, showIcon = false }: NavLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "relative px-3 py-2 text-sm font-medium transition-colors",
        isActive 
          ? "text-primary"
          : "text-foreground/80 hover:text-foreground",
        className
      )}
      onClick={onClick}
    >
      {showIcon && icon && (
        <div className="flex items-center gap-3">
          {icon}
          <span>{children}</span>
        </div>
      )}
      {!showIcon && children}
      {isActive && !showIcon && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full animate-fade-in" />
      )}
    </Link>
  );
};

export default NavLink;
