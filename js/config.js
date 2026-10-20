/* EOT checkout settings. Edit this file only. */
window.EOT_CONFIG = {
  /* Paystack PUBLIC key (pk_test_... while testing, pk_live_... when you go live). Never put the secret key here. */
  PAYSTACK_PUBLIC_KEY: "pk_test_REPLACE_WITH_YOUR_PUBLIC_KEY",

  /* Where Paystack sends the student after payment. Relative path works on any host. */
  SUCCESS_PAGE: "success.html",

  /* Server-side verification endpoint. Leave empty for now; set it when the Paystack backend is set up.
     While empty, the return page trusts Paystack's popup success and shows the student's receipt. */
  VERIFY_ENDPOINT: "",

  /* Plans. Amounts are in naira; the form converts to kobo for Paystack. */
  PLANS: {
    monthly: { label: "Monthly (first month)", amount: 10000 },
    phase1:  { label: "Full Phase 1 (2 months)", amount: 18000 }
  },

  /* Support + next steps shown on the success page. Use international format, no + or spaces. */
  WHATSAPP_NUMBER: "2340000000000",
  WHATSAPP_GROUP_URL: "",          /* paste the class WhatsApp group invite link here */
  CLASS_START: "20 October 2026"
};
