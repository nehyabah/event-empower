
import NavLink from "./NavLink";

interface DesktopNavProps {
  isAuthenticated: boolean;
}

const DesktopNav = ({ isAuthenticated }: DesktopNavProps) => {
  return (
    <nav className="hidden md:flex items-center space-x-1">
      <NavLink to="/">Home</NavLink>
      
      {!isAuthenticated ? (
        <>
          <NavLink to="/features">Features</NavLink>
          <NavLink to="/pricing">Pricing</NavLink>
          <NavLink to="/vendors">Vendors</NavLink>
        </>
      ) : (
        <>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/todo-lists">To-Do Lists</NavLink>
          <NavLink to="/expense-tracker">Expenses</NavLink>
          <NavLink to="/vendors">Vendors</NavLink>
          <NavLink to="/couple-story">Our Story</NavLink>
        </>
      )}
    </nav>
  );
};

export default DesktopNav;
