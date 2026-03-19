const PAYSTACK_SCRIPT_URL = 'https://js.paystack.co/v1/inline.js';

const loadPaystackScript = () =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${PAYSTACK_SCRIPT_URL}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = PAYSTACK_SCRIPT_URL;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

const usePaystackPayment = (config) => {
  return (onSuccess, onClose) => {
    loadPaystackScript().then(() => {
      const handler = window.PaystackPop.setup({
        key: config.publicKey,
        email: config.email,
        amount: config.amount,
        ref: config.reference,
        metadata: config.metadata,
        callback: onSuccess,
        onClose: onClose,
      });
      handler.openIframe();
    });
  };
};

export default usePaystackPayment;
