
const AdminFooter: React.FC = () => {
  return (
    <footer className="border-t border-gray-100 bg-white px-6 py-2.5">
      <div className="flex items-center justify-between gap-3 text-xs text-gray-400">
        <span className="font-semibold text-opsh-primary/70">KTM Test Preparation Centre</span>
        <span>Admin Panel &copy; {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
};

export default AdminFooter;
  