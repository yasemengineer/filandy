import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useNotes() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const data = await AsyncStorage.getItem('psiko_notes');
      if (data) setNotes(JSON.parse(data));
    } catch (e) {}
  };

  const saveNotes = async (newNotes) => {
    try {
      await AsyncStorage.setItem('psiko_notes', JSON.stringify(newNotes));
      setNotes(newNotes);
    } catch (e) {}
  };

  const addNote = async (title, content, tag, color) => {
    const newNote = {
      id: Date.now().toString(),
      title,
      content,
      tag,
      color,
      createdAt: new Date().toLocaleDateString('tr-TR'),
    };
    const newNotes = [newNote, ...notes];
    await saveNotes(newNotes);
  };

  const updateNote = async (id, title, content, tag, color) => {
    const newNotes = notes.map(n =>
      n.id === id ? { ...n, title, content, tag, color, updatedAt: new Date().toLocaleDateString('tr-TR') } : n
    );
    await saveNotes(newNotes);
  };

  const deleteNote = async (id) => {
    const newNotes = notes.filter(n => n.id !== id);
    await saveNotes(newNotes);
  };

  return { notes, addNote, updateNote, deleteNote, loadNotes };
}