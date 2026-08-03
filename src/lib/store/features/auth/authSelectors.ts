import { RootState } from "@/lib/store";

export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectAuthToken = (state: RootState) => state.auth.token;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;

export const selectUserFullName = (state: RootState) => {
  const user = selectUser(state);
  if (!user) return null;
  return `${user.firstName} ${user.lastName}`;
};

export const selectUserEmail = (state: RootState) => {
  const user = selectUser(state);
  return user?.email || null;
};
