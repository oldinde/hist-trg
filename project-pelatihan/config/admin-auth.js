window.ADMIN_USERNAME_MAP = {
  admin: "kppindeotd@gmail.com"
};

function getAdminEmailFromUsername(username) {
  if (!username) return null;
  const normalized = String(username).trim().toLowerCase();
  return window.ADMIN_USERNAME_MAP[normalized] || null;
}

async function requireAdminSession() {
  const { data, error } = await window.sb.auth.getSession();

  if (error || !data.session) {
    window.location.href = "admin-login.html";
    return null;
  }

  return data.session;
}

async function logoutAdmin() {
  await window.sb.auth.signOut();
  window.location.href = "admin-login.html";
}
