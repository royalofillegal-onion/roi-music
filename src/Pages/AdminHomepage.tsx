import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/context/AdminContext";
import { ArrowLeft } from "lucide-react";
import HomepageSections from "@/components/admin/HomepageSections";

const AdminHomepage = () => {
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();


  if (!isAdmin) {
    navigate("/admin/login");
    return null;
  }

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

      <HomepageSections />
    </div>
  );
};

export default AdminHomepage;