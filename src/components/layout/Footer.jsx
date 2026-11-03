// This component was causing a duplicate Footer because App.tsx already renders the global Footer.
// To avoid breaking imports across all pages without modifying them, we return null here.
const Footer = () => {
    return null;
};
export default Footer;
