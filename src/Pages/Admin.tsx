
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
          <p className="text-gray-400">Manage songs and playlists</p>
        </div>
        <Button variant="ghost" onClick={logout} className="flex items-center gap-2">
          <LogOut size={16} />
          Logout
        </Button>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Songs Management</h2>
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
