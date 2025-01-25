import VoiceNotes from "./components/voice-notes"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 transition-colors duration-500">
      <VoiceNotes />
    </main>
  )
}


