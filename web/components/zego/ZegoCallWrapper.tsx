import dynamic from "next/dynamic"
import { ComponentProps } from "react"

const ZegoUIKitPrebuiltComponent = dynamic(
  () =>
    import("@zegocloud/zego-uikit-prebuilt").then((mod) => {
      return mod.ZegoUIKitPrebuilt as any
    }),
  {
    ssr: false,
    loading: () => <div className="w-full h-full bg-gray-900 flex items-center justify-center">Loading video...</div>,
  }
)

export function ZegoCallWrapper(
  props: React.ComponentProps<any>
) {
  return <ZegoUIKitPrebuiltComponent {...props} />
}
