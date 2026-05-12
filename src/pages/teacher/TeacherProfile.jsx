import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BadgeInfo,
  Building2,
  Camera,
  KeyRound,
  Mail,
  MapPin,
  UserRound,
  GraduationCap,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useAuthStore from '@/stores/useAuthStore';

const TeacherProfile = () => {
  const { user } = useAuthStore();
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    accountName: '',
    avatarUrl: '',
    bio: '',
    specialization: '',
    degree: '',
    workplace: '',
    email: '',
  });
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const profile = useMemo(() => {
    const fullName = user?.fullName || user?.username || 'Teacher';
    const initials = fullName
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return {
      fullName,
      accountName: user?.username || 'teacher',
      avatarUrl: user?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
      bio:
        user?.bio ||
        'Chemistry teacher focused on practical learning, clear explanations, and guided experimentation.',
      specialization: user?.specialization || 'Chemistry Education',
      degree: user?.degree || 'M.Sc. Chemistry',
      workplace: user?.workplace || 'ChemLearn Academy',
      email: user?.email || '-',
      initials,
    };
  }, [user]);

  useEffect(() => {
    setProfileForm({
      fullName: profile.fullName,
      accountName: profile.accountName,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
      specialization: profile.specialization,
      degree: profile.degree,
      workplace: profile.workplace,
      email: profile.email,
    });
  }, [profile]);

  const handlePasswordSubmit = (event) => {
    event.preventDefault();
    setStatusMessage('');
    setErrorMessage('');

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setErrorMessage('Please fill in all password fields.');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage('New password and confirmation do not match.');
      return;
    }

    setShowPasswordForm(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setStatusMessage('Password change form is ready for backend integration.');
  };

  const updatePasswordField = (field) => (event) => {
    setPasswordForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const updateProfileField = (field) => (event) => {
    setProfileForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleProfileSubmit = (event) => {
    event.preventDefault();
    setStatusMessage('');
    setErrorMessage('');

    const normalizedProfile = {
      fullName: profileForm.fullName.trim(),
      username: profileForm.accountName.trim(),
      avatarUrl: profileForm.avatarUrl.trim(),
      bio: profileForm.bio.trim(),
      specialization: profileForm.specialization.trim(),
      degree: profileForm.degree.trim(),
      workplace: profileForm.workplace.trim(),
      email: profileForm.email.trim(),
    };

    if (!normalizedProfile.fullName || !normalizedProfile.username || !normalizedProfile.email) {
      setErrorMessage('Fullname, account name, and email are required.');
      return;
    }

    updateProfile(normalizedProfile);
    setIsEditing(false);
    setStatusMessage('Profile updated successfully.');
  };

  const cancelProfileEdit = () => {
    setProfileForm({
      fullName: profile.fullName,
      accountName: profile.accountName,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
      specialization: profile.specialization,
      degree: profile.degree,
      workplace: profile.workplace,
      email: profile.email,
    });
    setIsEditing(false);
    setErrorMessage('');
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-6 text-white shadow-xl shadow-slate-950/20 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20 border border-white/20 shadow-lg shadow-black/20 lg:h-24 lg:w-24">
                <AvatarImage src={profile.avatarUrl} alt={profile.fullName} />
                <AvatarFallback className="bg-cyan-100 text-cyan-950 text-xl font-bold">
                  {profile.initials}
                </AvatarFallback>
              </Avatar>
              <span className="absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-cyan-400 text-cyan-950 shadow-lg shadow-cyan-950/30">
                <Camera className="h-4 w-4" />
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Teacher profile</p>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{profile.fullName}</h1>
              <p className="text-sm text-cyan-100/80">@{profile.accountName}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="secondary" className="rounded-full bg-white text-slate-950 hover:bg-cyan-100">
              <Link to="/teacher/dashboard">Back to dashboard</Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              onClick={() => setIsEditing((current) => !current)}
            >
              <Camera className="h-4 w-4" />
              {isEditing ? 'View profile' : 'Edit profile'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              onClick={() => setShowPasswordForm((current) => !current)}
            >
              <KeyRound className="h-4 w-4" />
              Change password
            </Button>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {statusMessage}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BadgeInfo className="h-5 w-5 text-cyan-600" />
              {isEditing ? 'Edit profile details' : 'Profile details'}
            </CardTitle>
            <CardDescription>
              {isEditing
                ? 'Update your public teaching profile and contact details.'
                : 'Your public teaching profile and contact details.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleProfileSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2">
                    <UserRound className="h-4 w-4" />
                    Fullname
                  </Label>
                  <Input id="fullName" value={profileForm.fullName} onChange={updateProfileField('fullName')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountName" className="flex items-center gap-2">
                    <UserRound className="h-4 w-4" />
                    Account name
                  </Label>
                  <Input id="accountName" value={profileForm.accountName} onChange={updateProfileField('accountName')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input id="email" type="email" value={profileForm.email} onChange={updateProfileField('email')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatarUrl" className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Avatar URL
                  </Label>
                  <Input
                    id="avatarUrl"
                    value={profileForm.avatarUrl}
                    onChange={updateProfileField('avatarUrl')}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workplace" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Workplace
                  </Label>
                  <Input id="workplace" value={profileForm.workplace} onChange={updateProfileField('workplace')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="degree" className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Degree
                  </Label>
                  <Input id="degree" value={profileForm.degree} onChange={updateProfileField('degree')} />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="specialization" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Specialization
                  </Label>
                  <Input
                    id="specialization"
                    value={profileForm.specialization}
                    onChange={updateProfileField('specialization')}
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="bio" className="flex items-center gap-2">
                    <BadgeInfo className="h-4 w-4" />
                    Bio
                  </Label>
                  <textarea
                    id="bio"
                    rows="5"
                    value={profileForm.bio}
                    onChange={updateProfileField('bio')}
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>

                <div className="flex flex-wrap gap-3 sm:col-span-2 pt-2">
                  <Button type="submit" className="rounded-full">
                    Save changes
                  </Button>
                  <Button type="button" variant="ghost" className="rounded-full" onClick={cancelProfileEdit}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-muted/30 p-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <UserRound className="h-4 w-4" />
                    Fullname
                  </p>
                  <p className="text-base font-semibold text-foreground">{profile.fullName}</p>
                </div>

                <div className="rounded-2xl border border-border bg-muted/30 p-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <UserRound className="h-4 w-4" />
                    Account name
                  </p>
                  <p className="text-base font-semibold text-foreground">@{profile.accountName}</p>
                </div>

                <div className="rounded-2xl border border-border bg-muted/30 p-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    Email
                  </p>
                  <p className="text-base font-semibold text-foreground break-all">{profile.email}</p>
                </div>

                <div className="rounded-2xl border border-border bg-muted/30 p-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    Workplace
                  </p>
                  <p className="text-base font-semibold text-foreground">{profile.workplace}</p>
                </div>

                <div className="rounded-2xl border border-border bg-muted/30 p-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <GraduationCap className="h-4 w-4" />
                    Degree
                  </p>
                  <p className="text-base font-semibold text-foreground">{profile.degree}</p>
                </div>

                <div className="rounded-2xl border border-border bg-muted/30 p-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    Specialization
                  </p>
                  <p className="text-base font-semibold text-foreground">{profile.specialization}</p>
                </div>

                <div className="rounded-2xl border border-border bg-muted/30 p-4 sm:col-span-2">
                  <p className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <BadgeInfo className="h-4 w-4" />
                    Bio
                  </p>
                  <p className="text-sm leading-6 text-foreground/90">{profile.bio}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Avatar</CardTitle>
              <CardDescription>
                Your profile picture shown across teacher pages.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 text-center">
              <Avatar className="h-28 w-28 border border-border shadow-md">
                <AvatarImage src={isEditing ? profileForm.avatarUrl || profile.avatarUrl : profile.avatarUrl} alt={profile.fullName} />
                <AvatarFallback className="bg-cyan-100 text-cyan-950 text-2xl font-bold">
                  {profile.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-semibold text-foreground">{profile.fullName}</p>
                <p className="text-sm text-muted-foreground">@{profile.accountName}</p>
              </div>
              {isEditing && (
                <p className="max-w-sm text-xs leading-5 text-muted-foreground">
                  Paste a public image URL to change the avatar preview and saved profile picture.
                </p>
              )}
            </CardContent>
          </Card>

          {showPasswordForm && (
            <Card className="border-cyan-200 bg-cyan-50/40 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Change password</CardTitle>
                <CardDescription>
                  Update your password from this profile page.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handlePasswordSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={updatePasswordField('currentPassword')}
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={updatePasswordField('newPassword')}
                      placeholder="Enter new password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm new password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={updatePasswordField('confirmPassword')}
                      placeholder="Repeat new password"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Button type="submit" className="rounded-full">
                      Save password
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="rounded-full"
                      onClick={() => setShowPasswordForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;
