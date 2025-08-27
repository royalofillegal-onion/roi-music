
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Song } from "@/data/songs";

// Form schema validation
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  artist: z.string().min(1, "Artist is required"),
  imageUrl: z.string().url("Must be a valid URL"),
  audioUrl: z.string().url("Must be a valid URL"),
  duration: z.number().min(1, "Duration must be at least 1 second"),
  album: z.string().optional(),
  year: z.number().optional(),
  genre: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AdminSongFormProps {
  song?: Song;
  onComplete: () => void;
}

const AdminSongForm = ({ song, onComplete }: AdminSongFormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: song || {
      title: "",
      artist: "",
      imageUrl: "",
      audioUrl: "",
      duration: 0,
      album: "",
      genre: "",
      year: new Date().getFullYear(),
    },
  });

  const onSubmit = (data: FormValues) => {
    // In a real app, this would send the data to a server
    // For this demo, we'll just show a success message
    console.log("New song data:", data);
    
    // Success notification
    toast.success(song ? "Song updated successfully" : "Song added successfully");
    
    // Reset form and close
    form.reset();
    onComplete();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Song title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="artist"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Artist</FormLabel>
                <FormControl>
                  <Input placeholder="Artist name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/image.jpg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="audioUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Audio URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/audio.mp3" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (seconds)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="120" 
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="album"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Album (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Album name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year (optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder={new Date().getFullYear().toString()} 
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value) || undefined)} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="genre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Genre (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Pop, Rock, Jazz, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onComplete}>
            Cancel
          </Button>
          <Button type="submit">
            {song ? "Update Song" : "Add Song"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AdminSongForm;
