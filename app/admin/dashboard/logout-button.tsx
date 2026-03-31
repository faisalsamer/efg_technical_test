'use client'

import { logoutAdmin } from '@/actions/auth'
import { Button } from '@/components/ui/button'

export function AdminLogoutButton() {
  return (
    <form action={logoutAdmin}>
      <Button variant="ghost" type="submit" size="sm" className="text-muted-foreground hover:text-foreground text-xs">
        Sign Out
      </Button>
    </form>
  )
}
