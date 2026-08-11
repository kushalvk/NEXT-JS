/** Validation rules shared by signup, profile updates and password resets. */

export const PASSWORD_RULE = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
export const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const USERNAME_RULE = /^[a-zA-Z0-9_.-]{3,30}$/;

export const PASSWORD_REQUIREMENT =
    "Password must be at least 8 characters and include an uppercase letter, a lowercase letter and a number";

export const USERNAME_REQUIREMENT =
    "Username must be 3-30 characters, using letters, numbers, dot, dash or underscore";
