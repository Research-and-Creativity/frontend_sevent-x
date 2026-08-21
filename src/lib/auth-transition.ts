export type AuthTransitionDirection = "to-register" | "to-login";

const TRANSITION_KEY = "auth-page-transition";

export function setAuthTransition(direction: AuthTransitionDirection) {
  sessionStorage.setItem(TRANSITION_KEY, direction);
}

export function getAuthTransition(): AuthTransitionDirection | null {
  const value = sessionStorage.getItem(TRANSITION_KEY);

  if (value === "to-register" || value === "to-login") {
    return value;
  }

  return null;
}

export function clearAuthTransition() {
  sessionStorage.removeItem(TRANSITION_KEY);
}
