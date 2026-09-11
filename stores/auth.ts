import { defineStore } from 'pinia'
import { PPMP_ROLE, areaOffices, officeUnits, ppmpRoles, type AreaOffice } from '~/data/reference'
import { DEFAULT_USER_ID, users, type DemoUser } from '~/data/demo'

/**
 * Who is using the demo.
 *
 * The real system took this from the session; here it is a chosen account. The
 * account matters because almost every PIMS page reads the viewer's PPMP role
 * to decide what it offers — the role switcher in the top bar is how the demo
 * shows those different views.
 */
export const useAuthStore = defineStore('auth', {
    state: () => ({
        userId: DEFAULT_USER_ID,
    }),

    getters: {
        accounts: (): DemoUser[] => users,

        user(state): DemoUser {
            return users.find((candidate) => candidate.id === state.userId) ?? users[0]
        },

        /** pims_ppmp_roles.id. Super Admin acts as PPMP Admin. */
        ppmpRoleId(): number {
            return this.user.is_super_admin ? PPMP_ROLE.admin : this.user.ppmp_role_id
        },

        ppmpRoleName(): string {
            return ppmpRoles.find((role) => role.id === this.ppmpRoleId)?.name ?? 'Employee'
        },

        isSuperAdmin(): boolean {
            return this.user.is_super_admin
        },

        isPpmpAdmin(): boolean {
            return [PPMP_ROLE.admin, PPMP_ROLE.supplyOfficer].includes(this.ppmpRoleId as 1 | 4)
        },

        /**
         * Closing a plan for review is the Super Admin's and the Supply
         * Designate's to make. It locks every participating Division/Field
         * Office out of its own project items, so it does not sit with the
         * offices whose work it stops.
         */
        canClosePpmp(): boolean {
            return [PPMP_ROLE.admin, PPMP_ROLE.supplyDesignate].includes(this.ppmpRoleId as 1 | 5)
        },

        /** Admin and Supply Officer decide on submissions and create plans. */
        canManagePpmp(): boolean {
            return [PPMP_ROLE.admin, PPMP_ROLE.supplyOfficer].includes(this.ppmpRoleId as 1 | 4)
        },

        /** The admin console is open to every PPMP role except a plain employee. */
        canAccessAdminConsole(): boolean {
            return this.ppmpRoleId !== PPMP_ROLE.employee
        },

        areaOffice(): AreaOffice | null {
            return areaOffices.find((office) => office.id === this.user.area_office_id) ?? null
        },

        areaOfficeName(): string {
            return this.areaOffice?.abbreviation ?? 'My Office'
        },

        officeUnitName(): string {
            return officeUnits.find((unit) => unit.id === this.user.office_unit_id)?.name ?? ''
        },

        initials(): string {
            const { first_name: first, last_name: last } = this.user

            return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
        },
    },

    actions: {
        signInAs(userId: number) {
            this.userId = userId
        },
    },
})
