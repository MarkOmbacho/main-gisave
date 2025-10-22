import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";

const Profile = () => {
  const { user, profile, loading, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [region, setRegion] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
        return;
      }
      
      // Set initial values from profile or user metadata
      if (profile) {
        setName(profile.name || '');
        setBio(profile.bio || '');
        setRegion(profile.region || '');
        setAvatarUrl(profile.avatar_url || null);
      } else {
        setName(user.user_metadata?.name || user.email?.split('@')[0] || '');
        setAvatarUrl(user.user_metadata?.avatar_url || null);
      }
    }
  }, [user, profile, loading, navigate]);

  const onUploadClick = () => {
    fileRef.current?.click();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(data.path);

        setAvatarUrl(publicUrl);
        toast({
          title: 'Upload successful',
          description: 'Your avatar was uploaded.',
        });
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast({
        title: 'Upload failed',
        description: err instanceof Error ? err.message : 'Failed to upload avatar',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      await updateProfile({
        name,
        bio,
        region,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      });

      // If we're in onboarding mode, redirect to dashboard
      const params = new URLSearchParams(window.location.search);
      if (params.get('onboard')) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Save error:', err);
      toast({
        title: 'Save failed',
        description: err instanceof Error ? err.message : 'Failed to save profile',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 flex flex-col items-center">
            <Avatar className="w-40 h-40 mb-4">
              {avatarUrl ? <AvatarImage src={avatarUrl} /> : <AvatarFallback className="text-3xl">{(name || "U").charAt(0)}</AvatarFallback>}
            </Avatar>
            <input ref={fileRef} onChange={handleFile} type="file" accept="image/*" className="hidden" />
            <Button onClick={onUploadClick} variant="outline">Upload Avatar</Button>
          </div>
          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Region</label>
              <Input value={region} onChange={(e) => setRegion(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
