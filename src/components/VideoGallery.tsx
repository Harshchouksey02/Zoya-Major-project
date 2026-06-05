import VideoPlayer from './VideoPlayer'

const videoData = [
  {
    id: 1,
    title: "Coconut Micronutrient Powder Application Guide",
    titleHindi: "कोकोनट माइक्रोन्यूट्रिएंट पाउडर प्रयोग विधि",
    description: "Learn the proper method to apply Coconut Micronutrient Powder for maximum crop yield",
    descriptionHindi: "अधिकतम फसल उत्पादन के लिए कोकोनट माइक्रोन्यूट्रिएंट पाउडर का सही प्रयोग सीखें",
    videoId: "dQw4w9WgXcQ", // Replace with actual YouTube video ID
    category: "application",
    thumbnail: "/placeholder.svg?height=200&width=350&text=Application+Guide"
  },
  {
    id: 2,
    title: "Farmer Success Story - Wheat Crop",
    titleHindi: "किसान सफलता की कहानी - गेहूं की फसल",
    description: "See how Ramesh ji from Punjab increased his wheat yield by 40% using AgroVeda products",
    descriptionHindi: "देखें कैसे पंजाब के रमेश जी ने एग्रोवेदा उत्पादों से गेहूं की उत्पादकता 40% बढ़ाई",
    videoId: "dQw4w9WgXcQ", // Replace with actual YouTube video ID
    category: "success_story",
    thumbnail: "/placeholder.svg?height=200&width=350&text=Success+Story"
  }
]

const VideoGallery = () => {
  return (
    <div className="mb-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-primary mb-4">Product Demonstrations & Success Stories</h2>
        <p className="text-lg text-muted-foreground mb-2">
          उत्पाद प्रदर्शन और सफलता की कहानियां
        </p>
        <p className="text-base text-muted-foreground max-w-3xl mx-auto">
          Watch how our products work in real farming conditions and hear from farmers who have achieved remarkable results
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {videoData.map((video) => (
          <VideoPlayer
            key={video.id}
            title={video.title}
            titleHindi={video.titleHindi}
            description={video.description}
            videoId={video.videoId}
            thumbnail={video.thumbnail}
            onPlay={() => {
              // Track video play analytics
              console.log(`Playing video: ${video.title}`)
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default VideoGallery