'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { API_URL } from '../constants/config'

interface VideoMetadata {
  duration: string
  resolution: string
  codec: string
  bitrate: string
  frameRate: string
}

export default function VideoAnalyzer() {
  const [url, setUrl] = useState('')
  const [thumbnailBlob, setThumbnailBlob] = useState<Blob | null>(null)
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('')
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null)
  const [error, setError] = useState('')
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    if (thumbnailBlob) {
      const objectUrl = URL.createObjectURL(thumbnailBlob)
      setThumbnailUrl(objectUrl)
      return () => URL.revokeObjectURL(objectUrl)
    }
  }, [thumbnailBlob])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setThumbnailBlob(null)
    setThumbnailUrl('')
    setMetadata(null)

    try {
      const thumbnailResponse = await fetch(`${API_URL}/api/thumbnail?url=${encodeURIComponent(url)}`)
      if (!thumbnailResponse.ok) throw new Error('Failed to fetch thumbnail')
      setThumbnailBlob(await thumbnailResponse.blob())

      const metadataResponse = await fetch(`${API_URL}/api/metadata?url=${encodeURIComponent(url)}`)
      if (!metadataResponse.ok) throw new Error('Failed to fetch metadata')
      setMetadata(await metadataResponse.json())
    } catch (error) {
      console.log(error);
      setError('Error processing video. Please check the URL and try again.')
    }
  }

  const handleDownload = async () => {
    if (isDownloading) return
    setIsDownloading(true)
    try {
      const response = await fetch(`${API_URL}/api/download?url=${encodeURIComponent(url)}`)
      if (!response.ok) throw new Error('Failed to download video')

      const blob = await response.blob()
      const downloadUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = 'video'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.log(error)
      setError('Error downloading video. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="relative py-3 sm:max-w-xl sm:mx-auto">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
      <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
        <div className="max-w-md mx-auto">
          <div className="divide-y divide-gray-200">
            <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
              <h2 className="text-3xl font-extrabold text-gray-900">Videfly Video Analyzer</h2>
              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div className="rounded-md shadow-sm -space-y-px">
                  <div>
                    <label htmlFor="video-url" className="sr-only">Video URL</label>
                    <input
                      id="video-url"
                      name="url"
                      type="url"
                      required
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="Enter video URL"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Analyze Video
                  </button>
                </div>
              </form>

              {error && (
                <div className="mt-4 text-red-600">{error}</div>
              )}

              {thumbnailUrl && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900">Video Thumbnail</h3>
                  <div className="mt-2">
                    <Image src={thumbnailUrl} alt="Video Thumbnail" width={320} height={180} />
                  </div>
                </div>
              )}

              {metadata && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900">Video Metadata</h3>
                  <dl className="mt-2 border-t border-b border-gray-200 divide-y divide-gray-200">
                    {Object.entries(metadata).map(([key, value]) => (
                      <div key={key} className="py-3 flex justify-between text-sm font-medium">
                        <dt className="text-gray-500">{key.charAt(0).toUpperCase() + key.slice(1)}</dt>
                        <dd className="text-gray-900">{value}</dd>
                      </div>
                    ))}
                  </dl>
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className={`mt-4 w-full flex justify-center items-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white
                      ${isDownloading
                        ? 'bg-green-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'}
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                  >
                    {isDownloading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Downloading...
                      </>
                    ) : (
                      'Download Video'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}