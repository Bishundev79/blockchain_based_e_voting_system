import PropTypes from "prop-types";

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm transition-all">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-lg w-full mx-4 border border-slate-100 dark:border-slate-200 dark:border-white/10 transition-colors">
        <header className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" aria-label="Close modal">
            &times;
          </button>
        </header>
        <div className="px-6 py-4 text-slate-700 dark:text-slate-300">{children}</div>
        {footer && <footer className="px-6 py-4 border-t border-slate-100 dark:border-white/5">{footer}</footer>}
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.string,
  children: PropTypes.node,
  footer: PropTypes.node,
};

export default Modal;
