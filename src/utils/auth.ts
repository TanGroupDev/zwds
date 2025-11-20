export const login = (username: string, password: string) => {
  if (username === "TanGroup" && password === "Lauser@3a#") {
    localStorage.setItem("isLoggedIn", "true");
    return true;
  }
  return false;
};

export const logout = () => {
  localStorage.removeItem("isLoggedIn");
};

export const isLoggedIn = () => {
  return localStorage.getItem("isLoggedIn") === "true";
};
