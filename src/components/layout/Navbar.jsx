// This component was causing a duplicate Navbar because App.tsx already renders the global Navbar.
// To avoid breaking imports across all pages without modifying them (as per user request), we return null here.
const Navbar = () => {
    return null;
};
export default Navbar;
