import { QRCodeSVG } from 'qrcode.react'

export default function QRCode({ value, size = 128 }: { value: string; size?: number }) {
  return (
    <div className="bg-white p-3 rounded-xl inline-block">
      <QRCodeSVG value={value} size={size} />
    </div>
  )
}
