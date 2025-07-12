
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/context/AdminContext";
import { LogOut, Music, Plus, Radio, Users } from "lucide-react";
import AdminSongForm from "@/components/admin/AdminSongForm";
import { songs, Song } from "@/data/songs";

const Admin = () => {
  const { isAdmin, logout } = useAdmin();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate("/admin/login");
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  return (
    <div className="container mx-auto p-4 pt-16 pb-24 md:pb-4 md:pl-24">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-gray-400">Manage songs, playlists, and homepage content</p>
        </div>
        <Button variant="ghost" onClick={logout} className="flex items-center gap-2">
          <LogOut size={16} />
          Logout
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Total Songs</h3>
          <p className="text-2xl font-bold text-green-400">{songs.length}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Trending Songs</h3>
          <p className="text-2xl font-bold text-blue-400">6</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Good Morning</h3>
          <p className="text-2xl font-bold text-purple-400">4</p>
        </div>
      </div>

      {/* Homepage Content Management */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Homepage Content Management</h2>
          <Link to="/admin/homepage">
            <Button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700">
              <Music size={16} />
              Manage Homepage Sections
            </Button>
          </Link>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <p className="text-gray-400 mb-4">
            Control which songs appear in the "Good Morning" and "Trending Now" sections on the homepage.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-purple-900/20 border border-purple-500/30 rounded p-3">
              <h4 className="font-medium text-purple-400 mb-1">Good Morning Section</h4>
              <p className="text-gray-400">Shows 1 featured song for morning listeners</p>
            </div>
            <div className="bg-blue-900/20 border border-blue-500/30 rounded p-3">
              <h4 className="font-medium text-blue-400 mb-1">Trending Now Section</h4>
              <p className="text-gray-400">Shows multiple trending songs</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Songs Database</h2>
          <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
            {showForm ? "Cancel" : <><Plus size={16} /> Add New Song</>}
          </Button>
        </div>

        {showForm && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <AdminSongForm onComplete={() => setShowForm(false)} />
          </div>
        )}

        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left">Title</th>
                  <th className="py-3 px-4 text-left">Artist</th>
                  <th className="py-3 px-4 text-left">Album</th>
                  <th className="py-3 px-4 text-left">Genre</th>
                  <th className="py-3 px-4 text-left">Duration</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {songs.map((song) => (
                  <tr key={song.id} className="border-t border-gray-700 hover:bg-gray-700/50">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded overflow-hidden flex-shrink-0">
                        <img src={song.imageUrl} alt={song.title} className="h-full w-full object-cover" />
                      </div>
                      {song.title}
                    </td>
                    <td className="py-3 px-4">{song.artist}</td>
                    <td className="py-3 px-4">{song.album || "-"}</td>
                    <td className="py-3 px-4">{song.genre || "-"}</td>
                    <td className="py-3 px-4">
                      {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm">Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
