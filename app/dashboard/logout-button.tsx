'use client'

import { logoutCandidate } from '@/actions/auth'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  return (
    <form action={logoutCandidate}>
      <Button variant="ghost" type="submit" size="sm" className="text-muted-foreground hover:text-foreground text-xs">
        Sign Out
      </Button>
    </form>
  )
}
