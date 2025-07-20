/**
 * UserProfile.tsx
 *
 * Displays user profile information and settings.
 * - Shows avatar, name, email, and editable profile fields.
 * - Responsive and accessible design.
 * - Includes authentication features and logout functionality.
 *
 * Dependencies:
 * - React
 * - UI primitives: Card, Avatar, Button
 * - Firebase Auth
 */

import * as React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  Mail, 
  Settings, 
  LogOut, 
  Edit3, 
  Save, 
  X,
  Shield,
  Bell,
  Palette
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { logOut } from "@/lib/firebase"
import { useNavigate } from "react-router-dom"

const LOCAL_KEY = 'userProfile'

function getLocalProfile() {
  return JSON.parse(localStorage.getItem(LOCAL_KEY) || 'null') || {
    name: "User",
    email: "",
    avatarUrl: "https://randomuser.me/api/portraits/lego/1.jpg"
  }
}

export function UserProfile() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = React.useState(getLocalProfile())
  const [editing, setEditing] = React.useState(false)
  const [form, setForm] = React.useState(profile)
  const [loading, setLoading] = React.useState(false)

  // Update profile when user changes
  React.useEffect(() => {
    if (user) {
      const updatedProfile = {
        ...profile,
        email: user.email || profile.email,
        name: user.displayName || profile.name
      }
      setProfile(updatedProfile)
      setForm(updatedProfile)
    }
  }, [user])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSave() {
    setProfile(form)
    localStorage.setItem(LOCAL_KEY, JSON.stringify(form))
    setEditing(false)
  }

  function handleCancel() {
    setForm(profile)
    setEditing(false)
  }

  async function handleLogout() {
    setLoading(true)
    try {
      const { error } = await logOut()
      if (error) {
        console.error('Logout error:', error)
      } else {
        navigate('/auth')
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-md mx-auto bg-card border-border">
          <CardHeader className="text-center pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="User Avatar"
                  className="w-20 h-20 rounded-full border-4 border-white"
                />
              ) : (
                <User className="w-12 h-12 text-white" />
              )}
            </motion.div>
            <CardTitle className="text-xl font-bold">
              {editing ? "Edit Profile" : "Profile"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage your account settings
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Profile Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Name
                </Label>
                {editing ? (
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                  />
                ) : (
                  <div className="p-3 bg-muted rounded-md text-sm">
                    {profile.name}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground">
                  {user?.email || profile.email}
                </div>
              </div>

              {editing && (
                <div className="space-y-2">
                  <Label htmlFor="avatarUrl" className="text-sm font-medium">
                    Avatar URL
                  </Label>
                  <Input
                    id="avatarUrl"
                    name="avatarUrl"
                    type="url"
                    value={form.avatarUrl}
                    onChange={handleChange}
                    placeholder="Enter avatar URL"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {editing ? (
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setEditing(true)}
                  className="w-full"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>

            <Separator />

            {/* Settings Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Settings</h3>
              
              <Button variant="ghost" className="w-full justify-start">
                <Shield className="w-4 h-4 mr-3" />
                Privacy & Security
              </Button>
              
              <Button variant="ghost" className="w-full justify-start">
                <Bell className="w-4 h-4 mr-3" />
                Notifications
              </Button>
              
              <Button variant="ghost" className="w-full justify-start">
                <Palette className="w-4 h-4 mr-3" />
                Appearance
              </Button>
            </div>

            <Separator />

            {/* Logout Section */}
            <div className="space-y-3">
              <Button
                variant="destructive"
                onClick={handleLogout}
                disabled={loading}
                className="w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {loading ? "Signing out..." : "Sign Out"}
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                {user?.isAnonymous ? "Guest Account" : "Signed in as " + (user?.email || "User")}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
