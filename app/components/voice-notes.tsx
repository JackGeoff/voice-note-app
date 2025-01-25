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
  const recognitionRef = useRef<SpeechRecognition | null>(null)

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

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      //let interimTranscript = "" //removed
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " "
        }
        //else {
        //  interimTranscript += transcript
        //} //removed
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
    <div className="w-full max-w-4xl mx-auto">
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-200"
      >
        {theme === "dark" ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
      </button>
      <div className="flex flex-col items-center mb-8">
        <button
          onClick={toggleListening}
          className={`p-8 rounded-full ${
            isListening ? "bg-red-500 animate-pulse" : "bg-blue-500 hover:bg-blue-600"
          } transition-all duration-200 shadow-lg`}
        >
          <Mic className="w-12 h-12 text-white" />
        </button>
        <div className="mt-4 text-center">
          <p className="text-lg font-semibold">{isListening ? "Listening..." : "Tap to speak"}</p>
          {isListening && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Tap to stop recording</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notes.map((note) => (
          <div
            key={note.id}
            className={`p-4 rounded-lg shadow-md ${
              theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800"
            } transition-colors duration-200`}
          >
            {editingNoteId === note.id ? (
              <textarea
                ref={editInputRef}
                className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent"
                defaultValue={note.text}
                onBlur={(e) => editNote(note.id, e.target.value)}
              />
            ) : (
              <p>{note.text}</p>
            )}
            <div className="flex justify-end mt-2">
              <button
                onClick={() => startEditing(note.id)}
                className="p-1 mr-2 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors duration-200"
              >
                <Edit2 className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => deleteNote(note.id)}
                className="p-1 rounded-full bg-pink-500 hover:bg-pink-600 transition-colors duration-200"
              >
                <Trash2 className="w-4 h-4 text-white" />
              </button>
            </div>
            {isEditing && editingNoteId === note.id && (
              <div className="mt-2 flex justify-center space-x-2">
                <button
                  onClick={() => handleEditChoice("voice", note.id)}
                  className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEditChoice("text", note.id)}
                  className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-200"
                >
                  <Type className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}


