
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Feedback = () => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStarClick = (value: number) => {
    setRating(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating || !feedback.trim()) {
      toast.error("Please provide a rating and feedback");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      // Create form data for FormSubmit
      const formData = new FormData();
      formData.append('name', name.trim() || "Anonymous");
      formData.append('email', email.trim() || "noreply@royalstar.com");
      formData.append('rating', rating.toString());
      formData.append('feedback', feedback.trim());
      formData.append('user_id', session?.user?.id || 'guest');
      formData.append('_subject', `New Feedback from ROI MUSIC - ${rating} stars`);
      formData.append('_captcha', 'false');
      formData.append('_template', 'table');
      formData.append('_next', window.location.origin + '/feedback?success=true');

      // Submit to FormSubmit
      const response = await fetch('https://formsubmit.co/royalofillegal@gmail.com', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        // Reset form
        setRating(0);
        setFeedback("");
        setEmail("");
        setName("");
        
        toast.success("Thank you for your feedback! We appreciate your input.");
      } else {
        throw new Error('Failed to submit feedback');
      }
      
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-6 pb-32 md:pb-40 px-4 md:px-8 md:ml-16">
      <h1 className="text-3xl font-bold mb-6 mt-2">Feedback</h1>
      
      <Card className="max-w-2xl bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-xl">Tell us what you think!</CardTitle>
          <p className="text-gray-400">
            We value your opinion and would love to hear about your experience with ROI MUSIC.
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>Rate your experience</Label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-8 w-8 cursor-pointer transition-colors ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-400 hover:text-yellow-400"
                    }`}
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="name">Name (Optional)</Label>
              <Input
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="bg-gray-800 border-gray-700 mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="bg-gray-800 border-gray-700 mt-1"
              />
              <p className="text-xs text-gray-400 mt-1">
                We'll only use this to follow up if needed
              </p>
            </div>

            <div>
              <Label htmlFor="feedback">Your Feedback</Label>
              <Textarea
                id="feedback"
                name="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us what you love, what could be improved, or any suggestions you have..."
                className="bg-gray-800 border-gray-700 mt-1 min-h-[120px]"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-music-accent hover:bg-music-accent/90 text-black"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Feedback;
