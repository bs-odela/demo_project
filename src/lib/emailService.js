export const emailService = {
  /**
   * Mocks sending an email with the OTP.
   * In a real app, this would call a backend endpoint or a service like EmailJS.
   */
  async sendSignupOtp(email, otp) {
    console.log(`\n================================`);
    console.log(`📧 MOCK EMAIL SENT`);
    console.log(`To: ${email}`);
    console.log(`Subject: Your Padhai Account Verification Code`);
    console.log(`Body: Your OTP code is ${otp}. It will expire in 5 minutes.`);
    console.log(`================================\n`);
    
    // Simulate network delay
    return new Promise((resolve) => setTimeout(resolve, 800));
  }
};
