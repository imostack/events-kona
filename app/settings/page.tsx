"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  CreditCard, 
  Globe, 
  Shield, 
  Trash2,
  ArrowLeft,
  Camera,
  Save
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

type SettingsTab = "account" | "profile" | "password" | "notifications" | "payment" | "privacy"

export default function SettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<SettingsTab>("account")
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  // Account Settings State
  const [accountData, setAccountData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profileImage: null as File | null,
  })

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Notification Settings State
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    eventReminders: true,
    promotions: false,
    newsletter: true,
    sms: false,
  })

  // Payment Settings State
  const [paymentData, setPaymentData] = useState({
    defaultCurrency: "NGN",
    paymentMethod: "stripe",
    accountNumber: "",
    bankName: "",
  })

  // Privacy Settings State
  const [privacyData, setPrivacyData] = useState({
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
    dataSharing: false,
  })

  const handleSave = () => {
    // Simulate save operation
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAccountData(prev => ({ ...prev, profileImage: file }))
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <div className="bg-card border-b border-border px-4 py-4">
          <div className="max-w-6xl mx-auto">
            <Link href="/">
              <button className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-4">
                <ArrowLeft size={20} />
                Back to Home
              </button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
          </div>
        </div>

        {/* Settings Content */}
        <section className="py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar Navigation */}
              <div className="lg:col-span-1">
                <nav className="space-y-1 bg-card border border-border rounded-lg p-2">
                  {[
                    { id: "account", label: "Account Info", icon: User },
                    { id: "profile", label: "Public Profile", icon: Globe },
                    { id: "password", label: "Password", icon: Lock },
                    { id: "notifications", label: "Notifications", icon: Bell },
                    { id: "payment", label: "Payment & Payout", icon: CreditCard },
                    { id: "privacy", label: "Privacy & Security", icon: Shield },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as SettingsTab)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <tab.icon size={20} />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                <div className="bg-card border border-border rounded-lg p-6">
                  {saveSuccess && (
                    <div className="bg-primary/20 border border-primary text-primary px-4 py-3 rounded-lg mb-6">
                      Settings saved successfully!
                    </div>
                  )}

                  {/* Account Info Tab */}
                  {activeTab === "account" && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold text-foreground mb-1">Account Information</h2>
                        <p className="text-muted-foreground">Update your personal details</p>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                            {accountData.profileImage ? (
                              <img 
                                src={URL.createObjectURL(accountData.profileImage)} 
                                alt="Profile" 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User size={40} className="text-muted-foreground" />
                            )}
                          </div>
                          <label 
                            htmlFor="profile-image" 
                            className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90"
                          >
                            <Camera size={16} />
                            <input
                              type="file"
                              id="profile-image"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">Profile Photo</p>
                          <p className="text-sm text-muted-foreground">JPG, PNG or GIF, max 5MB</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2">First Name</label>
                          <input
                            type="text"
                            value={accountData.firstName}
                            onChange={(e) => setAccountData({...accountData, firstName: e.target.value})}
                            placeholder="John"
                            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2">Last Name</label>
                          <input
                            type="text"
                            value={accountData.lastName}
                            onChange={(e) => setAccountData({...accountData, lastName: e.target.value})}
                            placeholder="Doe"
                            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Email</label>
                        <input
                          type="email"
                          value={accountData.email}
                          onChange={(e) => setAccountData({...accountData, email: e.target.value})}
                          placeholder="john.doe@example.com"
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={accountData.phone}
                          onChange={(e) => setAccountData({...accountData, phone: e.target.value})}
                          placeholder="+234 800 000 0000"
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                      >
                        <Save size={20} />
                        Save Changes
                      </button>
                    </div>
                  )}

                  {/* Public Profile Tab */}
                  {activeTab === "profile" && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold text-foreground mb-1">Public Profile</h2>
                        <p className="text-muted-foreground">Manage how others see your profile</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Bio</label>
                        <textarea
                          rows={4}
                          placeholder="Tell people about yourself..."
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Website</label>
                        <input
                          type="url"
                          placeholder="https://yourwebsite.com"
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Social Media Links</label>
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Twitter/X username"
                            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <input
                            type="text"
                            placeholder="Instagram username"
                            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <input
                            type="text"
                            placeholder="LinkedIn profile URL"
                            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                      >
                        <Save size={20} />
                        Save Changes
                      </button>
                    </div>
                  )}

                  {/* Password Tab */}
                  {activeTab === "password" && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold text-foreground mb-1">Change Password</h2>
                        <p className="text-muted-foreground">Update your password to keep your account secure</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Current Password</label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">New Password</label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                      >
                        <Save size={20} />
                        Update Password
                      </button>
                    </div>
                  )}

                  {/* Notifications Tab */}
                  {activeTab === "notifications" && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold text-foreground mb-1">Notification Preferences</h2>
                        <p className="text-muted-foreground">Choose how you want to be notified</p>
                      </div>

                      <div className="space-y-4">
                        {[
                          { key: "emailUpdates", label: "Email Updates", desc: "Receive updates about your events via email" },
                          { key: "eventReminders", label: "Event Reminders", desc: "Get reminders before your events start" },
                          { key: "promotions", label: "Promotions & Offers", desc: "Receive special offers and promotional content" },
                          { key: "newsletter", label: "Newsletter", desc: "Subscribe to our monthly newsletter" },
                          { key: "sms", label: "SMS Notifications", desc: "Receive text messages for important updates" },
                        ].map((item) => (
                          <div key={item.key} className="flex items-start justify-between p-4 border border-border rounded-lg">
                            <div className="flex-1">
                              <p className="font-semibold text-foreground">{item.label}</p>
                              <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer ml-4">
                              <input
                                type="checkbox"
                                checked={notifications[item.key as keyof typeof notifications]}
                                onChange={(e) => setNotifications({...notifications, [item.key]: e.target.checked})}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                      >
                        <Save size={20} />
                        Save Preferences
                      </button>
                    </div>
                  )}

                  {/* Payment Tab */}
                  {activeTab === "payment" && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold text-foreground mb-1">Payment & Payout Settings</h2>
                        <p className="text-muted-foreground">Manage your payment methods and payout preferences</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Default Currency</label>
                        <select
                          value={paymentData.defaultCurrency}
                          onChange={(e) => setPaymentData({...paymentData, defaultCurrency: e.target.value})}
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="NGN">Nigerian Naira (NGN)</option>
                          <option value="GHS">Ghanaian Cedi (GHS)</option>
                          <option value="KES">Kenyan Shilling (KES)</option>
                          <option value="USD">US Dollar (USD)</option>
                          <option value="EUR">Euro (EUR)</option>
                          <option value="GBP">British Pound (GBP)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Payment Processor</label>
                        <select
                          value={paymentData.paymentMethod}
                          onChange={(e) => setPaymentData({...paymentData, paymentMethod: e.target.value})}
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="stripe">Stripe</option>
                          <option value="paystack">Paystack</option>
                          <option value="flutterwave">Flutterwave</option>
                        </select>
                      </div>

                      <div className="border-t border-border pt-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Payout Details</h3>
                        
                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2">Bank Name</label>
                          <input
                            type="text"
                            value={paymentData.bankName}
                            onChange={(e) => setPaymentData({...paymentData, bankName: e.target.value})}
                            placeholder="Enter your bank name"
                            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>

                        <div className="mt-4">
                          <label className="block text-sm font-semibold text-foreground mb-2">Account Number</label>
                          <input
                            type="text"
                            value={paymentData.accountNumber}
                            onChange={(e) => setPaymentData({...paymentData, accountNumber: e.target.value})}
                            placeholder="Enter your account number"
                            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                      >
                        <Save size={20} />
                        Save Payment Settings
                      </button>
                    </div>
                  )}

                  {/* Privacy Tab */}
                  {activeTab === "privacy" && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold text-foreground mb-1">Privacy & Security</h2>
                        <p className="text-muted-foreground">Control your privacy and data sharing preferences</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Profile Visibility</label>
                        <select
                          value={privacyData.profileVisibility}
                          onChange={(e) => setPrivacyData({...privacyData, profileVisibility: e.target.value})}
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="public">Public - Anyone can see my profile</option>
                          <option value="private">Private - Only people I follow can see my profile</option>
                        </select>
                      </div>

                      <div className="space-y-4">
                        {[
                          { key: "showEmail", label: "Show Email on Profile", desc: "Allow others to see your email address" },
                          { key: "showPhone", label: "Show Phone on Profile", desc: "Allow others to see your phone number" },
                          { key: "dataSharing", label: "Data Sharing", desc: "Share anonymized data to improve our services" },
                        ].map((item) => (
                          <div key={item.key} className="flex items-start justify-between p-4 border border-border rounded-lg">
                            <div className="flex-1">
                              <p className="font-semibold text-foreground">{item.label}</p>
                              <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer ml-4">
                              <input
                                type="checkbox"
                                checked={privacyData[item.key as keyof typeof privacyData] as boolean}
                                onChange={(e) => setPrivacyData({...privacyData, [item.key]: e.target.checked})}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-border pt-6">
                        <h3 className="text-lg font-semibold text-destructive mb-2">Danger Zone</h3>
                        <div className="border border-destructive rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-foreground">Delete Account</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Permanently delete your account and all associated data
                              </p>
                            </div>
                            <button className="flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-semibold hover:bg-destructive/90 transition-colors ml-4">
                              <Trash2 size={16} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                      >
                        <Save size={20} />
                        Save Privacy Settings
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}