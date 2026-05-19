
/**
 * Parses a caught error object and returns a user-friendly string message.
 * Handles common API, network, and COC-specific error patterns.
 * @param error The unknown error object caught in a try-catch block.
 * @returns A user-friendly error message string.
 */
export const getSpecificErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    let message = error.message;

    // Try to parse JSON error messages (like FirestoreErrorInfo)
    try {
      if (message.startsWith('{') && message.includes('"error"')) {
        const parsed = JSON.parse(message);
        if (parsed.error) {
          message = parsed.error;
        }
      }
    } catch (e) {
      // Not a JSON string, use as is
    }

    // --- 1. Custom App Logic Errors ---
    const specificErrors = [
        "Account not found. Please contact administrator to create your account first. Google login is only for existing users.",
        "Account not found. Please contact the administrator to create your account.",
        "User account not found. Please contact the administrator.",
        "Account not found. Please contact the administrator."
    ];

    if (specificErrors.includes(message)) {
        return message;
    }

    // --- 2. Network & Connectivity Errors ---
    if (
        message.includes('Failed to fetch') || 
        message.includes('NetworkError') || 
        message.includes('network connection') ||
        message.includes('Network request failed')
    ) {
        return "It looks like we're offline. Please check your connection so we can get back to learning!";
    }

    // --- 3. Google GenAI / Gemini API Specific Errors ---
    
    // Rate Limiting / Quota
    if (message.includes('429') || message.includes('Resource has been exhausted') || message.includes('quota')) {
        return "We're a bit busy right now! Let's take a short breather and try again in a moment.";
    }

    // Server Overload
    if (message.includes('503') || message.includes('overloaded') || message.includes('The model is overloaded')) {
        return "The COC AI service is popular right now. Give it a few seconds and we'll be ready for you.";
    }

    // Safety Blocks
    if (
        message.includes('SAFETY') || 
        message.includes('blocked due to safety') || 
        message.includes('HARM_CATEGORY') ||
        message.includes('candidate was blocked')
    ) {
        return "We couldn't generate a response for that specific input. Let's try rephrasing it slightly to get better results.";
    }

    // Invalid Request / Bad Request
    if (message.includes('400') || message.includes('Invalid argument') || message.includes('INVALID_ARGUMENT')) {
        console.error("DEBUG 400 ERROR:", message, error);
        return `We couldn't quite understand that request. Try breaking it down. Details: ${message}. If this persists, please clear your cache.`;
    }

    // API Key Issues
    if (message.includes('API key not valid') || message.includes('API_KEY_INVALID') || message.includes('403')) {
        return "We're having trouble verifying your access configuration. Please contact support to get this sorted.";
    }

    // --- 4. Parsing & Format Errors ---
    if (
        message.includes('The AI returned an invalid response') ||
        message.includes('The AI returned a response that was not valid JSON') ||
        message.includes('The COC returned an invalid response') ||
        message.includes('The COC returned a response that was not valid JSON') ||
        message.includes('Unexpected token')
    ) {
        return "COC AI had a hiccup processing the data. Let's try generating that again—it usually works the second time!";
    }

    if (message.includes('The AI returned an empty response') || message.includes('The COC returned an empty response')) {
        return "COC AI needs a little more detail to give you a great answer. Try expanding your request.";
    }

    // --- 5. Firebase Auth & Firestore Errors ---
    const firebaseError = error as any;
    if (firebaseError.code) {
        switch (firebaseError.code) {
            case 'auth/popup-closed-by-user':
              return "Sign-in was cancelled. We're here when you're ready!";
            case 'auth/account-exists-with-different-credential':
              return "It looks like you already have an account with a different sign-in method. Please try that one.";
            case 'auth/network-request-failed':
              return "We couldn't reach the network. Please check your connection.";
            case 'auth/user-not-found':
              return "We couldn't find an account with those details. Please check your email or contact the administrator.";
            case 'auth/wrong-password':
              return "That password didn't match. Please try again or reset it.";
            case 'auth/invalid-email':
                return "That email address looks incomplete. Please check for typos.";
            case 'auth/user-disabled':
                return "This account is currently inactive. Please contact support for help.";
            case 'auth/email-already-in-use':
                return "Good news! This email is already registered. Please log in instead.";
            case 'auth/weak-password':
                return "For your security, please use a password with at least 6 characters.";
            case 'auth/operation-not-allowed':
                return "This sign-in method isn't enabled right now.";
            case 'auth/too-many-requests':
                return "We've seen too many attempts recently. Please take a short break before trying again.";
            case 'auth/invalid-credential':
                return "Those credentials didn't work. Let's try again.";
            case 'auth/credential-already-in-use':
                return "This account is already linked to another user.";
            case 'permission-denied':
                return "You don't have permission to access this. Please ensure you're logged in correctly.";
            case 'unavailable':
                return "The service is temporarily unavailable. We'll be back online shortly.";
            case 'not-found':
                return "We couldn't find the document you were looking for.";
        }
    }

    // Final generic fallback if no specific patterns match
    return message || "Something unexpected happened. Let's give it another shot.";
  }
  return "Something unexpected happened. Let's give it another shot.";
};
