import { useEffect, useState, useRef } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Profile = () => {
  const { user, loading, obtainBackendToken, updateProfileBackend, syncBackendUser } = useAuth();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [region, setRegion] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      return;
    }
    const init = async () => {
      if (!user) return;
      // populate fields from supabase profile as fallback
      setName((user.user_metadata as any)?.full_name || user.email || "");
      setAvatarUrl((user.user_metadata as any)?.avatar_url || null);

      // obtain backend token (if not present) so we can call backend
      await obtainBackendToken(user.email, (user.user_metadata as any)?.full_name, (user.user_metadata as any)?.avatar_url);

      // if backend_user_id is stored, fetch backend profile and prefill
      const backendId = localStorage.getItem('backend_user_id');
      if (backendId) {
        try {
          const resp = await fetch(`/users/${backendId}`);
          if (resp.ok) {
            const data = await resp.json();
            setName(data.name || (user.user_metadata as any)?.full_name || user.email || "");
            setBio(data.bio || "");
            setRegion(data.region || "");
            if (data.profile_photo_url) setAvatarUrl(data.profile_photo_url);
          }
        } catch (e) {
          console.error('failed to fetch backend profile', e);
        }
      }
    };
    init();
  }, [user, loading, obtainBackendToken]);

  const onUploadClick = () => {
    fileRef.current?.click();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !user) return;
    const form = new FormData();
    form.append('file', f);
    form.append('user_id', (user.id as unknown as string) || '');
    try {
      const res = await fetch('/users/upload-avatar', { method: 'POST', body: form });
      if (!res.ok) throw new Error('upload failed');
      const data = await res.json();
      setAvatarUrl(data.url);
      toast({ title: 'Upload successful', description: 'Your avatar was uploaded.', variant: 'default' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Upload failed', description: String(err), variant: 'destructive' });
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const payload: any = { name, bio, region };
      if (avatarUrl) payload.profile_photo_url = avatarUrl;

      const token = localStorage.getItem('backend_token');
      const backendId = localStorage.getItem('backend_user_id');

      // If we have a backend token, use protected endpoint
      if (token) {
        const res = await updateProfileBackend(payload);
        if (res && res.ok) {
          toast({ title: 'Profile saved', description: 'Your profile was updated.' });
          // navigate to dashboard after saving
          window.location.href = '/dashboard';
        } else {
          console.error('failed to save profile with token', res);
          toast({ title: 'Save failed', description: 'Could not save your profile', variant: 'destructive' });
        }
      } else if (backendId) {
        // Fallback: use dev-friendly public endpoint to allow onboarding without token
        try {
          const resp = await fetch(`/users/${backendId}/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (resp.ok) {
            // ensure backend user exists and obtain a token for future protected calls
            await obtainBackendToken(user.email, name, avatarUrl || undefined);
            toast({ title: 'Profile saved', description: 'Your profile was updated. You can now access protected features.' });
            window.location.href = '/dashboard';
          } else {
            const txt = await resp.text();
            console.error('fallback save failed', resp.status, txt);
            toast({ title: 'Save failed', description: 'Could not save your profile (fallback)', variant: 'destructive' });
          }
        } catch (e) {
          console.error('fallback save exception', e);
          toast({ title: 'Save failed', description: String(e), variant: 'destructive' });
        }
      } else {
        // No token and no backend id — try to sync backend user then save
        try {
          await syncBackendUser(user.email, name, avatarUrl || undefined, bio || undefined);
          const newToken = await obtainBackendToken(user.email, name, avatarUrl || undefined);
          if (newToken) {
            const res = await updateProfileBackend(payload);
            if (res && res.ok) {
              toast({ title: 'Profile saved', description: 'Your profile was updated.' });
              window.location.href = '/dashboard';
            } else {
              toast({ title: 'Save failed', description: 'Could not save after syncing', variant: 'destructive' });
            }
          } else {
            toast({ title: 'Save failed', description: 'Could not obtain backend token', variant: 'destructive' });
          }
        } catch (e) {
          console.error('sync-and-save failed', e);
          toast({ title: 'Save failed', description: String(e), variant: 'destructive' });
        }
      }
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
