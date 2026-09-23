export function mapFirebaseAuthError(error: unknown) {
  if (error instanceof Error) {
    const code = (error as { code?: string }).code;
    switch (code) {
      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "Invalid email or password. If you created this account with Google, use \"Continue with Google\" or \"Forgot password?\".";
      case "auth/invalid-email":
        return "Enter a valid email address.";
      case "auth/user-disabled":
        return "This account has been disabled.";
      case "auth/too-many-requests":
        return "Too many attempts. Please try again later.";
      case "auth/email-already-in-use":
        return "An account with this email already exists. Sign in with that account, or click \"Continue with Google\".";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      case "auth/network-request-failed":
        return "Network error. Check your internet connection and try again.";
      default:
        return error.message || "Something went wrong. Please try again.";
    }
  }
  return "Something went wrong. Please try again.";
}