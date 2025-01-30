"use client"

import { useState, useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import { Mic, Sun, Moon, Trash2, Edit2, Type } from "lucide-react"

interface Note {
  id: string
  text: string
}

export default function VoiceNotes() {
  const [isListening, setIsListening] = useState(false)
  const [notes, setNotes] = useState<Note[]>([])
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const editInputRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    setMounted(true)
    const savedNotes = localStorage.getItem("notes")
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes))
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("notes", JSON.stringify(notes))
    }
  }, [notes, mounted])

  const toggleListening = () => {
    if (!isListening) {
      startListening()
    } else {
      stopListening()
    }
  }

  const startListening = (noteId: string | null = null) => {
    setIsListening(true)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true

    let finalTranscript = ""

    recognitionRef.current.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " "
        }
      }
    }

    recognitionRef.current.onend = () => {
      if (finalTranscript) {
        if (noteId) {
          editNote(noteId, finalTranscript.trim())
        } else {
          addNote(finalTranscript.trim())
        }
      }
      setIsListening(false)
    }

    recognitionRef.current.start()
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  const addNote = (text: string) => {
    const newNote: Note = { id: Date.now().toString(), text }
    setNotes((prevNotes) => [newNote, ...prevNotes])
  }

  const deleteNote = (id: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id))
  }

  const editNote = (id: string, newText: string) => {
    setNotes((prevNotes) => prevNotes.map((note) => (note.id === id ? { ...note, text: newText } : note)))
    setEditingNoteId(null)
    setIsEditing(false)
  }

  const startEditing = (id: string) => {
    setEditingNoteId(id)
    setIsEditing(true)
  }

  const handleEditChoice = (choice: "voice" | "text", id: string) => {
    if (choice === "voice") {
      startListening(id)
    } else {
      setEditingNoteId(id)
      setTimeout(() => {
        editInputRef.current?.focus()
      }, 0)
    }
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  if (!mounted) return null

  return (
    <div className="flex min-h-screen flex-col">
      {/* Theme toggle */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center p-4">
        {/* Voice input section */}
        <div className="flex flex-col items-center justify-center min-h-[200px] w-full max-w-md mx-auto mb-8">
          <button
            onClick={toggleListening}
            className={`relative p-6 rounded-full ${
              isListening
                ? "bg-red-500 animate-pulse"
                : "bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-gray-200"
            } transition-all duration-300`}
          >
            <Mic className={`w-8 h-8 ${isListening ? "text-white" : "text-white dark:text-gray-900"}`} />
          </button>
          <p className="mt-4 text-lg font-medium">{isListening ? "Listening..." : "Tap to speak"}</p>
        </div>

        {/* Notes grid */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map((note) => (
            <div key={note.id} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 relative group">
              {editingNoteId === note.id ? (
                <textarea
                  ref={editInputRef}
                  className="w-full p-2 bg-white dark:bg-gray-700 rounded border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-0 transition-colors"
                  defaultValue={note.text}
                  onBlur={(e) => editNote(note.id, e.target.value)}
                  rows={4}
                />
              ) : (
                <p className="text-gray-900 dark:text-gray-100 mb-4">{note.text}</p>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => startEditing(note.id)}
                  className="p-1.5 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="p-1.5 rounded bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Edit options */}
              {isEditing && editingNoteId === note.id && (
                <div className="absolute inset-x-0 -bottom-12 flex justify-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-b-lg shadow-lg">
                  <button
                    onClick={() => handleEditChoice("voice", note.id)}
                    className="flex items-center gap-1 px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white text-sm"
                  >
                    <Mic className="w-3 h-3" />
                    <span>Voice</span>
                  </button>
                  <button
                    onClick={() => handleEditChoice("text", note.id)}
                    className="flex items-center gap-1 px-3 py-1 rounded bg-green-500 hover:bg-green-600 text-white text-sm"
                  >
                    <Type className="w-3 h-3" />
                    <span>Text</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

