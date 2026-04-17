import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// Custom Glassmorphism Theme Settings
const commonOptions = {
  background: 'rgba(23, 23, 23, 0.8)',
  backdrop: `
    rgba(0,0,0,0.4)
    backdrop-filter: blur(8px)
  `,
  color: '#ffffff',
  customClass: {
    popup: 'rounded-[32px] border border-white/10 shadow-2xl backdrop-blur-xl',
    title: 'text-2xl font-extrabold tracking-tight pt-8',
    htmlContainer: 'text-muted pb-8',
    confirmButton: 'bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105',
    cancelButton: 'bg-surface border border-white/10 hover:bg-white/5 text-white font-bold py-3 px-8 rounded-2xl transition-all duration-300',
    actions: 'flex gap-4 pb-8',
  },
  buttonsStyling: false,
};

const Toast = MySwal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: 'rgba(23, 23, 23, 0.95)',
  color: '#ffffff',
  customClass: {
    popup: 'rounded-2xl border border-white/10 shadow-xl backdrop-blur-xl',
    title: 'text-sm font-bold',
  },
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

export const showAlert = {
  success: (title: string, text?: string) => {
    return MySwal.fire({
      ...commonOptions,
      icon: 'success',
      iconColor: '#22c55e',
      title,
      text,
    });
  },
  
  error: (title: string, text?: string) => {
    return MySwal.fire({
      ...commonOptions,
      icon: 'error',
      iconColor: '#ef4444',
      title,
      text,
    });
  },
  
  warning: (title: string, text?: string) => {
    return MySwal.fire({
      ...commonOptions,
      icon: 'warning',
      iconColor: '#f59e0b',
      title,
      text,
    });
  },

  info: (title: string, text?: string) => {
    return MySwal.fire({
      ...commonOptions,
      icon: 'info',
      iconColor: '#3b82f6',
      title,
      text,
    });
  },

  confirm: (title: string, text: string, confirmButtonText = 'Confirm') => {
    return MySwal.fire({
      ...commonOptions,
      title,
      text,
      showCancelButton: true,
      confirmButtonText,
    });
  },

  toast: (title: string, icon: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    return Toast.fire({
      icon,
      title,
    });
  }
};

export default showAlert;
