export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  const isLoginRoute = to.path === '/login'

  if (!auth.isAuthenticated && !isLoginRoute) {
    return navigateTo('/login')
  }

  if (auth.isAuthenticated && isLoginRoute) {
    return navigateTo(auth.isAdministrator ? '/admin/dashboard' : '/resources')
  }

  if (to.path.startsWith('/admin') && !auth.isAdministrator) {
    return navigateTo('/resources')
  }
})
