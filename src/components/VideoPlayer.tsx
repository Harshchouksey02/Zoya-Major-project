import { useState } from 'react'
import { Play, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface VideoPlayerProps {
  title: string
  titleHindi?: string
  description: string
  videoId: string // YouTube video ID or full URL
  thumbnail?: string
  onPlay?: () => void
}

const VideoPlayer = ({ title, titleHindi, description, videoId, thumbnail, onPlay }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handlePlay = () => {
    setIsPlaying(true)
    onPlay?.()
  }

  const handleFullscreen = () => {
    setIsFullscreen(true)
  }

  const closeFullscreen = () => {
    setIsFullscreen(false)
    setIsPlaying(false)
  }

  // Extract YouTube video ID if full URL is provided
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    return match ? match[1] : url
  }

  const youtubeId = getYouTubeId(videoId)
  const thumbnailUrl = thumbnail || `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`

  return (
    <>
      <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="relative aspect-video bg-gray-100" onClick={handlePlay}>
          {!isPlaying ? (
            <>
              <img
                src={thumbnailUrl}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg?height=200&width=350&text=Video+Thumbnail'
                }}
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="bg-white/90 rounded-full p-4 hover:bg-white transition-colors">
                  <Play className="w-8 h-8 text-primary fill-primary" />
                </div>
              </div>
            </>
          ) : (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold text-primary mb-1">{title}</h3>
          {titleHindi && (
            <p className="text-sm font-medium text-muted-foreground mb-2">{titleHindi}</p>
          )}
          <p className="text-sm text-muted-foreground">{description}</p>
          
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={handlePlay}>
              <Play className="w-4 h-4 mr-2" />
              Play Video
            </Button>
            <Button variant="outline" size="sm" onClick={handleFullscreen}>
              Fullscreen
            </Button>
          </div>
        </div>
      </Card>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="relative w-full max-w-6xl aspect-video mx-4">
            <Button
              variant="ghost"
              size="sm"
              className="absolute -top-12 right-0 text-white hover:bg-white/20"
              onClick={closeFullscreen}
            >
              <X className="w-6 h-6" />
            </Button>
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
              className="w-full h-full rounded-lg"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  )
}

export default VideoPlayer