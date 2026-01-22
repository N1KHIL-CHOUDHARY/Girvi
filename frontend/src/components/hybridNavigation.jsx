import MobileBottomNav from './MobileBottomNav';


const HybridNavigation = ({ open, setOpen }) => {
  // Bottom nav center button toggles the shared sidebar open/close
  const handleToggleMenu = () => {
    setOpen(!open);
  };

  return (
    <>
      <MobileBottomNav open={open} setOpen={setOpen} onToggleMenu={handleToggleMenu} />
    </>
  );
};

export default HybridNavigation;
