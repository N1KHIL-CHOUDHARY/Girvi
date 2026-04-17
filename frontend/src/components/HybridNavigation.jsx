import MobileBottomNav from './MobileBottomNav';

const HybridNavigation = ({ open, setOpen }) => {
  return (
    <MobileBottomNav
      open={open}
      setOpen={setOpen}
      onToggleMenu={() => setOpen(!open)}
    />
  );
};

export default HybridNavigation;