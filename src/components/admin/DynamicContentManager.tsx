import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Save, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';

interface DynamicSection {
  id: string;
  name: string;
  type: string;
  position: number;
  is_active: boolean;
  config: any;
  created_at: string;
}

interface DynamicContent {
  id: string;
  content_type: string;
  title: string;
  description: string;
  metadata: any;
  media_url: string;
  thumbnail_url: string;
  is_featured: boolean;
  is_active: boolean;
  tags: string[];
  sort_order: number;
}

const DynamicContentManager: React.FC = () => {
  const [sections, setSections] = useState<DynamicSection[]>([]);
  const [content, setContent] = useState<DynamicContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingSection, setEditingSection] = useState<DynamicSection | null>(null);
  const [editingContent, setEditingContent] = useState<DynamicContent | null>(null);

  const loadSections = async () => {
    try {
      const { data, error } = await supabase
        .from('dynamic_sections')
        .select('*')
        .order('position');
      
      if (error) throw error;
      setSections(data || []);
    } catch (error: any) {
      toast.error('Failed to load sections: ' + error.message);
    }
  };

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('dynamic_content')
        .select('*')
        .order('sort_order');
      
      if (error) throw error;
      setContent(data || []);
    } catch (error: any) {
      toast.error('Failed to load content: ' + error.message);
    }
  };

  useEffect(() => {
    loadSections();
    loadContent();
  }, []);

  const createSection = async (sectionData: any) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('dynamic_sections')
        .insert([sectionData])
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('Section created successfully');
      loadSections();
      setEditingSection(null);
    } catch (error: any) {
      toast.error('Failed to create section: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateSection = async (id: string, updates: any) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('dynamic_sections')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Section updated successfully');
      loadSections();
      setEditingSection(null);
    } catch (error: any) {
      toast.error('Failed to update section: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteSection = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('dynamic_sections')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Section deleted successfully');
      loadSections();
    } catch (error: any) {
      toast.error('Failed to delete section: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateSectionPosition = async (id: string, newPosition: number) => {
    try {
      const { error } = await supabase
        .from('dynamic_sections')
        .update({ position: newPosition })
        .eq('id', id);
      
      if (error) throw error;
      
      loadSections();
    } catch (error: any) {
      toast.error('Failed to update position: ' + error.message);
    }
  };

  const SectionForm = ({ section }: { section?: DynamicSection }) => {
    const [formData, setFormData] = useState({
      name: section?.name || '',
      type: section?.type || 'slider',
      position: section?.position || 0,
      is_active: section?.is_active ?? true,
      config: JSON.stringify(section?.config || {}, null, 2)
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      try {
        const parsedConfig = JSON.parse(formData.config);
        const sectionData = {
          ...formData,
          config: parsedConfig
        };

        if (section) {
          updateSection(section.id, sectionData);
        } else {
          createSection(sectionData);
        }
      } catch (error) {
        toast.error('Invalid JSON in configuration');
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>{section ? 'Edit Section' : 'Create Section'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Section Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="type">Section Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hero">Hero</SelectItem>
                  <SelectItem value="slider">Slider</SelectItem>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="list">List</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="artists">Artists</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                type="number"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) })}
                required
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Active</Label>
            </div>
            
            <div>
              <Label htmlFor="config">Configuration (JSON)</Label>
              <Textarea
                id="config"
                value={formData.config}
                onChange={(e) => setFormData({ ...formData, config: e.target.value })}
                rows={6}
                placeholder='{"layout": "banner", "autoplay": true}'
              />
            </div>
            
            <div className="flex space-x-2">
              <Button type="submit" disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {section ? 'Update' : 'Create'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditingSection(null)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dynamic Content Manager</h1>
        <Button onClick={() => setEditingSection({} as DynamicSection)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>
      </div>

      <Tabs defaultValue="sections" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="space-y-6">
          {editingSection && <SectionForm section={editingSection.id ? editingSection : undefined} />}
          
          <div className="grid gap-4">
            {sections.map((section, index) => (
              <Card key={section.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col space-y-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateSectionPosition(section.id, section.position - 1)}
                          disabled={index === 0}
                        >
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateSectionPosition(section.id, section.position + 1)}
                          disabled={index === sections.length - 1}
                        >
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold">{section.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Type: {section.type} | Position: {section.position}
                        </p>
                      </div>
                      
                      <Badge variant={section.is_active ? 'default' : 'secondary'}>
                        {section.is_active ? (
                          <>
                            <Eye className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingSection(section)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteSection(section.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="content">
          <div className="text-center py-12 text-muted-foreground">
            <p>Content management coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="text-center py-12 text-muted-foreground">
            <p>Analytics dashboard coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DynamicContentManager;