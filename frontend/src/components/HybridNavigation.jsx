import MobileBottomNav from './MobileBottomNav';


const HybridNavigation = ({ open, setOpen }) => {
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
