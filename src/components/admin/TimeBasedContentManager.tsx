
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sunrise, Sun, Sunset, Moon, Save, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TimeBasedContent {
  id: string;
  time_period: 'morning' | 'afternoon' | 'evening' | 'night';
  content_type: 'featured_songs' | 'featured_playlists' | 'banner';
  content_data: any;
  is_active: boolean;
}

const TimeBasedContentManager = () => {
  const [contents, setContents] = useState<TimeBasedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');
  const [bannerText, setBannerText] = useState('');

  const timePeriods = [
    { value: 'morning', label: 'Morning (5AM - 11AM)', icon: <Sunrise className="h-4 w-4" /> },
    { value: 'afternoon', label: 'Afternoon (12PM - 5PM)', icon: <Sun className="h-4 w-4" /> },
    { value: 'evening', label: 'Evening (6PM - 9PM)', icon: <Sunset className="h-4 w-4" /> },
    { value: 'night', label: 'Night (10PM - 4AM)', icon: <Moon className="h-4 w-4" /> }
  ];

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('time_based_content')
        .select('*')
        .order('time_period', { ascending: true });

      if (error) throw error;
      setContents(data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const saveBannerContent = async () => {
    try {
      setSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Please log in to save content');
        return;
      }

      const { error } = await supabase
        .from('time_based_content')
        .upsert({
          time_period: selectedPeriod,
          content_type: 'banner',
          content_data: { message: bannerText },
          is_active: true,
          created_by: session.user.id
        });

      if (error) throw error;

      toast.success('Banner content saved successfully');
      fetchContent();
    } catch (error) {
      console.error('Error saving banner content:', error);
      toast.error('Failed to save banner content');
    } finally {
      setSaving(false);
    }
  };

  const getCurrentPeriodContent = (period: string, type: string) => {
    return contents.find(c => c.time_period === period && c.content_type === type);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-music-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Time-Based Content Management</h2>
        <Badge variant="outline" className="text-music-accent border-music-accent">
          Admin Only
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {timePeriods.map((period) => (
          <Card key={period.value} className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                {period.icon}
                {period.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs text-gray-400">
                Banner: {getCurrentPeriodContent(period.value, 'banner')?.content_data?.message || 'Not set'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          {timePeriods.map((period) => (
            <TabsTrigger key={period.value} value={period.value} className="flex items-center gap-1">
              {period.icon}
              <span className="hidden sm:inline">{period.value}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {timePeriods.map((period) => (
          <TabsContent key={period.value} value={period.value} className="space-y-4">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {period.icon}
                  {period.label} - Banner Message
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={bannerText}
                  onChange={(e) => setBannerText(e.target.value)}
                  placeholder={`Enter banner message for ${period.value}...`}
                  className="bg-gray-800 border-gray-700"
                  rows={3}
                />
                
                <Button
                  onClick={saveBannerContent}
                  disabled={saving}
                  className="bg-music-accent hover:bg-music-accent/90 text-black"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Banner
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default TimeBasedContentManager;
