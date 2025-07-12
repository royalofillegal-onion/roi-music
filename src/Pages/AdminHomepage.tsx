import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/context/AdminContext";
import { ArrowLeft, Plus, Trash2, Music, AlertCircle } from "lucide-react";
import { uniqueSongs } from "@/data/allSongs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HomepageSection {
  id: string;
  section_name: string;
  song_id: string;
  position: number;
  created_at: string;
  updated_at: string;
}

const AdminHomepage = () => {
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSong, setSelectedSong] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>("");

  useEffect(() => {
    if (!isAdmin) {
      navigate("/admin/login");
      return;
    }
    fetchSections();
  }, [isAdmin, navigate]);

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from('homepage_sections')
        .select('*')
        .order('section_name', { ascending: true })
        .order('position', { ascending: true });

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error('Error fetching sections:', error);
      toast.error('Failed to load homepage sections');
    } finally {
      setLoading(false);
    }
  };

  const getSongById = (songId: string) => {
    return uniqueSongs.find(song => song.id === songId);
  };

  const getSectionSongs = (sectionName: string) => {
    return sections
      .filter(section => section.section_name === sectionName)
      .map(section => {
        const song = getSongById(section.song_id);
        return { ...section, song };
      })
      .filter(item => item.song);
  };

  const addSongToSection = async () => {
    if (!selectedSong || !selectedSection) {
      toast.error('Please select both a song and a section');
      return;
    }

    try {
      // Check if song already exists in this section
      const existingSong = sections.find(
        section => section.section_name === selectedSection && section.song_id === selectedSong
      );

      if (existingSong) {
        toast.error('This song is already in the selected section');
        return;
      }

      // For Good Morning, limit to 1 song
      if (selectedSection === 'Good Morning') {
        const goodMorningSongs = getSectionSongs('Good Morning');
        if (goodMorningSongs.length >= 1) {
          toast.error('Good Morning section can only have 1 song. Please remove the existing song first.');
          return;
        }
      }

      // Get next position
      const sectionSongs = getSectionSongs(selectedSection);
      const nextPosition = Math.max(0, ...sectionSongs.map(s => s.position)) + 1;

      const { error } = await supabase
        .from('homepage_sections')
        .insert([{
          section_name: selectedSection,
          song_id: selectedSong,
          position: nextPosition
        }]);

      if (error) throw error;

      toast.success('Song added to section successfully');
      setDialogOpen(false);
      setSelectedSong("");
      setSelectedSection("");
      fetchSections();
    } catch (error) {
      console.error('Error adding song:', error);
      toast.error('Failed to add song to section');
    }
  };

  const removeSongFromSection = async (sectionId: string, sectionName: string, songTitle: string) => {
    try {
      const { error } = await supabase
        .from('homepage_sections')
        .delete()
        .eq('id', sectionId);

      if (error) throw error;

      toast.success(`Removed "${songTitle}" from ${sectionName}`);
      fetchSections();
    } catch (error) {
      console.error('Error removing song:', error);
      toast.error('Failed to remove song from section');
    }
  };

  if (!isAdmin) return null;

  if (loading) {
    return (
      <div className="container mx-auto p-4 pt-16 pb-24 md:pb-4 md:pl-24">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
        </div>
      </div>
    );
  }

  const goodMorningSongs = getSectionSongs('Good Morning');
  const trendingNowSongs = getSectionSongs('Trending Now');

  return (
    <div className="container mx-auto p-4 pt-16 pb-24 md:pb-4 md:pl-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Admin
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Homepage Sections Manager</h1>
          <p className="text-gray-400">Manage songs displayed in Good Morning and Trending Now sections</p>
        </div>
      </div>

      {/* Add Song Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className="mb-6 flex items-center gap-2">
            <Plus size={16} />
            Add Song to Section
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-400">Add Song to Homepage Section</DialogTitle>
            <DialogDescription className="text-gray-400">
              Select a song and section to add it to the homepage
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Section</label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger className="bg-gray-800 border-gray-600">
                  <SelectValue placeholder="Select a section" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="Good Morning">Good Morning (Max 1 song)</SelectItem>
                  <SelectItem value="Trending Now">Trending Now</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Song</label>
              <Select value={selectedSong} onValueChange={setSelectedSong}>
                <SelectTrigger className="bg-gray-800 border-gray-600">
                  <SelectValue placeholder="Select a song" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600 max-h-60">
                  {uniqueSongs.map((song) => (
                    <SelectItem key={song.id} value={song.id}>
                      {song.title} - {song.artist}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={addSongToSection} 
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={!selectedSong || !selectedSection}
            >
              Add Song
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sections Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Good Morning Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
              <Music size={20} />
              Good Morning
            </h3>
            <span className="text-sm text-gray-400">
              {goodMorningSongs.length}/1 songs
            </span>
          </div>
          
          {goodMorningSongs.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <AlertCircle size={48} className="mx-auto mb-2 opacity-50" />
              <p>No songs in Good Morning section</p>
              <p className="text-sm">Click "Add Song to Section" to add one</p>
            </div>
          ) : (
            <div className="space-y-3">
              {goodMorningSongs.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <div className="flex items-center gap-3">
                    <img 
                      src={item.song?.imageUrl} 
                      alt={item.song?.title} 
                      className="w-12 h-12 rounded object-cover" 
                    />
                    <div>
                      <p className="font-medium">{item.song?.title}</p>
                      <p className="text-sm text-gray-400">{item.song?.artist}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    onClick={() => removeSongFromSection(item.id, 'Good Morning', item.song?.title || '')}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trending Now Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-400 flex items-center gap-2">
              <Music size={20} />
              Trending Now
            </h3>
            <span className="text-sm text-gray-400">
              {trendingNowSongs.length} songs
            </span>
          </div>
          
          {trendingNowSongs.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <AlertCircle size={48} className="mx-auto mb-2 opacity-50" />
              <p>No songs in Trending Now section</p>
              <p className="text-sm">Click "Add Song to Section" to add some</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {trendingNowSongs.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <div className="flex items-center gap-3">
                    <img 
                      src={item.song?.imageUrl} 
                      alt={item.song?.title} 
                      className="w-12 h-12 rounded object-cover" 
                    />
                    <div>
                      <p className="font-medium">{item.song?.title}</p>
                      <p className="text-sm text-gray-400">{item.song?.artist}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    onClick={() => removeSongFromSection(item.id, 'Trending Now', item.song?.title || '')}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <h4 className="font-semibold text-blue-400 mb-2">Instructions:</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• <strong>Good Morning:</strong> Can only have 1 song (displays single card on homepage)</li>
          <li>• <strong>Trending Now:</strong> Can have multiple songs (displays multiple cards)</li>
          <li>• Changes are reflected immediately on the homepage</li>
          <li>• Remove existing songs by clicking the trash icon</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminHomepage;