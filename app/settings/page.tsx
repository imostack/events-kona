"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import {
  User,
  Lock,
  Bell,
  CreditCard,
  Shield,
  Trash2,
  ArrowLeft,
  Camera,
  Save,
  Building2,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Heart,
  ExternalLink,
  Loader2,
  Eye,
  EyeOff,
  Copy,
  Check
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { apiClient, ApiError } from "@/lib/api-client"

type SettingsTab = "account" | "organizer" | "password" | "notifications" | "payout" | "preferences" | "privacy"

interface Bank {
  id: string
  name: string
  code: string
}

export default function SettingsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<SettingsTab>("account")
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
  const [saveError, setSaveError] = useState("")
  const [isVerifyingAccount, setIsVerifyingAccount] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Nigerian Banks (would come from API in production)
  const nigerianBanks: Bank[] = [
    { id: "1", name: "Access Bank", code: "044" },
    { id: "2", name: "First Bank of Nigeria", code: "011" },
    { id: "3", name: "Guaranty Trust Bank", code: "058" },
    { id: "4", name: "United Bank for Africa", code: "033" },
    { id: "5", name: "Zenith Bank", code: "057" },
    { id: "6", name: "Fidelity Bank", code: "070" },
    { id: "7", name: "Union Bank", code: "032" },
    { id: "8", name: "Sterling Bank", code: "232" },
    { id: "9", name: "Wema Bank", code: "035" },
    { id: "10", name: "Stanbic IBTC Bank", code: "221" },
    { id: "11", name: "Polaris Bank", code: "076" },
    { id: "12", name: "Ecobank Nigeria", code: "050" },
    { id: "13", name: "Keystone Bank", code: "082" },
    { id: "14", name: "FCMB", code: "214" },
    { id: "15", name: "Kuda Bank", code: "090267" },
    { id: "16", name: "Opay", code: "100004" },
    { id: "17", name: "Palmpay", code: "100033" },
    { id: "18", name: "Moniepoint", code: "100022" },
  ]

  const ghanaianBanks: Bank[] = [
    { id: "1", name: "GCB Bank", code: "040" },
    { id: "2", name: "Ecobank Ghana", code: "130" },
    { id: "3", name: "Fidelity Bank Ghana", code: "240" },
    { id: "4", name: "Stanbic Bank Ghana", code: "190" },
    { id: "5", name: "Absa Bank Ghana", code: "030" },
    { id: "6", name: "Standard Chartered Ghana", code: "020" },
    { id: "7", name: "Zenith Bank Ghana", code: "120" },
    { id: "8", name: "Access Bank Ghana", code: "280" },
    { id: "9", name: "CalBank", code: "140" },
    { id: "10", name: "MTN Mobile Money", code: "MTN" },
  ]

  const kenyanBanks: Bank[] = [
    { id: "1", name: "Kenya Commercial Bank", code: "01" },
    { id: "2", name: "Equity Bank", code: "68" },
    { id: "3", name: "Co-operative Bank", code: "11" },
    { id: "4", name: "ABSA Bank Kenya", code: "03" },
    { id: "5", name: "Standard Chartered Kenya", code: "02" },
    { id: "6", name: "Stanbic Bank Kenya", code: "31" },
    { id: "7", name: "NCBA Bank", code: "07" },
    { id: "8", name: "I&M Bank", code: "57" },
    { id: "9", name: "DTB Bank", code: "63" },
    { id: "10", name: "M-Pesa", code: "MPESA" },
  ]

  // Account Settings State
  const [accountData, setAccountData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profileImage: null as File | null,
    profileImageUrl: "",
  })

  // Organizer Profile State
  const [organizerData, setOrganizerData] = useState({
    isOrganizer: false,
    organizerName: "",
    organizerSlug: "",
    bio: "",
    logo: null as File | null,
    logoUrl: "",
    website: "",
    twitter: "",
    instagram: "",
    linkedin: "",
  })
  // Track if user was originally an organizer (from DB) vs just setting up locally
  const [wasOriginallyOrganizer, setWasOriginallyOrganizer] = useState(false)

  // Load user data from API
  const loadUserData = useCallback(async () => {
    try {
      setIsDataLoading(true)
      const data = await apiClient<{
        id: string
        email: string
        firstName: string
        lastName: string
        phone: string | null
        bio: string | null
        avatarUrl: string | null
        role: string
        preferences: Record<string, unknown> | null
        notificationSettings: Record<string, unknown> | null
        organizerName: string | null
        organizerSlug: string | null
        organizerBio: string | null
        organizerWebsite: string | null
      }>("/api/auth/onboarding")

      // Populate account data
      setAccountData(prev => ({
        ...prev,
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        phone: data.phone || "",
        profileImageUrl: data.avatarUrl || "",
      }))

      // Populate organizer data
      const isOrg = data.role === "ORGANIZER" || data.role === "ADMIN"
      setWasOriginallyOrganizer(isOrg)
      setOrganizerData(prev => ({
        ...prev,
        isOrganizer: isOrg,
        organizerName: data.organizerName || "",
        organizerSlug: data.organizerSlug || "",
        bio: data.organizerBio || "",
        website: data.organizerWebsite || "",
      }))

      // Populate preferences from stored preferences JSON
      if (data.preferences) {
        const prefs = data.preferences as Record<string, unknown>
        setPreferences(prev => ({
          ...prev,
          preferredCategories: (prefs.preferredCategories as string[]) || prev.preferredCategories,
          preferredLocation: (prefs.preferredLocation as string) || prev.preferredLocation,
          preferredCountry: (prefs.preferredCountry as string) || prev.preferredCountry,
          showFreeEventsFirst: (prefs.showFreeEventsFirst as boolean) || prev.showFreeEventsFirst,
          defaultCurrency: (prefs.defaultCurrency as string) || prev.defaultCurrency,
        }))
      }

      // Populate notification settings
      if (data.notificationSettings) {
        const notifs = data.notificationSettings as Record<string, unknown>
        setNotifications(prev => ({
          ...prev,
          emailUpdates: notifs.emailUpdates as boolean ?? prev.emailUpdates,
          eventReminders: notifs.eventReminders as boolean ?? prev.eventReminders,
          promotions: notifs.promotions as boolean ?? prev.promotions,
          newsletter: notifs.newsletter as boolean ?? prev.newsletter,
          sms: notifs.sms as boolean ?? prev.sms,
          organizerFollows: notifs.organizerFollows as boolean ?? prev.organizerFollows,
          ticketSales: notifs.ticketSales as boolean ?? prev.ticketSales,
          payoutAlerts: notifs.payoutAlerts as boolean ?? prev.payoutAlerts,
        }))
      }
    } catch (error) {
      console.error("Failed to load user data:", error)
    } finally {
      setIsDataLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user, loadUserData])

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Notification Settings State (defaults, overwritten by loadUserData)
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    eventReminders: true,
    promotions: false,
    newsletter: false,
    sms: false,
    organizerFollows: true,
    ticketSales: true,
    payoutAlerts: true,
  })

  // Payout Settings State
  const [payoutData, setPayoutData] = useState({
    country: "Nigeria",
    currency: "NGN",
    bankCode: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
    isVerified: false,
    verificationStatus: "unverified" as "unverified" | "verifying" | "verified" | "failed",
  })

  // Event Preferences State (defaults, overwritten by loadUserData)
  const [preferences, setPreferences] = useState({
    preferredCategories: [] as string[],
    preferredLocation: "",
    preferredCountry: "Nigeria",
    showFreeEventsFirst: false,
    defaultCurrency: "NGN",
  })

  // Privacy Settings State
  const [privacyData, setPrivacyData] = useState({
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
    dataSharing: false,
    twoFactorEnabled: false,
    twoFactorMethod: "authenticator" as "authenticator" | "sms",
  })

  // 2FA Setup State
  const [twoFactorSetup, setTwoFactorSetup] = useState({
    isSettingUp: false,
    qrCode: "",
    secretKey: "JBSWY3DPEHPK3PXP", // Would come from API
    verificationCode: "",
  })

  const eventCategories = [
    { id: "music", label: "Music" },
    { id: "tech", label: "Technology" },
    { id: "business", label: "Business" },
    { id: "sports", label: "Sports" },
    { id: "arts", label: "Arts & Culture" },
    { id: "food", label: "Food & Drink" },
    { id: "education", label: "Education" },
    { id: "health", label: "Health & Wellness" },
    { id: "community", label: "Community" },
    { id: "entertainment", label: "Entertainment" },
  ]

  const getBanksForCountry = (country: string): Bank[] => {
    switch (country) {
      case "Nigeria": return nigerianBanks
      case "Ghana": return ghanaianBanks
      case "Kenya": return kenyanBanks
      default: return nigerianBanks
    }
  }

  const getCurrencyForCountry = (country: string): string => {
    switch (country) {
      case "Nigeria": return "NGN"
      case "Ghana": return "GHS"
      case "Kenya": return "KES"
      default: return "NGN"
    }
  }

  const showSuccess = (message: string = "Settings saved successfully!") => {
    setSaveError("")
    setSaveMessage(message)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const showError = (message: string) => {
    setSaveSuccess(false)
    setSaveError(message)
    setTimeout(() => setSaveError(""), 5000)
  }

  // Save Account Info
  const handleSaveAccount = async () => {
    setIsSaving(true)
    try {
      await apiClient("/api/auth/onboarding", {
        method: "POST",
        body: JSON.stringify({
          firstName: accountData.firstName,
          lastName: accountData.lastName,
          phone: accountData.phone,
        }),
      })
      showSuccess("Account information saved!")
    } catch (error) {
      showError(error instanceof ApiError ? error.message : "Failed to save account info")
    } finally {
      setIsSaving(false)
    }
  }

  // Save Organizer Profile
  const handleSaveOrganizer = async () => {
    if (!organizerData.organizerName.trim()) {
      showError("Organization name is required")
      return
    }
    setIsSaving(true)
    try {
      await apiClient("/api/auth/onboarding", {
        method: "POST",
        body: JSON.stringify({
          // Only send becomeOrganizer if user wasn't originally an organizer
          becomeOrganizer: !wasOriginallyOrganizer ? true : undefined,
          organizerName: organizerData.organizerName,
          organizerBio: organizerData.bio || undefined,
          organizerWebsite: organizerData.website || undefined,
        }),
      })
      showSuccess("Organizer profile saved!")
      await loadUserData() // Refresh to get updated role/slug
    } catch (error) {
      showError(error instanceof ApiError ? error.message : "Failed to save organizer profile")
    } finally {
      setIsSaving(false)
    }
  }

  // Change Password
  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError("New passwords do not match")
      return
    }
    if (passwordData.newPassword.length < 8) {
      showError("Password must be at least 8 characters")
      return
    }
    setIsSaving(true)
    try {
      await apiClient("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      showSuccess("Password changed successfully!")
    } catch (error) {
      showError(error instanceof ApiError ? error.message : "Failed to change password")
    } finally {
      setIsSaving(false)
    }
  }

  // Save Notification Settings
  const handleSaveNotifications = async () => {
    setIsSaving(true)
    try {
      await apiClient("/api/auth/onboarding", {
        method: "POST",
        body: JSON.stringify({
          notificationSettings: notifications,
        }),
      })
      showSuccess("Notification preferences saved!")
    } catch (error) {
      showError(error instanceof ApiError ? error.message : "Failed to save notification preferences")
    } finally {
      setIsSaving(false)
    }
  }

  // Save Event Preferences
  const handleSavePreferences = async () => {
    setIsSaving(true)
    try {
      await apiClient("/api/auth/onboarding", {
        method: "POST",
        body: JSON.stringify({
          preferences: preferences,
        }),
      })
      showSuccess("Event preferences saved!")
    } catch (error) {
      showError(error instanceof ApiError ? error.message : "Failed to save event preferences")
    } finally {
      setIsSaving(false)
    }
  }

  // Save Privacy Settings (stored in preferences for now)
  const handleSavePrivacy = async () => {
    setIsSaving(true)
    try {
      await apiClient("/api/auth/onboarding", {
        method: "POST",
        body: JSON.stringify({
          preferences: {
            ...preferences,
            privacy: privacyData,
          },
        }),
      })
      showSuccess("Privacy settings saved!")
    } catch (error) {
      showError(error instanceof ApiError ? error.message : "Failed to save privacy settings")
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: "profile" | "logo") => {
    const file = e.target.files?.[0]
    if (file) {
      if (type === "profile") {
        setAccountData(prev => ({ ...prev, profileImage: file }))
      } else {
        setOrganizerData(prev => ({ ...prev, logo: file }))
      }
    }
  }

  const handleVerifyBankAccount = async () => {
    if (!payoutData.accountNumber || !payoutData.bankCode) {
      return
    }
    
    setIsVerifyingAccount(true)
    setPayoutData(prev => ({ ...prev, verificationStatus: "verifying" }))
    
    // Simulate Paystack account verification API call
    setTimeout(() => {
      // Simulated success response
      setPayoutData(prev => ({ 
        ...prev, 
        accountName: "JOHN DOE",
        isVerified: true,
        verificationStatus: "verified"
      }))
      setIsVerifyingAccount(false)
    }, 2000)
  }

  const handleCountryChange = (country: string) => {
    setPayoutData(prev => ({
      ...prev,
      country,
      currency: getCurrencyForCountry(country),
      bankCode: "",
      bankName: "",
      accountNumber: "",
      accountName: "",
      isVerified: false,
      verificationStatus: "unverified"
    }))
  }

  const handleBankChange = (bankCode: string) => {
    const banks = getBanksForCountry(payoutData.country)
    const selectedBank = banks.find(b => b.code === bankCode)
    setPayoutData(prev => ({
      ...prev,
      bankCode,
      bankName: selectedBank?.name || "",
      accountName: "",
      isVerified: false,
      verificationStatus: "unverified"
    }))
  }

  const toggleCategory = (categoryId: string) => {
    setPreferences(prev => ({
      ...prev,
      preferredCategories: prev.preferredCategories.includes(categoryId)
        ? prev.preferredCategories.filter(c => c !== categoryId)
        : [...prev.preferredCategories, categoryId]
    }))
  }

  const handleCopySecretKey = () => {
    navigator.clipboard.writeText(twoFactorSetup.secretKey)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handleEnable2FA = () => {
    if (twoFactorSetup.verificationCode.length === 6) {
      setPrivacyData(prev => ({ ...prev, twoFactorEnabled: true }))
      setTwoFactorSetup(prev => ({ ...prev, isSettingUp: false, verificationCode: "" }))
      handleSave("Two-factor authentication enabled!")
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
                <nav className="space-y-1 bg-card border border-border rounded-lg p-2 sticky top-4">
                  {[
                    { id: "account", label: "Account Info", icon: User },
                    { id: "organizer", label: "Organizer Profile", icon: Building2 },
                    { id: "password", label: "Password", icon: Lock },
                    { id: "notifications", label: "Notifications", icon: Bell },
                    { id: "payout", label: "Payout Settings", icon: CreditCard },
                    { id: "preferences", label: "Event Preferences", icon: Heart },
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
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                      <CheckCircle2 size={20} />
                      {saveMessage}
                    </div>
                  )}

                  {saveError && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                      <AlertCircle size={20} />
                      {saveError}
                    </div>
                  )}

                  {isDataLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="animate-spin text-primary" size={32} />
                      <span className="ml-3 text-muted-foreground">Loading your settings...</span>
                    </div>
                  ) : (
                    <>
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
                            ) : accountData.profileImageUrl ? (
                              <img 
                                src={accountData.profileImageUrl} 
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
                              onChange={(e) => handleImageChange(e, "profile")}
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
                        onClick={handleSaveAccount}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                        {isSaving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  )}

                  {/* Organizer Profile Tab */}
                  {activeTab === "organizer" && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold text-foreground mb-1">Organizer Profile</h2>
                        <p className="text-muted-foreground">Manage your public organizer profile visible to attendees</p>
                      </div>

                      {!organizerData.isOrganizer ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                          <Building2 size={48} className="mx-auto text-blue-600 mb-4" />
                          <h3 className="text-lg font-semibold text-foreground mb-2">Become an Organizer</h3>
                          <p className="text-muted-foreground mb-4">Create events and build your audience on EventsKona</p>
                          <button 
                            onClick={() => setOrganizerData(prev => ({ ...prev, isOrganizer: true }))}
                            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold hover:bg-primary/90"
                          >
                            Set Up Organizer Profile
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* Organizer Logo */}
                          <div className="flex items-center gap-6">
                            <div className="relative">
                              <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
                                {organizerData.logo ? (
                                  <img 
                                    src={URL.createObjectURL(organizerData.logo)} 
                                    alt="Logo" 
                                    className="w-full h-full object-cover"
                                  />
                                ) : organizerData.logoUrl ? (
                                  <img 
                                    src={organizerData.logoUrl} 
                                    alt="Logo" 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Building2 size={40} className="text-muted-foreground" />
                                )}
                              </div>
                              <label 
                                htmlFor="org-logo" 
                                className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90"
                              >
                                <Camera size={16} />
                                <input
                                  type="file"
                                  id="org-logo"
                                  accept="image/*"
                                  onChange={(e) => handleImageChange(e, "logo")}
                                  className="hidden"
                                />
                              </label>
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">Organization Logo</p>
                              <p className="text-sm text-muted-foreground">Square image recommended, max 5MB</p>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">Organization Name *</label>
                            <input
                              type="text"
                              value={organizerData.organizerName}
                              onChange={(e) => setOrganizerData({...organizerData, organizerName: e.target.value})}
                              placeholder="Your Organization Name"
                              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">Profile URL</label>
                            <div className="flex">
                              <span className="inline-flex items-center px-4 py-2 border border-r-0 border-border rounded-l-lg bg-muted text-muted-foreground text-sm">
                                eventskona.com/organizer/
                              </span>
                              <input
                                type="text"
                                value={organizerData.organizerSlug}
                                onChange={(e) => setOrganizerData({...organizerData, organizerSlug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                                placeholder="your-name"
                                className="flex-1 px-4 py-2 border border-border rounded-r-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">Bio</label>
                            <textarea
                              rows={4}
                              value={organizerData.bio}
                              onChange={(e) => setOrganizerData({...organizerData, bio: e.target.value})}
                              placeholder="Tell attendees about your organization..."
                              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            />
                            <p className="text-xs text-muted-foreground mt-1">{organizerData.bio.length}/500 characters</p>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">Website</label>
                            <input
                              type="url"
                              value={organizerData.website}
                              onChange={(e) => setOrganizerData({...organizerData, website: e.target.value})}
                              placeholder="https://yourwebsite.com"
                              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-foreground mb-3">Social Media Links</label>
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <span className="w-24 text-sm text-muted-foreground">Twitter/X</span>
                                <div className="flex-1 flex">
                                  <span className="inline-flex items-center px-3 py-2 border border-r-0 border-border rounded-l-lg bg-muted text-muted-foreground text-sm">@</span>
                                  <input
                                    type="text"
                                    value={organizerData.twitter}
                                    onChange={(e) => setOrganizerData({...organizerData, twitter: e.target.value})}
                                    placeholder="username"
                                    className="flex-1 px-4 py-2 border border-border rounded-r-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="w-24 text-sm text-muted-foreground">Instagram</span>
                                <div className="flex-1 flex">
                                  <span className="inline-flex items-center px-3 py-2 border border-r-0 border-border rounded-l-lg bg-muted text-muted-foreground text-sm">@</span>
                                  <input
                                    type="text"
                                    value={organizerData.instagram}
                                    onChange={(e) => setOrganizerData({...organizerData, instagram: e.target.value})}
                                    placeholder="username"
                                    className="flex-1 px-4 py-2 border border-border rounded-r-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="w-24 text-sm text-muted-foreground">LinkedIn</span>
                                <input
                                  type="url"
                                  value={organizerData.linkedin}
                                  onChange={(e) => setOrganizerData({...organizerData, linkedin: e.target.value})}
                                  placeholder="https://linkedin.com/company/..."
                                  className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                              </div>
                            </div>
                          </div>

                          {organizerData.organizerSlug && (
                            <div className="bg-muted rounded-lg p-4 flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">Your public profile</p>
                                <p className="font-medium text-foreground">eventskona.com/organizer/{organizerData.organizerSlug}</p>
                              </div>
                              <Link href={`/organizer/${organizerData.organizerSlug}`} target="_blank">
                                <button className="flex items-center gap-2 text-primary hover:text-primary/80">
                                  <ExternalLink size={18} />
                                  View Profile
                                </button>
                              </Link>
                            </div>
                          )}

                          <button
                            onClick={handleSaveOrganizer}
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                          >
                            {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                            {isSaving ? "Saving..." : "Save Organizer Profile"}
                          </button>
                        </>
                      )}
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
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">New Password</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Minimum 8 characters with uppercase, lowercase, and number</p>
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
                        onClick={handleChangePassword}
                        disabled={isSaving || !passwordData.currentPassword || !passwordData.newPassword}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                        {isSaving ? "Updating..." : "Update Password"}
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

                      <div>
                        <h3 className="font-semibold text-foreground mb-3">General</h3>
                        <div className="space-y-3">
                          {[
                            { key: "emailUpdates", label: "Email Updates", desc: "Receive updates about your events via email" },
                            { key: "eventReminders", label: "Event Reminders", desc: "Get reminders before events you're attending" },
                            { key: "newsletter", label: "Newsletter", desc: "Subscribe to our weekly newsletter" },
                            { key: "promotions", label: "Promotions & Offers", desc: "Receive special offers and promotional content" },
                          ].map((item) => (
                            <div key={item.key} className="flex items-start justify-between p-4 border border-border rounded-lg">
                              <div className="flex-1">
                                <p className="font-medium text-foreground">{item.label}</p>
                                <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
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
                      </div>

                      <div>
                        <h3 className="font-semibold text-foreground mb-3">Organizer Notifications</h3>
                        <div className="space-y-3">
                          {[
                            { key: "ticketSales", label: "Ticket Sales", desc: "Get notified when someone purchases tickets" },
                            { key: "organizerFollows", label: "New Followers", desc: "Get notified when someone follows your organizer profile" },
                            { key: "payoutAlerts", label: "Payout Alerts", desc: "Get notified about payout status and disbursements" },
                          ].map((item) => (
                            <div key={item.key} className="flex items-start justify-between p-4 border border-border rounded-lg">
                              <div className="flex-1">
                                <p className="font-medium text-foreground">{item.label}</p>
                                <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
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
                      </div>

                      <div>
                        <h3 className="font-semibold text-foreground mb-3">SMS Notifications</h3>
                        <div className="flex items-start justify-between p-4 border border-border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-foreground">SMS Alerts</p>
                            <p className="text-sm text-muted-foreground mt-0.5">Receive text messages for important updates (may incur carrier charges)</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer ml-4">
                            <input
                              type="checkbox"
                              checked={notifications.sms}
                              onChange={(e) => setNotifications({...notifications, sms: e.target.checked})}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>
                      </div>

                      <button
                        onClick={handleSaveNotifications}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                        {isSaving ? "Saving..." : "Save Preferences"}
                      </button>
                    </div>
                  )}

                  {/* Payout Tab */}
                  {activeTab === "payout" && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold text-foreground mb-1">Payout Settings</h2>
                        <p className="text-muted-foreground">Set up your bank account to receive payouts from ticket sales</p>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                        <CreditCard size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-blue-900">Payouts are processed via <strong>Paystack</strong> within 24-48 hours after your event ends. A 5% platform fee is deducted from ticket sales.</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Country *</label>
                        <select
                          value={payoutData.country}
                          onChange={(e) => handleCountryChange(e.target.value)}
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="Nigeria">Nigeria</option>
                          <option value="Ghana">Ghana</option>
                          <option value="Kenya">Kenya</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2">Currency</label>
                          <input
                            type="text"
                            value={payoutData.currency}
                            disabled
                            className="w-full px-4 py-2 border border-border rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2">Bank *</label>
                          <select
                            value={payoutData.bankCode}
                            onChange={(e) => handleBankChange(e.target.value)}
                            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="">Select Bank</option>
                            {getBanksForCountry(payoutData.country).map(bank => (
                              <option key={bank.id} value={bank.code}>{bank.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Account Number *</label>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={payoutData.accountNumber}
                            onChange={(e) => {
                              setPayoutData({
                                ...payoutData, 
                                accountNumber: e.target.value,
                                accountName: "",
                                isVerified: false,
                                verificationStatus: "unverified"
                              })
                            }}
                            placeholder={payoutData.country === "Nigeria" ? "10-digit account number" : "Account number"}
                            maxLength={payoutData.country === "Nigeria" ? 10 : 20}
                            className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <button
                            onClick={handleVerifyBankAccount}
                            disabled={!payoutData.accountNumber || !payoutData.bankCode || isVerifyingAccount}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {isVerifyingAccount ? (
                              <>
                                <Loader2 size={18} className="animate-spin" />
                                Verifying...
                              </>
                            ) : (
                              "Verify"
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Verification Status */}
                      {payoutData.verificationStatus === "verified" && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 size={24} className="text-green-600" />
                            <div>
                              <p className="font-semibold text-green-800">Account Verified</p>
                              <p className="text-green-700">{payoutData.accountName}</p>
                              <p className="text-sm text-green-600">{payoutData.bankName} - {payoutData.accountNumber}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {payoutData.verificationStatus === "failed" && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <AlertCircle size={24} className="text-red-600" />
                            <div>
                              <p className="font-semibold text-red-800">Verification Failed</p>
                              <p className="text-sm text-red-600">Please check your account number and try again</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => handleSave("Payout settings saved!")}
                        disabled={!payoutData.isVerified}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save size={20} />
                        Save Payout Settings
                      </button>
                    </div>
                  )}

                  {/* Event Preferences Tab */}
                  {activeTab === "preferences" && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold text-foreground mb-1">Event Preferences</h2>
                        <p className="text-muted-foreground">Personalize your event discovery experience</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-3">Preferred Categories</label>
                        <p className="text-sm text-muted-foreground mb-3">Select categories you're interested in to get better recommendations</p>
                        <div className="flex flex-wrap gap-2">
                          {eventCategories.map(category => (
                            <button
                              key={category.id}
                              onClick={() => toggleCategory(category.id)}
                              className={`px-4 py-2 rounded-full border-2 font-medium transition-all ${
                                preferences.preferredCategories.includes(category.id)
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-background text-foreground hover:border-primary/50"
                              }`}
                            >
                              {category.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2">Preferred Country</label>
                          <select
                            value={preferences.preferredCountry}
                            onChange={(e) => setPreferences({...preferences, preferredCountry: e.target.value})}
                            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="Nigeria">Nigeria</option>
                            <option value="Ghana">Ghana</option>
                            <option value="Kenya">Kenya</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2">Preferred City</label>
                          <input
                            type="text"
                            value={preferences.preferredLocation}
                            onChange={(e) => setPreferences({...preferences, preferredLocation: e.target.value})}
                            placeholder="e.g., Lagos, Accra, Nairobi"
                            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Default Currency</label>
                        <select
                          value={preferences.defaultCurrency}
                          onChange={(e) => setPreferences({...preferences, defaultCurrency: e.target.value})}
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="NGN">Nigerian Naira (₦)</option>
                          <option value="GHS">Ghanaian Cedi (₵)</option>
                          <option value="KES">Kenyan Shilling (KSh)</option>
                          <option value="USD">US Dollar ($)</option>
                        </select>
                      </div>

                      <div className="flex items-start justify-between p-4 border border-border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-foreground">Show Free Events First</p>
                          <p className="text-sm text-muted-foreground mt-0.5">Prioritize free events in your search results</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                          <input
                            type="checkbox"
                            checked={preferences.showFreeEventsFirst}
                            onChange={(e) => setPreferences({...preferences, showFreeEventsFirst: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>

                      <button
                        onClick={handleSavePreferences}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                        {isSaving ? "Saving..." : "Save Preferences"}
                      </button>
                    </div>
                  )}

                  {/* Privacy Tab */}
                  {activeTab === "privacy" && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold text-foreground mb-1">Privacy & Security</h2>
                        <p className="text-muted-foreground">Control your privacy and account security</p>
                      </div>

                      {/* Two-Factor Authentication */}
                      <div className="border border-border rounded-lg p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <Smartphone size={20} className="text-green-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">Two-Factor Authentication</p>
                              <p className="text-sm text-muted-foreground mt-1">Add an extra layer of security to your account</p>
                              {privacyData.twoFactorEnabled && (
                                <span className="inline-flex items-center gap-1 mt-2 text-green-600 text-sm font-medium">
                                  <CheckCircle2 size={16} />
                                  Enabled
                                </span>
                              )}
                            </div>
                          </div>
                          {!privacyData.twoFactorEnabled && !twoFactorSetup.isSettingUp && (
                            <button
                              onClick={() => setTwoFactorSetup(prev => ({ ...prev, isSettingUp: true }))}
                              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
                            >
                              Enable
                            </button>
                          )}
                          {privacyData.twoFactorEnabled && (
                            <button
                              onClick={() => setPrivacyData(prev => ({ ...prev, twoFactorEnabled: false }))}
                              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50"
                            >
                              Disable
                            </button>
                          )}
                        </div>

                        {/* 2FA Setup Flow */}
                        {twoFactorSetup.isSettingUp && !privacyData.twoFactorEnabled && (
                          <div className="mt-6 pt-6 border-t border-border space-y-4">
                            <div>
                              <p className="font-medium text-foreground mb-2">1. Scan QR Code</p>
                              <p className="text-sm text-muted-foreground mb-3">Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)</p>
                              <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center border">
                                {/* Placeholder for QR code - in production, this would be an actual QR code */}
                                <div className="text-center">
                                  <div className="w-32 h-32 bg-gray-900 rounded mx-auto mb-2" style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='white' width='100' height='100'/%3E%3Crect fill='black' x='10' y='10' width='10' height='10'/%3E%3Crect fill='black' x='20' y='10' width='10' height='10'/%3E%3Crect fill='black' x='30' y='10' width='10' height='10'/%3E%3C/svg%3E")`,
                                    backgroundSize: 'cover'
                                  }}></div>
                                  <p className="text-xs text-muted-foreground">QR Code</p>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <p className="font-medium text-foreground mb-2">Or enter this code manually:</p>
                              <div className="flex items-center gap-2">
                                <code className="bg-muted px-4 py-2 rounded-lg font-mono text-sm flex-1">{twoFactorSetup.secretKey}</code>
                                <button 
                                  onClick={handleCopySecretKey}
                                  className="p-2 hover:bg-muted rounded-lg"
                                >
                                  {copiedCode ? <Check size={20} className="text-green-600" /> : <Copy size={20} />}
                                </button>
                              </div>
                            </div>

                            <div>
                              <p className="font-medium text-foreground mb-2">2. Enter Verification Code</p>
                              <p className="text-sm text-muted-foreground mb-3">Enter the 6-digit code from your authenticator app</p>
                              <div className="flex gap-3">
                                <input
                                  type="text"
                                  value={twoFactorSetup.verificationCode}
                                  onChange={(e) => setTwoFactorSetup(prev => ({ ...prev, verificationCode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                                  placeholder="000000"
                                  maxLength={6}
                                  className="w-32 px-4 py-2 border border-border rounded-lg bg-background text-foreground text-center font-mono text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <button
                                  onClick={handleEnable2FA}
                                  disabled={twoFactorSetup.verificationCode.length !== 6}
                                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Verify & Enable
                                </button>
                              </div>
                            </div>

                            <button
                              onClick={() => setTwoFactorSetup(prev => ({ ...prev, isSettingUp: false, verificationCode: "" }))}
                              className="text-sm text-muted-foreground hover:text-foreground"
                            >
                              Cancel setup
                            </button>
                          </div>
                        )}
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

                      <div className="space-y-3">
                        {[
                          { key: "showEmail", label: "Show Email on Profile", desc: "Allow others to see your email address" },
                          { key: "showPhone", label: "Show Phone on Profile", desc: "Allow others to see your phone number" },
                          { key: "dataSharing", label: "Data Sharing", desc: "Share anonymized data to improve our services" },
                        ].map((item) => (
                          <div key={item.key} className="flex items-start justify-between p-4 border border-border rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{item.label}</p>
                              <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
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

                      <button
                        onClick={handleSavePrivacy}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                        {isSaving ? "Saving..." : "Save Privacy Settings"}
                      </button>

                      {/* Danger Zone */}
                      <div className="border-t border-border pt-6 mt-8">
                        <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
                        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-foreground">Delete Account</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Permanently delete your account and all associated data. This action cannot be undone.
                              </p>
                            </div>
                            <button className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors ml-4 flex-shrink-0">
                              <Trash2 size={16} />
                              Delete Account
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                    </>
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