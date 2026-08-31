(() => {
  'use strict';

  const today = new Date().toISOString().slice(0, 10);

  function preventPastDates() {
    document.querySelectorAll('input[type="date"]').forEach((dateInput) => {
      dateInput.min = today;
    });
  }

  preventPastDates();

  new MutationObserver(preventPastDates).observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
