// ============================================
// ZenPy - OTP Generator (Manual - No Email)
// ============================================

// In-memory OTP storage (cleared on server restart)
const otpStore = new Map();

/**
 * Generate a random 6-digit OTP
 */
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate a 4-digit OTP (for forgot password)
 */
function generateShortOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Store OTP with expiry (5 minutes)
 */
function storeOTP(email, otp, data = {}) {
    otpStore.set(email, {
        otp,
        data,
        createdAt: Date.now(),
        expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    });
}

/**
 * Verify OTP
 */
function verifyOTP(email, otp) {
    const stored = otpStore.get(email);
    
    if (!stored) {
        return { valid: false, message: 'No OTP found. Please request a new one.' };
    }
    
    if (Date.now() > stored.expiresAt) {
        otpStore.delete(email);
        return { valid: false, message: 'OTP has expired. Please request a new one.' };
    }
    
    if (stored.otp !== otp) {
        return { valid: false, message: 'Invalid OTP. Please try again.' };
    }
    
    // OTP is valid - return stored data and clean up
    const data = stored.data;
    otpStore.delete(email);
    return { valid: true, data };
}

/**
 * Get stored OTP data (for development display)
 */
function getOTPData(email) {
    return otpStore.get(email);
}

module.exports = {
    generateOTP,
    generateShortOTP,
    storeOTP,
    verifyOTP,
    getOTPData
};
