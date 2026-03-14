'use client'

import { Download, X } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { usePWAInstall } from '@/hooks/usePWAInstall'
import { toast } from 'sonner'

export default function PWAInstallPrompt() {
  const { isInstallable, isInstalled, install } = usePWAInstall()

  const handleInstall = async () => {
    const success = await install()
    if (success) {
      toast.success('Aplikasi berhasil diinstall!')
    } else {
      toast.error('Gagal menginstall aplikasi')
    }
  }

  if (!isInstallable || isInstalled) {
    return null
  }

  return (
    <Card className="mb-4 border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
              <Download className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Install Aplikasi</h3>
              <p className="text-xs text-muted-foreground">
                Install untuk akses lebih cepat offline
              </p>
            </div>
          </div>
          
          <Button 
            onClick={handleInstall}
            size="sm"
            className="shrink-0"
          >
            Install
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
