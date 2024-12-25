'use client'

import dynamic from 'next/dynamic'

const VideoAnalyzer = dynamic(
  () => import('./VideoAnalyzer'),
  { ssr: false }
)

export default function ClientVideoAnalyzer() {
  return <VideoAnalyzer />
}