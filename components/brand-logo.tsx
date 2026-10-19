import Image from 'next/image'

export function BrandLogo({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="Ezyfusion Group logo"
      width={size}
      height={size}
      loading="eager"
      className={className}
    />
  )
}
