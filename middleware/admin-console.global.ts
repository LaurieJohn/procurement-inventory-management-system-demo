/**
 * The PIMS administration console is for the offices that review submissions.
 *
 * Switching accounts already returns to the dashboard, but the console has to
 * turn people away on its own too: a URL can be typed, pasted or reached with
 * the back button long after the account changed underneath it. This mirrors
 * the role gate the original route group carried — every PPMP role except a
 * plain Employee.
 */
export default defineNuxtRouteMiddleware((to) => {
    if (!to.path.startsWith('/PIMS/admin')) {
        return
    }

    const auth = useAuthStore()

    if (auth.canAccessAdminConsole) {
        return
    }

    return navigateTo('/dashboard', { replace: true })
})
